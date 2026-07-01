import { NextResponse } from "next/server";
import { getSupabaseAuthClient } from "@/lib/supabase-auth-server";

export const dynamic = "force-dynamic";

export async function POST() {
  // signOut clears the Supabase auth session cookies on the response.
  const supabase = await getSupabaseAuthClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
