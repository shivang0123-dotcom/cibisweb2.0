import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getTables, setTableFlags } from "@/lib/tables-store";

export const dynamic = "force-dynamic";

// GET /api/tables — the floor plan. Public: capacity is informational and the
// QR URLs are printed in the restaurant anyway.
export async function GET() {
  return NextResponse.json({ tables: await getTables() });
}

// PATCH /api/tables — staff toggle a table's active / occupied flags.
export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { tableNumber?: number; active?: boolean; occupied?: boolean }
    | null;

  const tableNumber = Number(body?.tableNumber);
  if (!Number.isFinite(tableNumber)) {
    return NextResponse.json({ error: "A valid table number is required." }, { status: 400 });
  }

  const table = await setTableFlags(tableNumber, {
    active: typeof body?.active === "boolean" ? body.active : undefined,
    occupied: typeof body?.occupied === "boolean" ? body.occupied : undefined,
  });

  if (!table) {
    return NextResponse.json({ error: "Table not found." }, { status: 404 });
  }

  return NextResponse.json({ table });
}
