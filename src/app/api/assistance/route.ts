import { NextResponse } from "next/server";
import { isStaffRequest } from "@/lib/admin-auth";
import { createCall, listCalls, resolveCall } from "@/lib/call-store";
import { getCurrentCustomerSession } from "@/lib/session-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const len = Number(request.headers.get("content-length") ?? 0);
  if (len > 256) {
    return NextResponse.json({ error: "Request payload too large." }, { status: 413 });
  }

  // Require a valid table session — prevents unauthenticated flood attacks.
  const session = await getCurrentCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "A valid table session is required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { tableNumber?: number };
  const tableNumber = Number(body.tableNumber);

  if (!Number.isFinite(tableNumber) || tableNumber <= 0) {
    return NextResponse.json({ error: "A valid table number is required." }, { status: 400 });
  }

  const call = await createCall(Math.floor(tableNumber));
  return NextResponse.json({ call }, { status: 201 });
}

export async function GET() {
  if (!(await isStaffRequest())) {
    return NextResponse.json({ error: "Staff access required." }, { status: 401 });
  }

  return NextResponse.json({ calls: await listCalls() });
}

export async function PATCH(request: Request) {
  if (!(await isStaffRequest())) {
    return NextResponse.json({ error: "Staff access required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { id?: string };

  if (!body.id) {
    return NextResponse.json({ error: "Missing call id." }, { status: 400 });
  }

  const call = await resolveCall(String(body.id));
  return NextResponse.json({ call });
}
