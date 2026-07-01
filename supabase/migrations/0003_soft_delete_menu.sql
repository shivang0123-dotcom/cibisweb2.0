-- ============================================================================
-- Circolo del Bridge — Phase 2 migration: soft-delete for menu items
--
-- Adds a `deleted_at` marker so deleting a dish moves it to Trash instead of
-- destroying it. Restorable; can be purged permanently later. Additive and
-- safe: existing rows have deleted_at = NULL (i.e. live).
--
-- ROLLBACK:
--   alter table public.menu_items drop column if exists deleted_at;
-- ============================================================================

alter table public.menu_items add column if not exists deleted_at timestamptz;

-- Partial index so the common "live menu" query (deleted_at IS NULL) stays fast.
create index if not exists menu_items_live_idx
  on public.menu_items (category)
  where deleted_at is null;

create index if not exists menu_items_trash_idx
  on public.menu_items (deleted_at)
  where deleted_at is not null;
