import type { MenuItem } from "@/lib/menu";
import { getMenuState } from "@/lib/menu-store";
import {
  createOrderFromCart,
  orderStages,
  type CartItem,
  type OrderStatus,
  type RestaurantOrder,
} from "@/lib/orders";
import {
  getSupabaseServerClient,
  mapOrderRow,
  toOrderInsert,
  type OrderRow,
} from "@/lib/supabase";

type OrderStoreState = {
  orders: RestaurantOrder[];
  nextOrderNumber: number;
};

type CreateOrderPayload = {
  tableNumber: number;
  sessionId?: string;
  customerName?: string;
  note?: string;
  items: Array<{
    id: string;
    quantity: number;
  }>;
};

const globalForOrders = globalThis as typeof globalThis & {
  __circoloOrderStore?: OrderStoreState;
};

const runtimeCacheKey = "state-v2";
const runtimeCacheTtlSeconds = 60 * 60 * 24 * 7;
const orderSelect =
  "id, order_number, table_number, session_id, customer_name, status, items, total_cents, prep_minutes, customer_note, accepted_at, rejected_at, cancel_requested_at, cancelled_at, delivered_at, created_at";

function getMemoryStore() {
  if (!globalForOrders.__circoloOrderStore) {
    globalForOrders.__circoloOrderStore = {
      orders: [],
      nextOrderNumber: 1100,
    };
  }

  return globalForOrders.__circoloOrderStore;
}

async function getRuntimeCache() {
  try {
    const { getCache } = await import("@vercel/functions");
    return getCache({
      namespace: "circolo-orders",
    });
  } catch {
    return null;
  }
}

async function readFallbackStore() {
  const memoryStore = getMemoryStore();
  const cache = await getRuntimeCache();

  if (!cache) {
    return memoryStore;
  }

  try {
    const cached = (await cache.get(runtimeCacheKey)) as OrderStoreState | undefined;
    if (cached) {
      globalForOrders.__circoloOrderStore = {
        ...cached,
        orders: cached.orders ?? [],
        nextOrderNumber: cached.nextOrderNumber ?? 1100,
      };
      return globalForOrders.__circoloOrderStore;
    }

    await cache.set(runtimeCacheKey, memoryStore, {
      ttl: runtimeCacheTtlSeconds,
      tags: ["orders"],
      name: "circolo-order-state",
    });
  } catch {
    return memoryStore;
  }

  return memoryStore;
}

async function writeFallbackStore(store: OrderStoreState) {
  globalForOrders.__circoloOrderStore = store;
  const cache = await getRuntimeCache();

  if (!cache) {
    return;
  }

  try {
    await cache.set(runtimeCacheKey, store, {
      ttl: runtimeCacheTtlSeconds,
      tags: ["orders"],
      name: "circolo-order-state",
    });
  } catch {
    // Memory still keeps the local development flow working if Runtime Cache is unavailable.
  }
}

function buildCartItems(payload: CreateOrderPayload, items: MenuItem[]): CartItem[] {
  const quantityById = new Map<string, number>();

  for (const item of payload.items) {
    const quantity = Number(item.quantity);
    if (!item.id || !Number.isFinite(quantity) || quantity < 1) {
      continue;
    }

    quantityById.set(item.id, (quantityById.get(item.id) ?? 0) + Math.floor(quantity));
  }

  return Array.from(quantityById.entries())
    .map(([id, quantity]) => {
      const menuItem = items.find((item) => item.id === id && item.available);
      return menuItem ? { menuItem, quantity } : null;
    })
    .filter((item): item is CartItem => Boolean(item));
}

function normalizeTableNumber(value: unknown) {
  const tableNumber = Number(value);
  return Number.isFinite(tableNumber) && tableNumber > 0 ? Math.floor(tableNumber) : 1;
}

export async function listOrders(): Promise<RestaurantOrder[]> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    // Start of today in UTC so served orders from previous days appear in the
    // Previous tab while today's served orders don't pollute the active Orders tab.
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);
    const todayIso = todayUtc.toISOString();

    // Two buckets in one query via PostgREST OR:
    //   1. Any active order regardless of date (needs admin attention today or later)
    //   2. Completed/rejected orders from before today (for the Previous tab history)
    const { data, error } = await supabase
      .from("orders")
      .select(orderSelect)
      .or(
        `status.in.(pending,preparing,ready,cancel_requested),and(status.in.(served,rejected,cancelled),created_at.lt.${todayIso})`
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (!error && data) {
      return (data as OrderRow[]).map(mapOrderRow);
    }
    if (error) {
      console.error("[order-store] listOrders Supabase SELECT error:", error);
    }
  }

  const store = await readFallbackStore();

  return [...store.orders]
    .filter((o) => !["served", "rejected", "cancelled"].includes(o.status))
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function getOrder(orderId: string): Promise<RestaurantOrder | null> {
  const supabase = getSupabaseServerClient();

  if (supabase && !orderId.startsWith("demo") && !orderId.startsWith("order")) {
    const { data, error } = await supabase
      .from("orders")
      .select(orderSelect)
      .eq("id", orderId)
      .single();

    if (!error && data) {
      return mapOrderRow(data as OrderRow);
    }
    if (error) {
      console.error("[order-store] getOrder Supabase SELECT error:", error);
    }
  }

  const store = await readFallbackStore();
  return store.orders.find((item) => item.id === orderId) ?? null;
}

export async function createOrder(payload: CreateOrderPayload): Promise<RestaurantOrder> {
  const tableNumber = normalizeTableNumber(payload.tableNumber);
  const menuState = await getMenuState();
  const cart = buildCartItems(payload, menuState.items);

  if (!cart.length) {
    throw new Error("No valid menu items were provided.");
  }

  const draftOrder = {
    ...createOrderFromCart(tableNumber, cart, "order", {
      sessionId: payload.sessionId,
      customerName: payload.customerName,
    }),
    customerNote: typeof payload.note === "string" ? payload.note.trim().slice(0, 500) : undefined,
  };
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("orders")
      .insert(toOrderInsert(draftOrder))
      .select(orderSelect)
      .single();

    if (!error && data) {
      return mapOrderRow(data as OrderRow);
    }
    if (error) {
      console.error("[order-store] createOrder Supabase INSERT error:", error);
    } else {
      console.error("[order-store] createOrder Supabase INSERT returned no data");
    }
  }

  console.warn("[order-store] createOrder falling back to in-memory store");
  const store = await readFallbackStore();
  const order = {
    ...draftOrder,
    orderNumber: store.nextOrderNumber++,
  };

  store.orders = [order, ...store.orders].slice(0, 100);
  await writeFallbackStore(store);
  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  options: { prepMinutes?: number } = {},
): Promise<RestaurantOrder | null> {
  if (![...orderStages, "rejected", "cancel_requested", "cancelled"].includes(status)) {
    throw new Error("Invalid order status.");
  }

  const nextPrepMinutes =
    typeof options.prepMinutes === "number" && Number.isFinite(options.prepMinutes)
      ? Math.max(0, Math.min(90, Math.floor(options.prepMinutes)))
      : undefined;
  const shouldResetAcceptedAt = status === "preparing" && nextPrepMinutes !== undefined && nextPrepMinutes > 0;

  const supabase = getSupabaseServerClient();

  if (supabase && !orderId.startsWith("demo") && !orderId.startsWith("order")) {
    const { data, error } = await supabase
      .from("orders")
      .update({
        status,
        prep_minutes: nextPrepMinutes,
        accepted_at: status === "preparing" ? new Date().toISOString() : undefined,
        rejected_at: status === "rejected" ? new Date().toISOString() : undefined,
        cancel_requested_at: status === "cancel_requested" ? new Date().toISOString() : undefined,
        cancelled_at: status === "cancelled" ? new Date().toISOString() : undefined,
        delivered_at: status === "served" ? new Date().toISOString() : undefined,
      })
      .eq("id", orderId)
      .select(orderSelect)
      .single();

    if (!error && data) {
      const mapped = mapOrderRow(data as OrderRow);
      // Fire-and-forget audit log — never blocks the main response.
      void supabase
        .from("audit_log")
        .insert({
          event: "order_status_changed",
          order_id: orderId,
          order_number: mapped.orderNumber,
          table_number: mapped.tableNumber,
          customer_name: mapped.customerName,
          new_status: status,
        });
      return mapped;
    }
    if (error) {
      console.error("[order-store] updateOrderStatus Supabase UPDATE error:", error);
    }
  }

  const store = await readFallbackStore();
  const index = store.orders.findIndex((order) => order.id === orderId);

  if (index < 0) {
    return null;
  }

  store.orders[index] = {
    ...store.orders[index],
    status,
    prepMinutes: nextPrepMinutes ?? store.orders[index].prepMinutes,
    acceptedAt:
      status === "preparing"
        ? shouldResetAcceptedAt
          ? new Date().toISOString()
          : store.orders[index].acceptedAt ?? new Date().toISOString()
        : store.orders[index].acceptedAt,
    rejectedAt: status === "rejected" ? new Date().toISOString() : store.orders[index].rejectedAt,
    cancelRequestedAt:
      status === "cancel_requested"
        ? store.orders[index].cancelRequestedAt ?? new Date().toISOString()
        : store.orders[index].cancelRequestedAt,
    cancelledAt: status === "cancelled" ? new Date().toISOString() : store.orders[index].cancelledAt,
  };

  await writeFallbackStore(store);
  return store.orders[index];
}

export async function requestOrderCancellation(orderId: string): Promise<RestaurantOrder | null> {
  const order = await getOrder(orderId);

  if (!order) {
    return null;
  }

  if (order.status === "pending") {
    return updateOrderStatus(orderId, "cancelled");
  }

  if (order.status === "preparing") {
    return updateOrderStatus(orderId, "cancel_requested");
  }

  return order;
}
