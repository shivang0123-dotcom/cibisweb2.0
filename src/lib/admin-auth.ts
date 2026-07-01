// Admin / staff authorisation.
//
// Auth is backed by Supabase Auth (email + password). A user is considered an
// admin only if:
//   1. They have a valid Supabase Auth session (verified server-side via getUser).
//   2. Their email exists in the public.admin_allowlist table.
//
// This double-check means even if a new Supabase account is somehow created,
// it cannot access the admin panel unless it is explicitly allowlisted.
// Add new admins by inserting their email into admin_allowlist BEFORE they sign up.

import { getSupabaseAuthClient, isSupabaseAuthConfigured } from "@/lib/supabase-auth-server";
import { getSupabaseServerClient } from "@/lib/supabase";

/** Whether a valid, allowlisted Supabase Auth user is attached to this request. */
export async function isAdminRequest() {
  if (!isSupabaseAuthConfigured()) return false;

  const supabase = await getSupabaseAuthClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) return false;

  // Enforce the allowlist: only pre-approved emails count as admin.
  const serviceClient = getSupabaseServerClient();
  if (serviceClient) {
    const { data } = await serviceClient
      .from("admin_allowlist")
      .select("email")
      .eq("email", user.email.toLowerCase())
      .maybeSingle();
    if (!data) return false;
  }

  return true;
}

// Staff = admin (the only authenticated staff role).
export async function isStaffRequest() {
  return isAdminRequest();
}
