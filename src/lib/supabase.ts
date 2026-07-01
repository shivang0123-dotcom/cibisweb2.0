import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { OrderStatus, RestaurantOrder } from "@/lib/orders";
import { toCents, type MenuCategory, type MenuItem, type WeeklyMenuPlan } from "@/lib/menu";

type OrderRow = {
  id: string;
  order_number: number;
  table_number: number;
  session_id?: string | null;
  customer_name?: string | null;
  status: OrderStatus;
  items: RestaurantOrder["items"];
  total_cents: number;
  prep_minutes: number;
  customer_note?: string | null;
  accepted_at?: string | null;
  rejected_at?: string | null;
  cancel_requested_at?: string | null;
  cancelled_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
};

type MenuItemRow = {
  id: string;
  title: string;
  description: string;
  price_cents: number;
  category: MenuCategory;
  image_url: string;
  tags: string[] | null;
  available: boolean;
  prep_minutes: number;
  recommended?: boolean | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

type WeeklyMenuPlanRow = {
  id: string;
  plan: WeeklyMenuPlan;
  updated_at?: string | null;
};

let browserClient: SupabaseClient | null = null;
let serverClient: SupabaseClient | null = null;

function browserConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

function serverConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

function createSupabaseClient(config: { url: string; key: string }) {
  return createClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function isSupabaseConfigured() {
  return Boolean(serverConfig());
}

export function getSupabaseBrowserClient() {
  const config = browserConfig();

  if (!config) {
    return null;
  }

  if (!browserClient) {
    browserClient = createSupabaseClient(config);
  }

  return browserClient;
}

export function getSupabaseServerClient() {
  const config = serverConfig();

  if (!config) {
    return null;
  }

  if (!serverClient) {
    serverClient = createSupabaseClient(config);
  }

  return serverClient;
}

export function mapOrderRow(row: OrderRow): RestaurantOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    tableNumber: row.table_number,
    sessionId: row.session_id ?? undefined,
    customerName: row.customer_name ?? undefined,
    items: row.items,
    total: row.total_cents / 100,
    status: row.status,
    prepMinutes: row.prep_minutes,
    createdAt: row.created_at,
    customerNote: row.customer_note ?? undefined,
    acceptedAt: row.accepted_at ?? undefined,
    rejectedAt: row.rejected_at ?? undefined,
    cancelRequestedAt: row.cancel_requested_at ?? undefined,
    cancelledAt: row.cancelled_at ?? undefined,
    deliveredAt: row.delivered_at ?? undefined,
  };
}

export function toOrderInsert(order: RestaurantOrder) {
  return {
    table_number: order.tableNumber,
    session_id: order.sessionId,
    customer_name: order.customerName,
    status: order.status,
    items: order.items,
    total_cents: toCents(order.total),
    prep_minutes: order.prepMinutes,
    customer_note: order.customerNote,
  };
}

export function mapMenuItemRow(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price_cents / 100,
    category: row.category,
    image: row.image_url,
    tags: row.tags ?? [],
    available: row.available,
    prepMinutes: row.prep_minutes,
    recommended: row.recommended ?? false,
  };
}

export function toMenuItemUpsert(item: MenuItem) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    price_cents: toCents(item.price),
    category: item.category,
    image_url: item.image,
    tags: item.tags,
    available: item.available,
    prep_minutes: item.prepMinutes,
    recommended: item.recommended ?? false,
  };
}

export function mapWeeklyMenuPlanRow(row: WeeklyMenuPlanRow): WeeklyMenuPlan {
  return row.plan;
}

export function toWeeklyMenuPlanUpsert(plan: WeeklyMenuPlan) {
  return {
    id: "default",
    plan,
  };
}

export type { MenuItemRow, OrderRow, WeeklyMenuPlanRow };
