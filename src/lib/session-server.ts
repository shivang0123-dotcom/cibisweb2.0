// Server-side customer-session ownership.
//
// Security model: when a diner arrives at a table they create a session. The
// server mints a random secret `client_token`, stores it on the session row,
// and returns it to the route handler which puts it in an httpOnly cookie the
// browser can never read. Every protected action (placing an order, reading an
// order's status) is authorised by matching that cookie back to a session row
// server-side. The client never supplies its own session id, table, or name —
// those are always derived from the cookie — so URLs and request bodies can't
// be manipulated to act as another customer.
//
// Mirrors the try-Supabase-then-in-memory pattern used by order-store.ts so the
// flow still works in local dev without Supabase configured.

import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase";

export const SESSION_COOKIE = "circolo_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

export type CustomerSession = {
  id: string;
  tableNumber: number;
  customerName: string | null;
  createdAt: string;
};

type SessionRow = {
  id: string;
  table_number: number;
  customer_name: string | null;
  client_token: string;
  is_active: boolean;
  created_at: string;
};

const sessionSelect = "id, table_number, customer_name, client_token, is_active, created_at";

const globalForSessions = globalThis as typeof globalThis & {
  __circoloSessions?: Map<string, SessionRow>;
};

function memStore() {
  if (!globalForSessions.__circoloSessions) {
    globalForSessions.__circoloSessions = new Map<string, SessionRow>();
  }
  return globalForSessions.__circoloSessions;
}

function randomToken(bytes = 24) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

function mapRow(row: SessionRow): CustomerSession {
  return {
    id: row.id,
    tableNumber: row.table_number,
    customerName: row.customer_name,
    createdAt: row.created_at,
  };
}

/**
 * Create a new customer session for a table. Returns the session plus the
 * secret token the caller must store in an httpOnly cookie.
 */
export async function createCustomerSession(
  tableNumber: number,
  customerName: string,
): Promise<{ session: CustomerSession; token: string }> {
  const token = randomToken();
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        table_number: tableNumber,
        customer_name: customerName,
        client_token: token,
        qr_code_token: randomToken(16), // satisfies the legacy NOT NULL/UNIQUE column
        is_active: true,
      })
      .select(sessionSelect)
      .single();

    if (!error && data) {
      return { session: mapRow(data as SessionRow), token };
    }
    if (error) {
      console.error("[session-server] createCustomerSession Supabase error:", error);
    }
  }

  console.warn("[session-server] createCustomerSession using in-memory fallback (Supabase unavailable or errored)");
  const row: SessionRow = {
    id: `sess-${randomToken(12)}`,
    table_number: tableNumber,
    customer_name: customerName,
    client_token: token,
    is_active: true,
    created_at: new Date().toISOString(),
  };
  memStore().set(token, row);
  return { session: mapRow(row), token };
}

/** Resolve the active session bound to the request's httpOnly cookie, if any. */
export async function getCurrentCustomerSession(): Promise<CustomerSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("sessions")
      .select(sessionSelect)
      .eq("client_token", token)
      .eq("is_active", true)
      .maybeSingle();

    if (!error) {
      if (!data) return null;
      // Server-side TTL: expire sessions older than SESSION_TTL_SECONDS regardless
      // of the cookie. Prevents stolen cookies from working indefinitely.
      const ageSeconds = (Date.now() - new Date((data as SessionRow).created_at).getTime()) / 1000;
      if (ageSeconds > SESSION_TTL_SECONDS) {
        await supabase.from("sessions").update({ is_active: false }).eq("client_token", token);
        return null;
      }
      return mapRow(data as SessionRow);
    }
    console.error("[session-server] getCurrentCustomerSession Supabase error:", error);
  }

  const row = memStore().get(token);
  return row && row.is_active ? mapRow(row) : null;
}

/** End the session bound to the current cookie (best effort). */
export async function endCurrentCustomerSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return;

  const supabase = getSupabaseServerClient();
  if (supabase) {
    await supabase
      .from("sessions")
      .update({ is_active: false, session_end: new Date().toISOString() })
      .eq("client_token", token);
  }

  const row = memStore().get(token);
  if (row) {
    memStore().set(token, { ...row, is_active: false });
  }
}
