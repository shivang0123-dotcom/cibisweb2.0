-- ============================================================================
-- Circolo del Bridge — Schema constraint fix (run BEFORE migrations 0001–0003)
--
-- The live database was built by running two incompatible schema files.
-- The result is several NOT NULL columns with no defaults that the application
-- never fills in — causing every session INSERT and every order INSERT to fail
-- silently and fall back to an in-memory store that does not survive across
-- Vercel function invocations.
--
-- SYMPTOMS:
--   - orders table is always empty in Supabase
--   - admin dashboard shows no orders
--   - customers get "No active session" on Vercel (not locally, because local
--     dev uses one process so in-memory sessions persist within the same request)
--
-- ROOT CAUSE CHAIN:
--   1. sessions.table_id NOT NULL, no default → session INSERT fails
--   2. sessions.client_token does not exist → session INSERT fails (wrong col)
--   3. Sessions fall to in-memory store, which is per-function-instance
--   4. The Vercel function that handles POST /api/orders is a DIFFERENT instance
--   5. getCurrentCustomerSession() finds no session in its memory → returns null
--   6. POST /api/orders returns 401 "No active session" → no order written
--
--   Even if sessions somehow worked, orders would also fail:
--   7. orders.session_id is uuid NOT NULL — code stores text IDs, cast fails
--   8. orders.table_id uuid NOT NULL — code never provides this column
--   9. orders.customer_name text NOT NULL — code allows null/undefined names
--
-- RUN ORDER: this file first, then 0001, 0002, 0003.
--
-- ROLLBACK (undo nullable changes — only if explicitly needed):
--   alter table public.sessions alter column table_id set not null;
--   alter table public.orders alter column table_id set not null;
--   alter table public.orders alter column customer_name set not null;
--   alter table public.orders alter column session_id type uuid using session_id::uuid;
--   alter table public.orders alter column session_id set not null;
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. sessions — add client_token security column, make table_id nullable
-- ----------------------------------------------------------------------------

alter table public.sessions
  add column if not exists client_token text,
  add column if not exists customer_name text,
  add column if not exists last_seen_at timestamptz not null default now();

-- table_id is a legacy FK from the elaborate schema; the app identifies
-- sessions by table_number (integer), never by table_id (uuid).
alter table public.sessions alter column table_id drop not null;

-- Backfill a random secret for any pre-existing session rows.
update public.sessions
  set client_token = encode(gen_random_bytes(24), 'hex')
  where client_token is null;

-- Enforce uniqueness — the server matches the httpOnly cookie value to this.
alter table public.sessions alter column client_token set not null;

create unique index if not exists sessions_client_token_key
  on public.sessions(client_token);

create index if not exists sessions_table_active_idx
  on public.sessions(table_number, is_active);

-- ----------------------------------------------------------------------------
-- 2. orders — fix column types and drop legacy NOT NULL constraints
-- ----------------------------------------------------------------------------

-- session_id: the app stores the session's primary key as a text value. The
-- column was uuid NOT NULL, which rejects both in-memory text IDs and causes
-- a NOT NULL violation when no session context is available.
-- Drop the FK before changing the type (FK requires matching types).
-- The app does soft session ownership via the httpOnly cookie, not a DB FK.
alter table public.orders
  drop constraint if exists orders_session_id_fkey;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'session_id'
      and data_type = 'uuid'
  ) then
    alter table public.orders
      alter column session_id type text using session_id::text;
  end if;
end $$;

alter table public.orders alter column session_id drop not null;

-- table_id: legacy FK from the elaborate schema; the app uses table_number.
alter table public.orders alter column table_id drop not null;

-- customer_name: the app allows anonymous ordering (name is optional).
alter table public.orders alter column customer_name drop not null;

-- Indexes for the order queries (no-ops if they already exist).
create index if not exists orders_session_id_idx   on public.orders(session_id);
create index if not exists orders_table_number_idx on public.orders(table_number);
create index if not exists orders_status_idx        on public.orders(status);
create index if not exists orders_created_at_idx    on public.orders(created_at desc);

-- ============================================================================
-- After running this migration, run 0001 → 0002 → 0003 in order.
-- Verify with:
--   select count(*) from public.sessions;
--   select count(*) from public.orders;
-- Place a test order on the live site and confirm both counts increase.
-- ============================================================================
