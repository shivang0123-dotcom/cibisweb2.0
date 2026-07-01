// Restaurant table configuration — the single source of truth for the QR table
// system. Tables are read from the database so the floor plan can grow (5 today,
// 20 tomorrow) without code changes: staff just add rows to restaurant_tables.
//
// Mirrors the try-Supabase-then-in-memory pattern used by the other stores so
// the app keeps working in local dev without Supabase configured.

import { getSupabaseServerClient } from "@/lib/supabase";

export type RestaurantTable = {
  id: string;
  tableNumber: number;
  displayName: string;
  capacity: number;
  active: boolean;
  occupied: boolean;
  qrUrl: string;
};

type TableRow = {
  id: string;
  table_number: number;
  display_name: string | null;
  capacity: number;
  active: boolean | null;
  occupied: boolean | null;
  qr_url: string | null;
};

const tableSelect = "id, table_number, display_name, capacity, active, occupied, qr_url";

// Fallback config used only when Supabase is unavailable (local dev). Mirrors
// the production seed so the customer flow still works offline.
const defaultTables: RestaurantTable[] = [
  { id: "t1", tableNumber: 1, displayName: "Table 1", capacity: 14, active: true, occupied: false, qrUrl: "/table/1" },
  { id: "t2", tableNumber: 2, displayName: "Table 2", capacity: 6, active: true, occupied: false, qrUrl: "/table/2" },
  { id: "t3", tableNumber: 3, displayName: "Table 3", capacity: 6, active: true, occupied: false, qrUrl: "/table/3" },
  { id: "t4", tableNumber: 4, displayName: "Table 4", capacity: 6, active: true, occupied: false, qrUrl: "/table/4" },
  { id: "t5", tableNumber: 5, displayName: "Table 5", capacity: 2, active: true, occupied: false, qrUrl: "/table/5" },
];

function mapRow(row: TableRow): RestaurantTable {
  return {
    id: row.id,
    tableNumber: row.table_number,
    displayName: row.display_name ?? `Table ${row.table_number}`,
    capacity: row.capacity,
    active: row.active ?? true,
    occupied: row.occupied ?? false,
    qrUrl: row.qr_url ?? `/table/${row.table_number}`,
  };
}

/** All configured tables, ordered by number. Read from the database. */
export async function getTables(): Promise<RestaurantTable[]> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("restaurant_tables")
      .select(tableSelect)
      .order("table_number", { ascending: true });

    if (!error && data) {
      return (data as TableRow[]).map(mapRow);
    }
    if (error) console.error("[tables-store] getTables Supabase error:", error);
  }

  return defaultTables;
}

/** A single table by its number, or null if no such table exists. */
export async function getTable(tableNumber: number): Promise<RestaurantTable | null> {
  if (!Number.isFinite(tableNumber)) return null;
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("restaurant_tables")
      .select(tableSelect)
      .eq("table_number", tableNumber)
      .maybeSingle();

    if (!error) {
      return data ? mapRow(data as TableRow) : null;
    }
    console.error("[tables-store] getTable Supabase error:", error);
  }

  return defaultTables.find((table) => table.tableNumber === tableNumber) ?? null;
}

/** Toggle the active / occupied flags for a table (staff management). */
export async function setTableFlags(
  tableNumber: number,
  flags: { active?: boolean; occupied?: boolean },
): Promise<RestaurantTable | null> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const patch: Record<string, boolean> = {};
    if (typeof flags.active === "boolean") patch.active = flags.active;
    if (typeof flags.occupied === "boolean") patch.occupied = flags.occupied;

    if (Object.keys(patch).length > 0) {
      const { data, error } = await supabase
        .from("restaurant_tables")
        .update(patch)
        .eq("table_number", tableNumber)
        .select(tableSelect)
        .maybeSingle();

      if (!error && data) return mapRow(data as TableRow);
      if (error) console.error("[tables-store] setTableFlags Supabase error:", error);
    }
  }

  return getTable(tableNumber);
}
