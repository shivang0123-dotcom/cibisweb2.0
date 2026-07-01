import { createDefaultWeeklyPlan, menuItems, type MenuItem, type WeeklyMenuPlan } from "@/lib/menu";
import {
  getSupabaseServerClient,
  mapMenuItemRow,
  mapWeeklyMenuPlanRow,
  toMenuItemUpsert,
  toWeeklyMenuPlanUpsert,
  type MenuItemRow,
  type WeeklyMenuPlanRow,
} from "@/lib/supabase";

type MenuStoreState = {
  items: MenuItem[];
  weeklyPlan: WeeklyMenuPlan;
  trash: MenuItem[];
};

const globalForMenu = globalThis as typeof globalThis & {
  __circoloMenuStore?: MenuStoreState;
};

const cacheKey = "state";
const ttl = 60 * 60 * 24 * 7;
const menuItemSelect = "id, title, description, price_cents, category, image_url, tags, available, prep_minutes, recommended, updated_at, deleted_at";
const weeklyPlanSelect = "id, plan, updated_at";

function defaultState(): MenuStoreState {
  return {
    items: menuItems,
    weeklyPlan: createDefaultWeeklyPlan(menuItems),
    trash: [],
  };
}

function getMemoryState() {
  if (!globalForMenu.__circoloMenuStore) {
    globalForMenu.__circoloMenuStore = defaultState();
  }

  return globalForMenu.__circoloMenuStore;
}

async function getCacheClient() {
  try {
    const { getCache } = await import("@vercel/functions");
    return getCache({ namespace: "circolo-menu" });
  } catch {
    return null;
  }
}

async function readState() {
  const supabaseState = await readSupabaseState();
  if (supabaseState) {
    globalForMenu.__circoloMenuStore = supabaseState;
    return supabaseState;
  }

  const memory = getMemoryState();
  const cache = await getCacheClient();

  if (!cache) {
    return memory;
  }

  try {
    const cached = (await cache.get(cacheKey)) as MenuStoreState | undefined;
    if (cached?.items?.length && cached.weeklyPlan) {
      globalForMenu.__circoloMenuStore = cached;
      return cached;
    }

    await cache.set(cacheKey, memory, { ttl, tags: ["menu"], name: "circolo-menu-state" });
  } catch {
    return memory;
  }

  return memory;
}

async function writeState(state: MenuStoreState) {
  globalForMenu.__circoloMenuStore = state;
  const cache = await getCacheClient();

  if (!cache) {
    return;
  }

  try {
    await cache.set(cacheKey, state, { ttl, tags: ["menu"], name: "circolo-menu-state" });
  } catch {
    // Local memory still works if Runtime Cache is unavailable.
  }
}

async function readSupabaseState(): Promise<MenuStoreState | null> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data: itemData, error: itemError } = await supabase
    .from("menu_items")
    .select(menuItemSelect)
    .order("category", { ascending: true })
    .order("title", { ascending: true });

  if (itemError) {
    return null;
  }

  let rows = (itemData as MenuItemRow[] | null) ?? [];

  // Seed the default menu only when the table is genuinely empty (no live and
  // no trashed rows) so we never re-create dishes the admin deliberately trashed.
  if (!rows.length) {
    const { data: seededItems, error: seedError } = await supabase
      .from("menu_items")
      .upsert(menuItems.map(toMenuItemUpsert), { onConflict: "id" })
      .select(menuItemSelect);

    if (seedError) {
      return null;
    }

    rows = (seededItems as MenuItemRow[] | null) ?? [];
  }

  // Live menu = deleted_at IS NULL; trash = deleted_at IS NOT NULL.
  const items = rows.filter((row) => !row.deleted_at).map(mapMenuItemRow);
  const trash = rows.filter((row) => row.deleted_at).map(mapMenuItemRow);

  const { data: planData, error: planError } = await supabase
    .from("weekly_menu_plans")
    .select(weeklyPlanSelect)
    .eq("id", "default")
    .maybeSingle();

  if (!planError && planData) {
    return {
      items,
      weeklyPlan: mapWeeklyMenuPlanRow(planData as WeeklyMenuPlanRow),
      trash,
    };
  }

  const weeklyPlan = createDefaultWeeklyPlan(items);

  await supabase
    .from("weekly_menu_plans")
    .upsert(toWeeklyMenuPlanUpsert(weeklyPlan), { onConflict: "id" });

  return {
    items,
    weeklyPlan,
    trash,
  };
}

export async function getMenuState() {
  return readState();
}

export async function addMenuItem(item: MenuItem) {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const current = await readState();
    const nextWeeklyPlan = { ...current.weeklyPlan };

    for (const day of Object.keys(nextWeeklyPlan) as Array<keyof WeeklyMenuPlan>) {
      if (!nextWeeklyPlan[day].length) {
        nextWeeklyPlan[day] = [item.id];
      }
    }

    const { error: itemError } = await supabase
      .from("menu_items")
      .upsert(toMenuItemUpsert(item), { onConflict: "id" });
    const { error: planError } = await supabase
      .from("weekly_menu_plans")
      .upsert(toWeeklyMenuPlanUpsert(nextWeeklyPlan), { onConflict: "id" });

    if (!itemError && !planError) {
      const state = await readSupabaseState();
      if (state) return state;
    }
    if (itemError) console.error("[menu-store] addMenuItem menu_items upsert error:", itemError);
    if (planError) console.error("[menu-store] addMenuItem weekly_menu_plans upsert error:", planError);
  }

  console.warn("[menu-store] addMenuItem falling back to in-memory store (not persisted to Supabase)");
  const state = await readState();
  state.items = [item, ...state.items];
  for (const day of Object.keys(state.weeklyPlan) as Array<keyof WeeklyMenuPlan>) {
    if (!state.weeklyPlan[day].length) {
      state.weeklyPlan[day].push(item.id);
    }
  }
  await writeState(state);
  return state;
}

export async function updateMenuItem(itemId: string, patch: Partial<MenuItem>) {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const current = await readState();
    const existing = current.items.find((item) => item.id === itemId);

    if (existing) {
      const nextItem = { ...existing, ...patch };
      const { error } = await supabase
        .from("menu_items")
        .upsert(toMenuItemUpsert(nextItem), { onConflict: "id" });

      if (!error) {
        const state = await readSupabaseState();
        if (state) return state;
      }
    }
  }

  const state = await readState();
  state.items = state.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item));
  await writeState(state);
  return state;
}

// Soft-delete: move a dish to Trash (set deleted_at) and drop it from the
// weekly plan. The dish can be restored or permanently purged from Trash.
export async function removeMenuItem(itemId: string) {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase
      .from("menu_items")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", itemId);

    if (!error) {
      const current = await readState();
      const nextPlan = { ...current.weeklyPlan } as WeeklyMenuPlan;
      for (const day of Object.keys(nextPlan) as Array<keyof WeeklyMenuPlan>) {
        nextPlan[day] = nextPlan[day].filter((id) => id !== itemId);
      }
      await supabase
        .from("weekly_menu_plans")
        .upsert(toWeeklyMenuPlanUpsert(nextPlan), { onConflict: "id" });

      const state = await readSupabaseState();
      if (state) return state;
    }
    if (error) console.error("[menu-store] removeMenuItem soft-delete error:", error);
  }

  console.warn(`[menu-store] removeMenuItem falling back to in-memory store for id=${itemId} (not persisted to Supabase)`);
  const state = await readState();
  const removed = state.items.find((item) => item.id === itemId);
  state.items = state.items.filter((item) => item.id !== itemId);
  if (removed && !state.trash.some((item) => item.id === itemId)) {
    state.trash = [removed, ...state.trash];
  }
  for (const day of Object.keys(state.weeklyPlan) as Array<keyof WeeklyMenuPlan>) {
    state.weeklyPlan[day] = state.weeklyPlan[day].filter((id) => id !== itemId);
  }
  await writeState(state);
  return state;
}

// Restore a trashed dish back to the live menu (clear deleted_at).
export async function restoreMenuItem(itemId: string) {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase
      .from("menu_items")
      .update({ deleted_at: null })
      .eq("id", itemId);

    if (!error) {
      const state = await readSupabaseState();
      if (state) return state;
    }
  }

  const state = await readState();
  const restored = state.trash.find((item) => item.id === itemId);
  if (restored) {
    state.trash = state.trash.filter((item) => item.id !== itemId);
    if (!state.items.some((item) => item.id === itemId)) {
      state.items = [restored, ...state.items];
    }
  }
  await writeState(state);
  return state;
}

// Permanently delete a dish from Trash (hard delete — not recoverable).
export async function permanentlyDeleteMenuItem(itemId: string) {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase.from("menu_items").delete().eq("id", itemId);

    if (!error) {
      const state = await readSupabaseState();
      if (state) return state;
    }
  }

  const state = await readState();
  state.trash = state.trash.filter((item) => item.id !== itemId);
  state.items = state.items.filter((item) => item.id !== itemId);
  await writeState(state);
  return state;
}

export async function updateWeeklyPlan(weeklyPlan: WeeklyMenuPlan) {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase
      .from("weekly_menu_plans")
      .upsert(toWeeklyMenuPlanUpsert(weeklyPlan), { onConflict: "id" });

    if (!error) {
      const state = await readSupabaseState();
      if (state) return state;
    }
  }

  const state = await readState();
  state.weeklyPlan = weeklyPlan;
  await writeState(state);
  return state;
}
