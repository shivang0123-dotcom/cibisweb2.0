-- ============================================================================
-- Circolo del Bridge — Phase 1 foundation migration
-- Targets the CURRENT live schema (verified via introspection 2026-06-24).
-- Safe to run on the existing database: every statement is idempotent and
-- additive. No tables are dropped. Existing rows are preserved.
--
-- What this migration does:
--   1. Fixes menu_items primary key type (uuid -> text) so the app's slug ids
--      (e.g. "bruschetta-pomodoro") persist. This is why menu edits were never
--      saving to Supabase.
--   2. Adds server-side customer-session security to public.sessions:
--      a per-session secret (client_token) held in an httpOnly cookie, plus
--      customer_name and last_seen_at owned by the server (not the browser).
--   3. Ensures restaurant_tables has a unique table_number and seeds tables 1-12.
--   4. Adds the indexes the order/session queries rely on.
--
-- Rollback guidance is documented inline next to each section.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. menu_items.id : uuid -> text
--    The table is effectively empty today (slug inserts have been rejected by
--    the uuid column), so the conversion is clean. id::text preserves any rows
--    that do exist. The uuid default is dropped because the app supplies its
--    own string ids.
--
--    ROLLBACK: only possible if every id is a valid uuid:
--      alter table public.menu_items alter column id type uuid using id::uuid;
--      alter table public.menu_items alter column id set default gen_random_uuid();
-- ----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'menu_items'
      and column_name = 'id'
      and data_type = 'uuid'
  ) then
    alter table public.menu_items alter column id drop default;
    alter table public.menu_items alter column id type text using id::text;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 2. Customer session security columns on public.sessions
--    client_token  : random secret stored ONLY in an httpOnly cookie; the
--                    server matches it to authorise every protected action.
--    customer_name : the diner's name, owned server-side and bound to the
--                    session (previously only lived in browser localStorage).
--    last_seen_at  : lets us expire/clean abandoned sessions later.
--
--    ROLLBACK:
--      drop index if exists public.sessions_client_token_key;
--      drop index if exists public.sessions_table_active_idx;
--      alter table public.sessions
--        drop column if exists client_token,
--        drop column if exists customer_name,
--        drop column if exists last_seen_at;
-- ----------------------------------------------------------------------------
alter table public.sessions add column if not exists client_token text;
alter table public.sessions add column if not exists customer_name text;
alter table public.sessions add column if not exists last_seen_at timestamptz not null default now();

-- Backfill a secret for any pre-existing session rows so the NOT NULL holds.
update public.sessions
set client_token = encode(gen_random_bytes(24), 'hex')
where client_token is null;

alter table public.sessions alter column client_token set not null;

create unique index if not exists sessions_client_token_key on public.sessions(client_token);
create index if not exists sessions_table_active_idx on public.sessions(table_number, is_active);

-- ----------------------------------------------------------------------------
-- 3. restaurant_tables: unique table_number + seed tables 1-12
--    The unique index makes the seed idempotent (on conflict do nothing).
--
--    ROLLBACK (only if you must):
--      delete from public.restaurant_tables where table_number between 1 and 12;
--      drop index if exists public.restaurant_tables_table_number_key;
-- ----------------------------------------------------------------------------
create unique index if not exists restaurant_tables_table_number_key
  on public.restaurant_tables(table_number);

insert into public.restaurant_tables (table_number, capacity, status)
select gs, 6, 'available'
from generate_series(1, 12) as gs
on conflict (table_number) do nothing;

-- ----------------------------------------------------------------------------
-- 4. Indexes for order / session lookups (no-ops if they already exist)
--    ROLLBACK: drop index if exists <name>;
-- ----------------------------------------------------------------------------
create index if not exists orders_session_id_idx   on public.orders(session_id);
create index if not exists orders_table_number_idx on public.orders(table_number);
create index if not exists orders_status_idx        on public.orders(status);
create index if not exists orders_created_at_idx    on public.orders(created_at desc);

-- ============================================================================
-- End Phase 1 foundation migration.
-- After running: the app's existing flows keep working; menu edits now persist;
-- the session table is ready for the server-side cookie security the Phase 1
-- code changes introduce.
-- ============================================================================
