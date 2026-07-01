create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'table_status' and typnamespace = 'public'::regnamespace) then
    create type public.table_status as enum (
      'empty',
      'occupied',
      'ordering',
      'eating',
      'cleaning',
      'reserved'
    );
  end if;
end $$;

alter type public.table_status add value if not exists 'empty';
alter type public.table_status add value if not exists 'occupied';
alter type public.table_status add value if not exists 'ordering';
alter type public.table_status add value if not exists 'eating';
alter type public.table_status add value if not exists 'cleaning';
alter type public.table_status add value if not exists 'reserved';

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status' and typnamespace = 'public'::regnamespace) then
    create type public.order_status as enum (
      'received',
      'accepted',
      'estimating_time',
      'preparing',
      'ready_for_review',
      'being_served',
      'completed',
      'cancelled'
    );
  end if;
end $$;

alter type public.order_status add value if not exists 'received';
alter type public.order_status add value if not exists 'accepted';
alter type public.order_status add value if not exists 'estimating_time';
alter type public.order_status add value if not exists 'preparing';
alter type public.order_status add value if not exists 'ready_for_review';
alter type public.order_status add value if not exists 'being_served';
alter type public.order_status add value if not exists 'completed';
alter type public.order_status add value if not exists 'cancelled';

do $$
begin
  if not exists (select 1 from pg_type where typname = 'chef_status' and typnamespace = 'public'::regnamespace) then
    create type public.chef_status as enum (
      'waiting',
      'preparing',
      'finished',
      'needs_attention'
    );
  end if;
end $$;

alter type public.chef_status add value if not exists 'waiting';
alter type public.chef_status add value if not exists 'preparing';
alter type public.chef_status add value if not exists 'finished';
alter type public.chef_status add value if not exists 'needs_attention';

do $$
begin
  if not exists (select 1 from pg_type where typname = 'notification_type' and typnamespace = 'public'::regnamespace) then
    create type public.notification_type as enum (
      'new_order',
      'chef_finished',
      'order_served',
      'problem_reported',
      'timer_finished',
      'admin_returned_order'
    );
  end if;
end $$;

alter type public.notification_type add value if not exists 'new_order';
alter type public.notification_type add value if not exists 'chef_finished';
alter type public.notification_type add value if not exists 'order_served';
alter type public.notification_type add value if not exists 'problem_reported';
alter type public.notification_type add value if not exists 'timer_finished';
alter type public.notification_type add value if not exists 'admin_returned_order';

create table if not exists public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  table_number integer unique not null,
  qr_code text,
  is_active boolean not null default true,
  status public.table_status not null default 'empty',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_it text,
  display_order integer not null default 0,
  icon text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dishes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_en text not null,
  title_it text,
  description_en text not null,
  description_it text,
  story_en text,
  story_it text,
  price_eur numeric(10,2) not null check (price_eur >= 0),
  preparation_minutes integer not null default 0 check (preparation_minutes >= 0),
  calories integer check (calories >= 0),
  servings integer not null default 1 check (servings > 0),
  image_url text,
  category_id uuid not null references public.menu_categories(id) on delete restrict,
  chef_pick boolean not null default false,
  is_popular boolean not null default false,
  is_available boolean not null default true,
  allergens jsonb not null default '[]'::jsonb,
  dietary_tags jsonb not null default '[]'::jsonb,
  ingredients jsonb not null default '[]'::jsonb,
  nutrition jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weekly_menu (
  id uuid primary key default gen_random_uuid(),
  weekday integer not null check (weekday between 1 and 7),
  dish_id uuid not null references public.dishes(id) on delete cascade,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  unique (weekday, dish_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number integer generated by default as identity unique,
  table_id uuid not null references public.restaurant_tables(id) on delete restrict,
  total_price numeric(10,2) not null default 0 check (total_price >= 0),
  customer_notes text,
  status public.order_status not null default 'received',
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  preparing_at timestamptz,
  ready_for_review_at timestamptz,
  being_served_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  dish_id uuid not null references public.dishes(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  total_price numeric(10,2) not null check (total_price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.chef_tasks (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  chef_status public.chef_status not null default 'waiting',
  duration_minutes integer check (duration_minutes > 0),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.chef_notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_feedback (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  feedback text,
  created_at timestamptz not null default now()
);

create table if not exists public.sales_summary (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  orders_count integer not null default 0,
  sales_total numeric(10,2) not null default 0,
  cash_collected numeric(10,2) not null default 0,
  cash_pending numeric(10,2) not null default 0,
  avg_preparation_time integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  language_default text not null default 'en',
  restaurant_open boolean not null default true,
  ordering_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Compatibility layer for databases that already have older Circolo tables.
-- CREATE TABLE IF NOT EXISTS does not add missing columns, so these ALTERs make
-- rerunning this migration safe against the previous app schema.
alter table public.restaurant_tables add column if not exists qr_code text;
alter table public.restaurant_tables add column if not exists is_active boolean default true;
alter table public.restaurant_tables add column if not exists status public.table_status default 'empty';
alter table public.restaurant_tables add column if not exists created_at timestamptz default now();
alter table public.restaurant_tables add column if not exists updated_at timestamptz default now();

alter table public.menu_categories add column if not exists name_en text;
alter table public.menu_categories add column if not exists name_it text;
alter table public.menu_categories add column if not exists display_order integer default 0;
alter table public.menu_categories add column if not exists icon text;
alter table public.menu_categories add column if not exists is_active boolean default true;
alter table public.menu_categories add column if not exists created_at timestamptz default now();
alter table public.menu_categories add column if not exists updated_at timestamptz default now();

alter table public.dishes add column if not exists slug text;
alter table public.dishes add column if not exists title_en text;
alter table public.dishes add column if not exists title_it text;
alter table public.dishes add column if not exists description_en text;
alter table public.dishes add column if not exists description_it text;
alter table public.dishes add column if not exists story_en text;
alter table public.dishes add column if not exists story_it text;
alter table public.dishes add column if not exists price_eur numeric(10,2) default 0;
alter table public.dishes add column if not exists preparation_minutes integer default 0;
alter table public.dishes add column if not exists calories integer;
alter table public.dishes add column if not exists servings integer default 1;
alter table public.dishes add column if not exists image_url text;
alter table public.dishes add column if not exists category_id uuid references public.menu_categories(id) on delete restrict;
alter table public.dishes add column if not exists chef_pick boolean default false;
alter table public.dishes add column if not exists is_popular boolean default false;
alter table public.dishes add column if not exists is_available boolean default true;
alter table public.dishes add column if not exists allergens jsonb default '[]'::jsonb;
alter table public.dishes add column if not exists dietary_tags jsonb default '[]'::jsonb;
alter table public.dishes add column if not exists ingredients jsonb default '[]'::jsonb;
alter table public.dishes add column if not exists nutrition jsonb default '{}'::jsonb;
alter table public.dishes add column if not exists created_at timestamptz default now();
alter table public.dishes add column if not exists updated_at timestamptz default now();

alter table public.weekly_menu add column if not exists weekday integer;
alter table public.weekly_menu add column if not exists dish_id uuid references public.dishes(id) on delete cascade;
alter table public.weekly_menu add column if not exists is_featured boolean default false;
alter table public.weekly_menu add column if not exists created_at timestamptz default now();

alter table public.orders add column if not exists table_id uuid references public.restaurant_tables(id) on delete restrict;
alter table public.orders add column if not exists total_price numeric(10,2) default 0;
alter table public.orders add column if not exists customer_notes text;
alter table public.orders add column if not exists accepted_at timestamptz;
alter table public.orders add column if not exists preparing_at timestamptz;
alter table public.orders add column if not exists ready_for_review_at timestamptz;
alter table public.orders add column if not exists being_served_at timestamptz;
alter table public.orders add column if not exists completed_at timestamptz;
alter table public.orders add column if not exists created_at timestamptz default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'total_cents'
  ) then
    update public.orders
    set total_price = round((total_cents::numeric / 100), 2)
    where coalesce(total_price, 0) = 0;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'customer_note'
  ) then
    update public.orders
    set customer_notes = customer_note
    where customer_notes is null
      and customer_note is not null;
  end if;
end $$;

alter table public.order_items add column if not exists order_id uuid references public.orders(id) on delete cascade;
alter table public.order_items add column if not exists dish_id uuid references public.dishes(id) on delete restrict;
alter table public.order_items add column if not exists quantity integer default 1;
alter table public.order_items add column if not exists unit_price numeric(10,2) default 0;
alter table public.order_items add column if not exists total_price numeric(10,2) default 0;
alter table public.order_items add column if not exists created_at timestamptz default now();

alter table public.chef_tasks add column if not exists order_id uuid references public.orders(id) on delete cascade;
alter table public.chef_tasks add column if not exists chef_status public.chef_status default 'waiting';
alter table public.chef_tasks add column if not exists duration_minutes integer;
alter table public.chef_tasks add column if not exists started_at timestamptz;
alter table public.chef_tasks add column if not exists finished_at timestamptz;
alter table public.chef_tasks add column if not exists created_at timestamptz default now();
alter table public.chef_tasks add column if not exists updated_at timestamptz default now();

alter table public.admin_notifications add column if not exists order_id uuid references public.orders(id) on delete cascade;
alter table public.admin_notifications add column if not exists type public.notification_type default 'new_order';
alter table public.admin_notifications add column if not exists title text;
alter table public.admin_notifications add column if not exists message text;
alter table public.admin_notifications add column if not exists is_read boolean default false;
alter table public.admin_notifications add column if not exists created_at timestamptz default now();

alter table public.chef_notifications add column if not exists order_id uuid references public.orders(id) on delete cascade;
alter table public.chef_notifications add column if not exists title text;
alter table public.chef_notifications add column if not exists message text;
alter table public.chef_notifications add column if not exists is_read boolean default false;
alter table public.chef_notifications add column if not exists created_at timestamptz default now();

alter table public.customer_feedback add column if not exists order_id uuid references public.orders(id) on delete cascade;
alter table public.customer_feedback add column if not exists rating integer;
alter table public.customer_feedback add column if not exists feedback text;
alter table public.customer_feedback add column if not exists created_at timestamptz default now();

alter table public.sales_summary add column if not exists date date;
alter table public.sales_summary add column if not exists orders_count integer default 0;
alter table public.sales_summary add column if not exists sales_total numeric(10,2) default 0;
alter table public.sales_summary add column if not exists cash_collected numeric(10,2) default 0;
alter table public.sales_summary add column if not exists cash_pending numeric(10,2) default 0;
alter table public.sales_summary add column if not exists avg_preparation_time integer default 0;
alter table public.sales_summary add column if not exists created_at timestamptz default now();

alter table public.app_settings add column if not exists language_default text default 'en';
alter table public.app_settings add column if not exists restaurant_open boolean default true;
alter table public.app_settings add column if not exists ordering_enabled boolean default true;
alter table public.app_settings add column if not exists updated_at timestamptz default now();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_order_status_timestamps()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    if new.status = 'accepted' and new.accepted_at is null then
      new.accepted_at = now();
    elsif new.status = 'preparing' and new.preparing_at is null then
      new.preparing_at = now();
    elsif new.status = 'ready_for_review' and new.ready_for_review_at is null then
      new.ready_for_review_at = now();
    elsif new.status = 'being_served' and new.being_served_at is null then
      new.being_served_at = now();
    elsif new.status = 'completed' and new.completed_at is null then
      new.completed_at = now();
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.create_order_notifications()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.admin_notifications (order_id, type, title, message)
    values (new.id, 'new_order', 'New Order', 'A new customer order has been received.');
  end if;

  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    if new.status = 'accepted' then
      insert into public.chef_notifications (order_id, title, message)
      values (new.id, 'New Order Received', 'Admin accepted a new order.');
    elsif new.status = 'ready_for_review' then
      insert into public.admin_notifications (order_id, type, title, message)
      values (new.id, 'chef_finished', 'Chef Finished', 'The chef marked this order ready for review.');
    elsif new.status = 'being_served' then
      insert into public.admin_notifications (order_id, type, title, message)
      values (new.id, 'order_served', 'Order Served', 'This order is being served.');
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists restaurant_tables_updated_at on public.restaurant_tables;
create trigger restaurant_tables_updated_at
before update on public.restaurant_tables
for each row execute function public.set_updated_at();

drop trigger if exists menu_categories_updated_at on public.menu_categories;
create trigger menu_categories_updated_at
before update on public.menu_categories
for each row execute function public.set_updated_at();

drop trigger if exists dishes_updated_at on public.dishes;
create trigger dishes_updated_at
before update on public.dishes
for each row execute function public.set_updated_at();

drop trigger if exists chef_tasks_updated_at on public.chef_tasks;
create trigger chef_tasks_updated_at
before update on public.chef_tasks
for each row execute function public.set_updated_at();

drop trigger if exists orders_status_timestamps on public.orders;
create trigger orders_status_timestamps
before update on public.orders
for each row execute function public.set_order_status_timestamps();

drop trigger if exists orders_notifications on public.orders;
create trigger orders_notifications
after insert or update on public.orders
for each row execute function public.create_order_notifications();

create index if not exists restaurant_tables_table_number_idx on public.restaurant_tables(table_number);
create index if not exists restaurant_tables_status_idx on public.restaurant_tables(status);
create index if not exists menu_categories_display_order_idx on public.menu_categories(display_order);
create index if not exists dishes_slug_idx on public.dishes(slug);
create index if not exists dishes_category_id_idx on public.dishes(category_id);
create index if not exists dishes_available_idx on public.dishes(is_available);
create index if not exists dishes_popular_idx on public.dishes(is_popular);
create index if not exists dishes_chef_pick_idx on public.dishes(chef_pick);
create index if not exists weekly_menu_weekday_idx on public.weekly_menu(weekday);
create index if not exists weekly_menu_dish_id_idx on public.weekly_menu(dish_id);
create index if not exists orders_table_id_idx on public.orders(table_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_completed_at_idx on public.orders(completed_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_dish_id_idx on public.order_items(dish_id);
create index if not exists chef_tasks_order_id_idx on public.chef_tasks(order_id);
create index if not exists chef_tasks_status_idx on public.chef_tasks(chef_status);
create index if not exists chef_tasks_started_at_idx on public.chef_tasks(started_at);
create index if not exists admin_notifications_order_id_idx on public.admin_notifications(order_id);
create index if not exists admin_notifications_unread_idx on public.admin_notifications(is_read, created_at desc);
create index if not exists chef_notifications_order_id_idx on public.chef_notifications(order_id);
create index if not exists chef_notifications_unread_idx on public.chef_notifications(is_read, created_at desc);
create index if not exists customer_feedback_order_id_idx on public.customer_feedback(order_id);
create index if not exists sales_summary_date_idx on public.sales_summary(date desc);

create or replace function public.add_table_to_realtime_if_missing(table_name text)
returns void
language plpgsql
as $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    )
  then
    execute format('alter publication supabase_realtime add table public.%I', table_name);
  end if;
end;
$$;

select public.add_table_to_realtime_if_missing('restaurant_tables');
select public.add_table_to_realtime_if_missing('menu_categories');
select public.add_table_to_realtime_if_missing('dishes');
select public.add_table_to_realtime_if_missing('weekly_menu');
select public.add_table_to_realtime_if_missing('orders');
select public.add_table_to_realtime_if_missing('order_items');
select public.add_table_to_realtime_if_missing('chef_tasks');
select public.add_table_to_realtime_if_missing('admin_notifications');
select public.add_table_to_realtime_if_missing('chef_notifications');
select public.add_table_to_realtime_if_missing('customer_feedback');
select public.add_table_to_realtime_if_missing('sales_summary');
select public.add_table_to_realtime_if_missing('app_settings');

drop function if exists public.add_table_to_realtime_if_missing(text);

insert into public.app_settings (
  language_default,
  restaurant_open,
  ordering_enabled
)
select 'en', true, true
where not exists (select 1 from public.app_settings);
