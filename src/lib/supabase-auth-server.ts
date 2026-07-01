// Cookie-bound Supabase Auth client for the server (route handlers + server
// actions). This is separate from getSupabaseServerClient() in supabase.ts:
//   - supabase.ts uses the SERVICE ROLE key for trusted DB reads/writes and has
//     no user context (it bypasses RLS).
//   - this client uses the ANON key and is bound to the request's cookies, so it
//     reads/writes the logged-in admin's auth session. It is what gates the
//     admin panel now that the PIN has been replaced by real Supabase Auth.
//
// The admin model is intentionally simple: ANY user with a valid Supabase Auth
// session is treated as an admin. Public sign-ups must stay disabled in the
// Supabase dashboard so the only accounts that exist are the ones you create.

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function isSupabaseAuthConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * A Supabase client wired to the current request's cookies. In route handlers
 * and server actions the cookie writes (sign-in / token refresh / sign-out)
 * propagate to the response. In a server component the write throws and is
 * ignored — auth changes there must happen via a route handler or action.
 */
export async function getSupabaseAuthClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              // Make the auth cookies SESSION cookies: strip maxAge/expires so the
              // browser keeps them only while it's open and drops them when the
              // tab/app is fully closed. That forces the admin to sign in again on
              // the next launch instead of staying signed in indefinitely.
              const sessionOptions = { ...options };
              delete sessionOptions.maxAge;
              delete sessionOptions.expires;
              cookieStore.set(name, value, sessionOptions);
            }
          } catch {
            // Called from a Server Component where cookies are read-only; safe
            // to ignore because session refresh also happens in route handlers.
          }
        },
      },
    },
  );
}
