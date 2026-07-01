-- ============================================================================
-- Circolo del Bridge — Restore auto-numbering on orders.order_number
--
-- THE BUG THIS FIXES
-- On the live database `orders.order_number` is `integer NOT NULL` with NO
-- default (the GENERATED ALWAYS AS IDENTITY property from schema.sql was lost
-- when the elaborate schema was layered on top). The application's
-- toOrderInsert() intentionally omits order_number, expecting the database to
-- generate it. With no default, every INSERT fails:
--   null value in column "order_number" violates not-null constraint
-- The failure is swallowed and the order falls back to the in-memory store —
-- which is why live orders have ids like "order-…" and numbers from 1100, and
-- never appear in Supabase or the admin dashboard.
--
-- This attaches a sequence as the column default so inserts auto-number again,
-- starting at 1000 (or above any existing order_number already in the table).
--
-- ROLLBACK:
--   alter table public.orders alter column order_number drop default;
--   drop sequence if exists public.orders_order_number_seq;
-- ============================================================================

create sequence if not exists public.orders_order_number_seq as integer start with 1000;

-- Make sure the sequence is ahead of any numbers already in the table.
select setval(
  'public.orders_order_number_seq',
  greatest(1000, coalesce((select max(order_number) from public.orders), 999) + 1),
  false
);

alter table public.orders
  alter column order_number set default nextval('public.orders_order_number_seq');

-- Tie the sequence's lifecycle to the column.
alter sequence public.orders_order_number_seq owned by public.orders.order_number;

-- ============================================================================
-- VERIFY: place a test order on the live site, then:
--   select id, order_number, table_number, status, created_at
--   from public.orders order by created_at desc limit 5;
--   -- Expect: id is a bare uuid (NOT "order-…"), order_number >= 1000.
-- ============================================================================
