"use client";

// Client helpers for the customer session. The session itself lives in an
// httpOnly cookie the browser cannot read — these helpers just talk to
// /api/sessions, which is the single source of truth. There is deliberately no
// localStorage token here: ownership is enforced server-side.

export type CustomerSession = {
  id: string;
  tableNumber: number;
  customerName: string | null;
};

/** Start a session for a table. The server sets the httpOnly session cookie. */
export async function createSession(
  tableNumber: number,
  customerName: string,
): Promise<CustomerSession> {
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tableNumber, customerName }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Could not start your session. Please try again.");
  }

  const { session } = (await response.json()) as { session: CustomerSession };
  return session;
}

/** The active session bound to this browser's cookie, or null. */
export async function getCurrentSession(): Promise<CustomerSession | null> {
  try {
    const response = await fetch("/api/sessions", { cache: "no-store" });
    if (!response.ok) return null;
    const { session } = (await response.json()) as { session: CustomerSession | null };
    return session ?? null;
  } catch {
    return null;
  }
}

/** End the current session (clears the cookie server-side). */
export async function endSession(): Promise<void> {
  try {
    await fetch("/api/sessions", { method: "DELETE" });
  } catch {
    // best effort
  }
}
