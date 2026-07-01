import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createCustomerSession,
  endCurrentCustomerSession,
  getCurrentCustomerSession,
} from "@/lib/session-server";

export const dynamic = "force-dynamic";

// Best-effort IP rate limiter for session creation.
// Module-level state persists per serverless instance (not cross-instance, but
// effective enough for a single-restaurant app where physical QR access is
// required). Max 10 sessions per IP per hour.
const ipSessionLog = new Map<string, { count: number; resetAt: number }>();
const MAX_SESSIONS_PER_IP = 10;
const SESSION_RATE_WINDOW_MS = 60 * 60 * 1000;

function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function checkSessionRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipSessionLog.get(ip);
  if (!entry || now >= entry.resetAt) {
    ipSessionLog.set(ip, { count: 1, resetAt: now + SESSION_RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_SESSIONS_PER_IP) return false;
  entry.count++;
  return true;
}

type CreateSessionBody = {
  tableNumber?: number;
  customerName?: string;
};

const MAX_SESSION_BODY_BYTES = 512;

// POST /api/sessions — start a new customer session for a table.
// Sets the secret session token in an httpOnly cookie; never returns it.
export async function POST(request: Request) {
  const len = Number(request.headers.get("content-length") ?? 0);
  if (len > MAX_SESSION_BODY_BYTES) {
    return NextResponse.json({ error: "Request payload too large." }, { status: 413 });
  }

  const ip = getClientIp(request);
  if (!checkSessionRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many sessions created from this device. Please try again later." },
      { status: 429 },
    );
  }

  let body: CreateSessionBody;
  try {
    body = (await request.json()) as CreateSessionBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const tableNumber = Number(body.tableNumber);
  if (!Number.isFinite(tableNumber) || tableNumber < 1) {
    return NextResponse.json({ error: "A valid table number is required." }, { status: 400 });
  }

  const customerName = String(body.customerName ?? "").trim().slice(0, 60);
  if (!customerName) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }

  const { session, token } = await createCustomerSession(Math.floor(tableNumber), customerName);

  const response = NextResponse.json({ session }, { status: 201 });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}

// GET /api/sessions — "who am I": the active session bound to this cookie.
export async function GET() {
  const session = await getCurrentCustomerSession();
  return NextResponse.json({ session });
}

// DELETE /api/sessions — end the current session and clear the cookie.
export async function DELETE() {
  await endCurrentCustomerSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
