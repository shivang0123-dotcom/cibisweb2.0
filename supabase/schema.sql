create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number integer generated always as identity (start with 1000 increment by 1),
  table_number integer not null check (table_number > 0),
  status text not null default 'pending' check (status in ('pending', 'preparing', 'ready', 'served', 'rejected', 'cancel_requested', 'cancelled')),
  items jsonb not null,
  total_cents integer not null check (total_cents >= 0),
  prep_minutes integer not null default 18,
  customer_note text,
  accepted_at timestamptz,
  rejected_at timestamptz,
  cancel_requested_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id text primary key,
  title text not null,
  description text not null,
  price_cents integer not null check (price_cents >= 0),
  category text not null,
  image_url text not null,
  tags text[] not null default '{}',
  available boolean not null default true,
  prep_minutes integer not null default 10,
  updated_at timestamptz not null default now()
);

create table if not exists public.weekly_menu_plans (
  id text primary key default 'default',
  plan jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at
before update on public.menu_items
for each row execute function public.set_updated_at();

drop trigger if exists weekly_menu_plans_set_updated_at on public.weekly_menu_plans;
create trigger weekly_menu_plans_set_updated_at
before update on public.weekly_menu_plans
for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.menu_items enable row level security;
alter table public.weekly_menu_plans enable row level security;

drop policy if exists "Guests can create orders" on public.orders;
create policy "Guests can create orders"
on public.orders for insert
to anon
with check (true);

drop policy if exists "Guests can read their live order board" on public.orders;
create policy "Guests can read their live order board"
on public.orders for select
to anon
using (true);

drop policy if exists "Staff can update order status" on public.orders;
create policy "Staff can update order status"
on public.orders for update
to anon
using (true)
with check (status in ('pending', 'preparing', 'ready', 'served', 'rejected', 'cancel_requested', 'cancelled'));

drop policy if exists "Guests can read menu" on public.menu_items;
create policy "Guests can read menu"
on public.menu_items for select
to anon
using (available = true);

drop policy if exists "Staff can insert menu" on public.menu_items;
create policy "Staff can insert menu"
on public.menu_items for insert
to anon
with check (true);

drop policy if exists "Staff can update menu" on public.menu_items;
create policy "Staff can update menu"
on public.menu_items for update
to anon
using (true)
with check (true);

drop policy if exists "Guests can read weekly menu plan" on public.weekly_menu_plans;
create policy "Guests can read weekly menu plan"
on public.weekly_menu_plans for select
to anon
using (id = 'default');

drop policy if exists "Staff can upsert weekly menu plan" on public.weekly_menu_plans;
create policy "Staff can upsert weekly menu plan"
on public.weekly_menu_plans for insert
to anon
with check (id = 'default');

drop policy if exists "Staff can update weekly menu plan" on public.weekly_menu_plans;
create policy "Staff can update weekly menu plan"
on public.weekly_menu_plans for update
to anon
using (id = 'default')
with check (id = 'default');

alter publication supabase_realtime add table public.orders;
