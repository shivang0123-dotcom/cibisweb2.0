import { NextResponse } from "next/server";
import { isStaffRequest } from "@/lib/admin-auth";
import { createOrder, getOrder, listOrders, requestOrderCancellation, updateOrderStatus } from "@/lib/order-store";
import { getCurrentCustomerSession } from "@/lib/session-server";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { OrderStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8 * 1024; // 8 KB — far more than any legitimate order payload

function rejectOversizedBody(request: Request) {
  const len = Number(request.headers.get("content-length") ?? 0);
  if (len > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request payload too large." }, { status: 413 });
  }
  return null;
}

const FOREIGN_SESSION_MESSAGE =
  "This session belongs to another customer and cannot be accessed.";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("id");

  if (orderId) {
    const order = await getOrder(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Staff can read any order. A customer may only read an order that belongs
    // to their own cookie-bound session — ownership is validated server-side.
    if (!(await isStaffRequest())) {
      const session = await getCurrentCustomerSession();
      if (!session || order.sessionId !== session.id) {
        return NextResponse.json({ error: FOREIGN_SESSION_MESSAGE }, { status: 403 });
      }
    }

    return NextResponse.json({ order });
  }

  if (!(await isStaffRequest())) {
    return NextResponse.json({ error: "Staff access required." }, { status: 401 });
  }

  const orders = await listOrders();
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const oversize = rejectOversizedBody(request);
  if (oversize) return oversize;

  try {
    // The session — and therefore the table, customer name, and ownership — is
    // derived from the httpOnly cookie, never from the request body. This is
    // what prevents URL/body manipulation and session hijacking.
    const session = await getCurrentCustomerSession();
    if (!session) {
      return NextResponse.json(
        { error: "No active session. Please rescan the table QR code." },
        { status: 401 },
      );
    }

    // Rate limit: max 5 orders per session per 5 minutes.
    const supabaseForLimit = getSupabaseServerClient();
    if (supabaseForLimit && session.id) {
      const windowStart = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count } = await supabaseForLimit
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("session_id", session.id)
        .gte("created_at", windowStart);
      if ((count ?? 0) >= 5) {
        return NextResponse.json(
          { error: "Too many orders placed recently. Please wait a few minutes before ordering again." },
          { status: 429 },
        );
      }
    }

    const body = (await request.json()) as {
      note?: string;
      items?: Array<{ id: string; quantity: number }>;
    };

    const order = await createOrder({
      tableNumber: session.tableNumber,
      sessionId: session.id,
      customerName: session.customerName ?? undefined,
      note: body.note,
      items: body.items ?? [],
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create order.",
      },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");
    const body = (await request.json()) as { action?: "request-cancel"; status?: OrderStatus; prepMinutes?: number };

    if (!orderId) {
      return NextResponse.json({ error: "Missing order id." }, { status: 400 });
    }

    if (body.action === "request-cancel") {
      // A customer may only cancel an order that belongs to their own session.
      const existing = await getOrder(orderId);
      if (!existing) {
        return NextResponse.json({ error: "Order not found." }, { status: 404 });
      }

      if (!(await isStaffRequest())) {
        const session = await getCurrentCustomerSession();
        if (!session || existing.sessionId !== session.id) {
          return NextResponse.json({ error: FOREIGN_SESSION_MESSAGE }, { status: 403 });
        }
      }

      const order = await requestOrderCancellation(orderId);
      if (!order) {
        return NextResponse.json({ error: "Order not found." }, { status: 404 });
      }

      return NextResponse.json({ order });
    }

    if (!(await isStaffRequest())) {
      return NextResponse.json({ error: "Staff access required." }, { status: 401 });
    }

    if (!body.status) {
      return NextResponse.json({ error: "Missing status." }, { status: 400 });
    }

    const order = await updateOrderStatus(orderId, body.status, { prepMinutes: body.prepMinutes });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to update order.",
      },
      { status: 400 },
    );
  }
}
