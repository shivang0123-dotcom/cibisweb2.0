import { NextResponse } from "next/server";
import { getSupabaseAuthClient, isSupabaseAuthConfigured } from "@/lib/supabase-auth-server";
import { checkRateLimit, clearFailures, clientKey, registerFailure } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function tooManyAttemptsMessage(retryAfterSec: number) {
  const minutes = Math.max(1, Math.ceil(retryAfterSec / 60));
  return `Too many attempts. Please wait about ${minutes} minute${minutes === 1 ? "" : "s"} and try again.`;
}

export async function POST(request: Request) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json(
      { error: "Admin login is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." },
      { status: 503 },
    );
  }

  const key = clientKey(request, "admin-login");

  const limit = await checkRateLimit(key);
  if (limit.blocked) {
    return NextResponse.json({ error: tooManyAttemptsMessage(limit.retryAfterSec) }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  // Signing in on the cookie-bound client sets the auth session cookies on the
  // response, so subsequent requests are authenticated.
  const supabase = await getSupabaseAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    await registerFailure(key);
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await clearFailures(key);
  return NextResponse.json({ ok: true });
}
