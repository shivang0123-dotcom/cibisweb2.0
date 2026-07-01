-- ============================================================================
-- Circolo del Bridge — Drop dead tables
--
-- These tables were created by production_architecture_flexible.sql (an
-- elaborate schema that NO application code references). Verified 2026-06-24:
-- a full grep of /src returns zero queries against any of them. The live app
-- uses only: orders, menu_items, weekly_menu_plans, sessions, restaurant_tables.
--
-- CASCADE is safe here: no KEPT table has a foreign key INTO any of these
-- tables, so cascading only cleans up foreign keys between the dead tables
-- themselves (e.g. order_items -> dishes, staff_sessions -> staff_users).
--
-- ⚠️ DESTRUCTIVE: this permanently deletes these tables and their data. They
-- hold nothing the app reads, but back up the database first if you want a
-- safety net (Supabase Dashboard → Database → Backups).
-- ============================================================================

drop table if exists public.order_items        cascade;
drop table if exists public.chef_tasks          cascade;
drop table if exists public.chef_notifications  cascade;
drop table if exists public.admin_notifications cascade;
drop table if exists public.customer_feedback   cascade;
drop table if exists public.order_status_events cascade;
drop table if exists public.weekly_menu         cascade;
drop table if exists public.dishes              cascade;
drop table if exists public.menu_categories     cascade;
drop table if exists public.sales_summary       cascade;
drop table if exists public.app_settings        cascade;
drop table if exists public.device_clients      cascade;
drop table if exists public.customer_sessions   cascade;
drop table if exists public.staff_activity_logs cascade;
drop table if exists public.staff_sessions      cascade;
drop table if exists public.staff_users         cascade;

-- ============================================================================
-- Verify what remains (expect exactly these 5 app tables):
--   select tablename from pg_tables
--   where schemaname = 'public'
--   order by tablename;
--   -- menu_items, orders, restaurant_tables, sessions, weekly_menu_plans
-- ============================================================================
