-- ============================================================================
-- Circolo del Bridge — Phase 2 migration: RLS lockdown
--
-- WHAT THIS FIXES
-- The committed schema shipped permissive policies (to anon … using(true)),
-- meaning anyone holding the public NEXT_PUBLIC_SUPABASE_ANON_KEY could read
-- and write your tables directly via the Supabase REST API, bypassing the app.
-- This migration removes every policy on the app's tables and leaves RLS
-- enabled with NO policies, so the anon/authenticated roles are denied all
-- access. The app keeps working because the server talks to Supabase with the
-- SERVICE ROLE key, which has BYPASSRLS.
--
-- ⚠️  PREREQUISITE — READ BEFORE RUNNING ⚠️
-- The app MUST be using the service-role key on the server, or this will break
-- all database access. Confirm SUPABASE_SERVICE_ROLE_KEY is set in Vercel
-- (Production + Preview). After running, smoke-test the live site: place an
-- order and edit a menu item. If both work, the service role is wired correctly.
--
-- ROLLBACK (re-open anon access to the live order board / menu) is at the
-- bottom of this file, commented out.
-- ============================================================================

do $$
declare
  pol record;
  tbl text;
  target_tables text[] := array[
    'orders',
    'menu_items',
    'weekly_menu_plans',
    'sessions',
    'restaurant_tables'
  ];
begin
  foreach tbl in array target_tables loop
    if to_regclass('public.' || tbl) is not null then
      -- Drop every existing policy on the table (named differently across the
      -- various schema runs), so no permissive anon rule survives.
      for pol in
        select policyname
        from pg_policies
        where schemaname = 'public' and tablename = tbl
      loop
        execute format('drop policy if exists %I on public.%I', pol.policyname, tbl);
      end loop;

      -- Enable RLS. With RLS on and no policies, anon + authenticated get zero
      -- access; the service role (BYPASSRLS) is unaffected.
      execute format('alter table public.%I enable row level security', tbl);
    end if;
  end loop;
end $$;

-- Optional belt-and-suspenders: also revoke direct table grants from the public
-- API roles. RLS already blocks them, so this is defense-in-depth. Uncomment if
-- you want it (safe — the server uses the service role, not these):
--
-- do $$
-- declare tbl text; target_tables text[] := array['orders','menu_items','weekly_menu_plans','sessions','restaurant_tables'];
-- begin
--   foreach tbl in array target_tables loop
--     if to_regclass('public.'||tbl) is not null then
--       execute format('revoke all on public.%I from anon, authenticated', tbl);
--     end if;
--   end loop;
-- end $$;

-- ============================================================================
-- VERIFY (run separately after the migration):
--   select tablename, rowsecurity,
--          (select count(*) from pg_policies p where p.schemaname='public' and p.tablename=t.tablename) as policy_count
--   from pg_tables t
--   where schemaname='public'
--     and tablename in ('orders','menu_items','weekly_menu_plans','sessions','restaurant_tables');
--   -- Expect: rowsecurity = true and policy_count = 0 for every row.
-- ============================================================================

-- ============================================================================
-- ROLLBACK (only if the service role turns out NOT to be configured and the app
-- breaks — this re-opens anon read/write like before):
--
--   create policy "anon read orders" on public.orders for select to anon using (true);
--   create policy "anon insert orders" on public.orders for insert to anon with check (true);
--   create policy "anon update orders" on public.orders for update to anon using (true) with check (true);
--   create policy "anon read menu" on public.menu_items for select to anon using (true);
--   create policy "anon read weekly plan" on public.weekly_menu_plans for select to anon using (true);
--   -- (sessions/restaurant_tables had no anon policies worth restoring)
-- ============================================================================
