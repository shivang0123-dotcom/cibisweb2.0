"use client";

import {
  ArrowLeft,
  Bell,
  BellRing,
  CalendarDays,
  LayoutGrid,
  LogOut,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { DishImage } from "@/components/dish-image";
import { AdminLogin } from "@/components/admin-login";
import { ToastNotification } from "@/components/toast-notification";
import { useAdminLogin } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { useOrderPolling } from "@/hooks/use-order-polling";
import {
  categories,
  formatEuro,
  menuItems,
  weekdayLabels,
  weekdays,
  type MenuCategory,
  type MenuItem,
  type WeeklyMenuPlan,
} from "@/lib/menu";
import type { OrderStatus, RestaurantOrder } from "@/lib/orders";
import { playSfx } from "@/lib/sfx";

type AdminTab = "orders" | "revenue" | "updates" | "previous";
type EditableMenuItem = MenuItem & { draftPrice: string };
type NewDishForm = { title: string; description: string; price: string; category: MenuCategory; image: string; recommended: boolean };
type WaiterCall = { id: string; tableNumber: number; createdAt: string; status: string };

const statusLabels: Record<OrderStatus, string> = {
  pending: "Order Received",
  preparing: "Preparing",
  ready: "Ready for Delivery",
  served: "Delivered",
  rejected: "Declined",
  cancel_requested: "Cancel requested",
  cancelled: "Cancelled",
};

function orderTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function AdminDashboard() {
  // Auth is a single explicit state machine. It is deliberately NOT derived
  // from the order-polling error: doing that caused a stale "unauthorized"
  // error to bounce a freshly logged-in admin straight back to the login screen
  // (the "needs several tries" bug). The poll is gated on `authenticated` so it
  // only runs once we are logged in, and a real 401 from it later (expired
  // session) is the only thing that drops us back to the login screen.
  const [authState, setAuthState] = useState<"checking" | "needsLogin" | "authed">("checking");
  const authenticated = authState === "authed";
  const {
    email,
    setEmail,
    password,
    setPassword,
    error: authError,
    loading: authLoading,
    submit,
  } = useAdminLogin("/api/admin/login");
  const { orders, setOrders, error } = useOrderPolling(2500, authenticated);
  const { active, notify, dismiss } = useNotifications();
  const [tab, setTab] = useState<AdminTab>("orders");
  const [weeklyOpen, setWeeklyOpen] = useState(false);
  const [today, setToday] = useState(() => new Date().toDateString());

  const [menuDraft, setMenuDraft] = useState<EditableMenuItem[]>(
    menuItems.map((item) => ({ ...item, draftPrice: item.price.toFixed(2) })),
  );
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyMenuPlan | null>(null);
  const [trash, setTrash] = useState<MenuItem[]>([]);
  const [tableCapacity, setTableCapacity] = useState<Record<number, number>>({});
  const [calls, setCalls] = useState<WaiterCall[]>([]);
  const seenPending = useRef<Set<string>>(new Set());
  const seenCalls = useRef<Set<string>>(new Set());

  // One-time auth probe on mount: 401 means we need to sign in, anything else
  // means the admin session cookie is already valid.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        if (active) setAuthState(res.status === 401 ? "needsLogin" : "authed");
      } catch {
        if (active) setAuthState("needsLogin");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // If the polling later hits a 401 (session expired), require sign in again.
  useEffect(() => {
    if (error === "unauthorized") setAuthState("needsLogin");
  }, [error]);

  // Notify when a new order arrives to confirm.
  useEffect(() => {
    const pending = orders.filter((order) => order.status === "pending");
    const fresh = pending.filter((order) => !seenPending.current.has(order.id));
    if (seenPending.current.size && fresh.length) {
      notify({ tone: "amber", message: `New order to confirm · Table ${fresh[0].tableNumber}.` });
      playSfx("newOrder");
      navigator.vibrate?.(200);
    }
    pending.forEach((order) => seenPending.current.add(order.id));
  }, [orders, notify]);

  // Load table seating capacities once authenticated (for the order cards).
  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/tables", { cache: "no-store" });
        if (!res.ok || !active) return;
        const data = (await res.json()) as { tables?: { tableNumber: number; capacity: number }[] };
        const map: Record<number, number> = {};
        for (const t of data.tables ?? []) map[t.tableNumber] = t.capacity;
        if (active) setTableCapacity(map);
      } catch {
        // Capacity is informational; cards still render without it.
      }
    })();
    return () => {
      active = false;
    };
  }, [authenticated]);

  // Load the editable menu once authenticated.
  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    (async () => {
      const response = await fetch("/api/menu", { cache: "no-store" });
      if (!response.ok || !active) return;
      const data = (await response.json()) as { items?: MenuItem[]; weeklyPlan?: WeeklyMenuPlan; trash?: MenuItem[] };
      if (data.items?.length) setMenuDraft(data.items.map((item) => ({ ...item, draftPrice: item.price.toFixed(2) })));
      if (data.weeklyPlan) setWeeklyPlan(data.weeklyPlan);
      if (data.trash) setTrash(data.trash);
    })();
    return () => {
      active = false;
    };
  }, [authenticated]);

  // Poll waiter-call requests and alert on new ones.
  useEffect(() => {
    if (!authenticated) return;
    let active = true;

    async function loadCalls() {
      try {
        const response = await fetch("/api/assistance", { cache: "no-store" });
        if (!response.ok || !active) return;
        const data = (await response.json()) as { calls?: WaiterCall[] };
        const next = data.calls ?? [];
        const fresh = next.filter((call) => !seenCalls.current.has(call.id));
        if (seenCalls.current.size && fresh.length) {
          notify({ tone: "indigo", message: `Table ${fresh[0].tableNumber} needs assistance.` });
          playSfx("help");
          navigator.vibrate?.([120, 60, 120, 60, 120]);
        }
        next.forEach((call) => seenCalls.current.add(call.id));
        setCalls(next);
      } catch {
        // Keep the last known calls if a poll fails.
      }
    }

    loadCalls();
    const interval = window.setInterval(loadCalls, 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [authenticated, notify]);

  async function resolveCall(id: string) {
    setCalls((current) => current.filter((call) => call.id !== id));
    await fetch("/api/assistance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  // Roll the dashboard over to a fresh day at midnight — today's orders move to "Previous".
  useEffect(() => {
    const interval = window.setInterval(() => {
      const current = new Date().toDateString();
      if (current !== today) {
        setToday(current);
        notify({ tone: "indigo", message: "New service day started. Yesterday's orders moved to Previous." });
      }
    }, 60000);
    return () => window.clearInterval(interval);
  }, [today, notify]);

  const pendingCount = orders.filter((order) => order.status === "pending").length;
  const activeOrders = useMemo(() => {
    const rank: Partial<Record<OrderStatus, number>> = { pending: 0, ready: 1, preparing: 2 };
    return orders
      .filter((order) => order.status in rank)
      .sort((a, b) => {
        const byRank = (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
        if (byRank !== 0) return byRank;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [orders]);

  async function updateStatus(order: RestaurantOrder, status: OrderStatus) {
    setOrders((current) => current.map((item) => (item.id === order.id ? { ...item, status } : item)));
    const response = await fetch(`/api/orders?id=${encodeURIComponent(order.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.status === 401) {
      setAuthState("needsLogin");
      return;
    }
    if (response.ok) {
      const data = (await response.json()) as { order?: RestaurantOrder };
      if (data.order) setOrders((current) => current.map((item) => (item.id === data.order?.id ? data.order : item)));
      notify({
        tone: status === "served" ? "green" : "indigo",
        message: status === "preparing" ? `Order confirmed · Table ${order.tableNumber}.` : `Served · Table ${order.tableNumber}.`,
      });
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthState("needsLogin");
  }

  // ── Menu management ──
  function updateDraft(id: string, patch: Partial<EditableMenuItem>) {
    setMenuDraft((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function applyMenuResponse(data: { items?: MenuItem[]; weeklyPlan?: WeeklyMenuPlan; trash?: MenuItem[] }) {
    if (data.items) setMenuDraft(data.items.map((dish) => ({ ...dish, draftPrice: dish.price.toFixed(2) })));
    if (data.weeklyPlan) setWeeklyPlan(data.weeklyPlan);
    if (data.trash) setTrash(data.trash);
  }

  async function saveDish(item: EditableMenuItem) {
    const parsed = Number(item.draftPrice);
    const nextPrice = Number.isFinite(parsed) && parsed > 0 ? parsed : item.price;
    // Optimistically reflect the change so the edit "sticks" on the first click,
    // even before the server round-trip finishes.
    setMenuDraft((current) =>
      current.map((dish) =>
        dish.id === item.id
          ? { ...dish, ...item, price: nextPrice, draftPrice: nextPrice.toFixed(2) }
          : dish,
      ),
    );
    const response = await fetch("/api/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, price: nextPrice }),
    });
    if (response.ok) {
      applyMenuResponse(await response.json());
      notify({ tone: "green", message: `Saved “${item.title}”.` });
    } else {
      notify({ tone: "red", message: `Couldn't save “${item.title}”. Please try again.` });
    }
  }

  async function addDish(form: NewDishForm) {
    const response = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price) }),
    });
    if (response.ok) {
      applyMenuResponse(await response.json());
      notify({ tone: "green", message: `Added “${form.title}”.` });
      return true;
    }
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    notify({ tone: "red", message: data?.error || "Unable to add dish." });
    return false;
  }

  async function deleteDish(item: EditableMenuItem) {
    setMenuDraft((current) => current.filter((dish) => dish.id !== item.id));
    const response = await fetch(`/api/menu?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
    if (response.ok) {
      applyMenuResponse(await response.json());
      notify({ tone: "amber", message: `Moved “${item.title}” to Trash.` });
    }
  }

  async function restoreDish(item: MenuItem) {
    setTrash((current) => current.filter((dish) => dish.id !== item.id));
    const response = await fetch("/api/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, restore: true }),
    });
    if (response.ok) {
      applyMenuResponse(await response.json());
      notify({ tone: "green", message: `Restored “${item.title}”.` });
    }
  }

  async function purgeDish(item: MenuItem) {
    setTrash((current) => current.filter((dish) => dish.id !== item.id));
    const response = await fetch(`/api/menu?id=${encodeURIComponent(item.id)}&permanent=true`, {
      method: "DELETE",
    });
    if (response.ok) {
      applyMenuResponse(await response.json());
      notify({ tone: "red", message: `Permanently deleted “${item.title}”.` });
    }
  }

  async function saveWeeklyPlan(plan: WeeklyMenuPlan) {
    setWeeklyPlan(plan);
    const response = await fetch("/api/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weeklyPlan: plan }),
    });
    if (response.ok) {
      const data = (await response.json()) as { weeklyPlan?: WeeklyMenuPlan };
      if (data.weeklyPlan) setWeeklyPlan(data.weeklyPlan);
    }
  }

  if (authState === "needsLogin") {
    return (
      <AdminLogin
        title="Staff Dashboard"
        subtitle="Admin sign in"
        email={email}
        password={password}
        error={authError}
        loading={authLoading}
        onEmail={setEmail}
        onPassword={setPassword}
        onSubmit={async () => {
          const ok = await submit();
          if (ok) setAuthState("authed");
        }}
      />
    );
  }

  if (authState === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf0e8] text-[#736860]">
        <span className="text-sm font-semibold">Loading dashboard…</span>
      </main>
    );
  }

  if (weeklyOpen) {
    return (
      <WeeklyMenuManager
        menu={menuDraft}
        plan={weeklyPlan}
        trash={trash}
        onBack={() => setWeeklyOpen(false)}
        onUpdateDraft={updateDraft}
        onSaveDish={saveDish}
        onAddDish={addDish}
        onDeleteDish={deleteDish}
        onRestoreDish={restoreDish}
        onPurgeDish={purgeDish}
        onSavePlan={saveWeeklyPlan}
      />
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#faf0e8] text-[#1a1410]">
      {/* Header */}
      <header className="flex items-center justify-between gap-2 bg-[#1a1410] px-4 py-4 text-white sm:px-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Image src="/images/logo.png" alt="Circolo del Bridge" width={546} height={424} priority unoptimized className="h-9 w-auto shrink-0 sm:h-12" />
          <div className="min-w-0">
            <h1 className="truncate font-serif text-[17px] font-extrabold leading-none sm:text-[22px]">Staff Dashboard</h1>
            <p className="mt-1.5 hidden text-[14px] text-white/70 sm:block">Circolo del Bridge</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/admin/tables"
            aria-label="Tables"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-2 text-[13px] font-bold text-white transition hover:bg-white/20 sm:px-3"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Tables</span>
          </Link>
          <button
            onClick={() => setWeeklyOpen(true)}
            aria-label="Weekly Menu"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-2 text-[13px] font-bold text-white transition hover:bg-white/20 sm:px-3"
          >
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Weekly Menu</span>
          </button>
          <span className="relative inline-flex">
            <Bell className="h-6 w-6" strokeWidth={2} />
            {pendingCount > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[#c9821f] px-1 text-[12px] font-extrabold text-white">
                {pendingCount}
              </span>
            )}
          </span>
          <button onClick={logout} aria-label="Sign out" className="text-white/70 transition hover:text-white">
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* New-order banner */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 border-b border-[#efdcc0] bg-[#f8ecd7] px-5 py-2.5 text-[16px] font-bold text-[#c9821f]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#c9821f]" />
          {pendingCount} new {pendingCount === 1 ? "order" : "orders"} to confirm
        </div>
      )}

      {/* Waiter-call requests */}
      {calls.map((call) => (
        <div
          key={call.id}
          className="flex items-center justify-between gap-3 border-b border-[#cfe0ea] bg-[#e4edf3] px-5 py-2.5 text-[#567890]"
        >
          <span className="flex items-center gap-2 text-[15px] font-bold">
            <BellRing className="h-4 w-4" />
            Table {call.tableNumber} needs assistance · {orderTime(call.createdAt)}
          </span>
          <button
            onClick={() => resolveCall(call.id)}
            className="rounded-full bg-[#6b8fa6] px-4 py-1.5 text-[13px] font-bold text-white transition active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      ))}

      {/* Tabs */}
      <nav className="scrollbar-hide flex items-center gap-1 overflow-x-auto border-b border-[#e8ddd2] bg-white px-2">
        {(["orders", "revenue", "updates", "previous"] as AdminTab[]).map((target) => (
          <button
            key={target}
            onClick={() => setTab(target)}
            className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3.5 py-3.5 text-[16px] font-bold capitalize transition ${
              tab === target ? "text-[#c4703c]" : "text-[#736860]"
            }`}
          >
            {target}
            {target === "orders" && pendingCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#c4703c] px-1 text-[12px] font-extrabold text-white">
                {pendingCount}
              </span>
            )}
            {tab === target && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#c4703c]" />}
          </button>
        ))}
      </nav>

      <div className="mx-auto w-full max-w-md flex-1 overflow-y-auto px-4 pb-10 pt-4">
        {tab === "orders" && (
          <OrdersTab orders={activeOrders} capacityByTable={tableCapacity} onConfirm={(o) => updateStatus(o, "preparing")} onServe={(o) => updateStatus(o, "served")} />
        )}
        {tab === "revenue" && <RevenueTab orders={orders} today={today} />}
        {tab === "updates" && <UpdatesTab orders={orders} today={today} />}
        {tab === "previous" && <PreviousTab orders={orders} today={today} />}
      </div>

      <ToastNotification toast={active} onDismiss={dismiss} />
    </main>
  );
}

function OrdersTab({
  orders,
  capacityByTable,
  onConfirm,
  onServe,
}: {
  orders: RestaurantOrder[];
  capacityByTable: Record<number, number>;
  onConfirm: (order: RestaurantOrder) => void;
  onServe: (order: RestaurantOrder) => void;
}) {
  if (!orders.length) {
    return (
      <div className="mt-6 rounded-[20px] border border-dashed border-[#d6c9b8] bg-white p-10 text-center text-[16px] text-[#736860]">
        No active orders right now.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <AdminOrderCard key={order.id} order={order} capacity={capacityByTable[order.tableNumber]} onConfirm={() => onConfirm(order)} onServe={() => onServe(order)} />
      ))}
    </div>
  );
}

function AdminOrderCard({
  order,
  capacity,
  onConfirm,
  onServe,
}: {
  order: RestaurantOrder;
  capacity?: number;
  onConfirm: () => void;
  onServe: () => void;
}) {
  const isNew = order.status === "pending";
  const isReady = order.status === "ready";

  const headerBg = isNew ? "bg-[#f8ecd7]" : isReady ? "bg-[#e3f1e8]" : "bg-[#f2e8dc]";
  const cardBorder = isNew
    ? "border-2 border-[#c9821f] shadow-[0_6px_18px_rgba(60,40,28,0.12)]"
    : isReady
      ? "border-2 border-[#2f7d4f] shadow-[0_6px_18px_rgba(60,40,28,0.12)]"
      : "border border-[#e8ddd2] shadow-[0_2px_8px_rgba(60,40,28,0.08)]";

  return (
    <article className={`overflow-hidden rounded-[20px] bg-white ${cardBorder}`}>
      <div className={`flex items-start justify-between gap-3 border-b border-[#e8ddd2] px-5 py-3 ${headerBg}`}>
        <div className="min-w-0">
          <p className="truncate font-serif text-[28px] font-extrabold leading-tight text-[#1a1410]">
            {order.customerName || "Guest"}
          </p>
          <p className="text-[14px] font-semibold text-[#736860]">
            Order #{order.orderNumber} · Table {order.tableNumber}
            {typeof capacity === "number" ? ` · ${capacity} seats` : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <OrderStatusBadge status={order.status} />
          <span className="text-[14px] tabular-nums text-[#736860]">{orderTime(order.createdAt)}</span>
        </div>
      </div>

      <div className="px-5 py-3">
        {order.items.map((item, index) => (
          <div key={`${item.id}-${index}`} className="flex items-baseline gap-4 py-1.5">
            <span className="min-w-[2.5ch] font-serif text-[22px] font-bold tabular-nums text-[#c4703c]">{item.quantity}×</span>
            <span className="flex-1 text-[18px] leading-snug text-[#1a1410]">{item.title}</span>
          </div>
        ))}
        {order.customerNote && (
          <div className="mt-2 rounded-xl bg-[#f8ecd7] px-3 py-2 text-[15px] font-semibold text-[#c9821f]">{order.customerNote}</div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[#e8ddd2] px-5 py-3">
        <span className="font-serif text-[22px] font-bold text-[#1a1410]">{formatEuro(order.total)}</span>
        {isNew ? (
          <button
            onClick={onConfirm}
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#c4703c] px-8 text-[17px] font-bold text-white transition active:scale-[0.98] active:bg-[#a35a2c]"
          >
            Confirm
          </button>
        ) : (
          <button
            onClick={onServe}
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-[#c4703c] bg-white px-8 text-[17px] font-bold text-[#c4703c] transition active:scale-[0.98] active:bg-[#fae7d6]"
          >
            Served
          </button>
        )}
      </div>
    </article>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const styles: Partial<Record<OrderStatus, string>> = {
    pending: "border border-[#c9821f] bg-white text-[#c9821f]",
    preparing: "bg-[#f2e8dc] text-[#47403a]",
    ready: "bg-[#e3f1e8] text-[#2f7d4f]",
    served: "bg-[#f2e8dc] text-[#736860]",
  };
  return (
    <span className={`inline-flex h-7 items-center justify-center rounded-full px-3 text-[14px] font-bold ${styles[status] ?? "bg-[#f2e8dc] text-[#736860]"}`}>
      {statusLabels[status]}
    </span>
  );
}

type AnalyticsPoint = { label: string; revenue: number };
type AnalyticsView = "weekly" | "monthly";

function RevenueTab({ orders, today }: { orders: RestaurantOrder[]; today: string }) {
  const stats = useMemo(() => {
    const counted = orders.filter((o) => !["rejected", "cancelled"].includes(o.status));
    const todayOrders = counted.filter((o) => new Date(o.createdAt).toDateString() === today);
    const revenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const completed = todayOrders.filter((o) => o.status === "served").length;
    const avg = todayOrders.length ? revenue / todayOrders.length : 0;
    return { revenue, count: todayOrders.length, completed, avg };
  }, [orders, today]);

  const [analyticsView, setAnalyticsView] = useState<AnalyticsView>("weekly");
  const [weeklyData, setWeeklyData] = useState<AnalyticsPoint[]>([]);
  const [monthlyData, setMonthlyData] = useState<AnalyticsPoint[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/analytics", { cache: "no-store" });
        if (!res.ok || !active) return;
        const data = (await res.json()) as { weeklyData: AnalyticsPoint[]; monthlyData: AnalyticsPoint[] };
        if (active) {
          setWeeklyData(data.weeklyData ?? []);
          setMonthlyData(data.monthlyData ?? []);
        }
      } catch {
        // Analytics are informational; fail silently
      } finally {
        if (active) setAnalyticsLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const activeData = analyticsView === "weekly" ? weeklyData : monthlyData;
  const totalRevenue = activeData.reduce((sum, d) => sum + d.revenue, 0);
  const avgRevenue = activeData.length ? totalRevenue / activeData.length : 0;

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-[20px] font-bold text-[#1a1410]">Today&apos;s revenue</h2>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Revenue" value={formatEuro(stats.revenue)} tone="brand" big />
        <StatCard label="Orders" value={String(stats.count)} tone="blue" big />
        <StatCard label="Avg order" value={formatEuro(stats.avg)} tone="neutral" />
        <StatCard label="Completed" value={String(stats.completed)} tone="green" />
      </div>

      {/* Revenue Analytics */}
      <div className="rounded-[20px] border border-[#e8ddd2] bg-white p-4 shadow-[0_2px_8px_rgba(60,40,28,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-[18px] font-bold text-[#1a1410]">Revenue Analytics</h3>
          <div className="flex rounded-full border border-[#e8ddd2] bg-[#faf0e8] p-0.5">
            <button
              onClick={() => setAnalyticsView("weekly")}
              className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition ${analyticsView === "weekly" ? "bg-[#c4703c] text-white shadow-sm" : "text-[#736860] hover:text-[#1a1410]"}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setAnalyticsView("monthly")}
              className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition ${analyticsView === "monthly" ? "bg-[#c4703c] text-white shadow-sm" : "text-[#736860] hover:text-[#1a1410]"}`}
            >
              Monthly
            </button>
          </div>
        </div>

        {analyticsLoading ? (
          <div className="flex h-48 items-center justify-center text-[14px] text-[#736860]">Loading…</div>
        ) : analyticsView === "weekly" ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f0e8de" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#736860", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: string) => v.slice(0, 3)}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#736860" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `€${v}`}
                />
                <Tooltip
                  formatter={(value) => [formatEuro(Number(value ?? 0)), "Revenue"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e8ddd2", fontSize: 13, fontWeight: 600, color: "#1a1410" }}
                  cursor={{ fill: "#fae7d6" }}
                />
                <Bar dataKey="revenue" fill="#c4703c" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#fae7d6] p-3">
                <p className="font-serif text-[20px] font-extrabold text-[#c4703c]">{formatEuro(totalRevenue)}</p>
                <p className="mt-0.5 text-[12px] font-semibold text-[#47403a]">Total Weekly Revenue</p>
              </div>
              <div className="rounded-xl bg-[#f1ece5] p-3">
                <p className="font-serif text-[20px] font-extrabold text-[#1a1410]">{formatEuro(avgRevenue)}</p>
                <p className="mt-0.5 text-[12px] font-semibold text-[#47403a]">Average Daily Revenue</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f0e8de" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#736860", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#736860" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `€${v}`}
                />
                <Tooltip
                  formatter={(value) => [formatEuro(Number(value ?? 0)), "Revenue"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e8ddd2", fontSize: 13, fontWeight: 600, color: "#1a1410" }}
                />
                <Line
                  dataKey="revenue"
                  stroke="#c4703c"
                  strokeWidth={2.5}
                  dot={{ fill: "#c4703c", r: 4 }}
                  activeDot={{ r: 6 }}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#fae7d6] p-3">
                <p className="font-serif text-[20px] font-extrabold text-[#c4703c]">{formatEuro(totalRevenue)}</p>
                <p className="mt-0.5 text-[12px] font-semibold text-[#47403a]">Total Year Revenue</p>
              </div>
              <div className="rounded-xl bg-[#f1ece5] p-3">
                <p className="font-serif text-[20px] font-extrabold text-[#1a1410]">{formatEuro(avgRevenue)}</p>
                <p className="mt-0.5 text-[12px] font-semibold text-[#47403a]">Average Monthly Revenue</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Top Categories Revenue */}
      <TopCategoriesRevenue />
    </div>
  );
}

type CategoryRevenue = { category: string; revenue: number; percentage: number };

function TopCategoriesRevenue() {
  const [categories, setCategories] = useState<CategoryRevenue[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/analytics/categories", { cache: "no-store" });
        if (!res.ok || !active) return;
        const data = (await res.json()) as { categories: CategoryRevenue[]; totalRevenue: number };
        if (active) {
          setCategories(data.categories ?? []);
          setTotalRevenue(data.totalRevenue ?? 0);
        }
      } catch {
        // Analytics fail silently
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[20px] border border-[#e8ddd2] bg-white text-[14px] text-[#736860]">
        Loading…
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="rounded-[20px] border border-dashed border-[#d6c9b8] bg-white p-10 text-center text-[14px] text-[#736860]">
        No category data available yet. Complete some orders to see category revenue.
      </div>
    );
  }

  // Palette drawn directly from the website's brand colors — terracotta, peach,
  // dusty blue, clay, and warm sand. Distinct enough to read each slice while
  // staying fully on-theme with the Circolo del Bridge / Mediterranean look.
  const chartData = categories.map((c, i) => ({
    ...c,
    fill: [
      "#c4703c", // terracotta (brand header)
      "#7b9cb6", // dusty blue (accent button)
      "#e0a878", // peach
      "#a8593a", // deep clay
      "#d89b72", // soft clay (menu card)
      "#6b8fa6", // muted blue
      "#eac3a0", // warm sand
      "#9a5a2d", // burnt umber
    ][i % 8],
  }));

  return (
    <div className="rounded-[20px] border border-[#e8ddd2] bg-white p-4 shadow-[0_2px_8px_rgba(60,40,28,0.06)]">
      <h3 className="mb-4 font-serif text-[18px] font-bold text-[#1a1410]">Top Categories (This Month)</h3>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Progress bars (colors match the donut slices = legend) */}
        <div className="space-y-3">
          {chartData.map((cat, idx) => (
            <div key={`${cat.category}-${idx}`} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-[#1a1410]">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.fill }} />
                  {cat.category}
                </p>
                <p className="text-[13px] font-bold text-[#1a1410]">{cat.percentage}%</p>
              </div>
              <div className="h-2 rounded-full bg-[#f1ece5]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${cat.percentage}%`, backgroundColor: cat.fill }}
                />
              </div>
              <p className="text-[12px] text-[#736860]">{formatEuro(cat.revenue)}</p>
            </div>
          ))}
        </div>

        {/* Right: Donut chart */}
        <div className="flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="revenue"
                animationDuration={600}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatEuro(Number(value ?? 0))}
                contentStyle={{ borderRadius: 8, border: "1px solid #e8ddd2", fontSize: 12, fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 text-center">
            <p className="font-serif text-[20px] font-extrabold text-[#c4703c]">{formatEuro(totalRevenue)}</p>
            <p className="text-[12px] font-semibold text-[#736860]">Monthly Total</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone, big }: { label: string; value: string; tone: "brand" | "blue" | "green" | "neutral"; big?: boolean }) {
  const tones: Record<string, string> = {
    brand: "bg-[#fae7d6] text-[#c4703c]",
    blue: "bg-[#e4edf3] text-[#6b8fa6]",
    green: "bg-[#e3f1e8] text-[#2f7d4f]",
    neutral: "bg-white text-[#1a1410] border border-[#e8ddd2]",
  };
  return (
    <div className={`rounded-[20px] p-5 ${tones[tone]}`}>
      <p className={`font-serif font-extrabold leading-none ${big ? "text-[34px]" : "text-[28px]"}`}>{value}</p>
      <p className="mt-2 text-[14px] font-semibold text-[#47403a]">{label}</p>
    </div>
  );
}

function UpdatesTab({ orders, today }: { orders: RestaurantOrder[]; today: string }) {
  const recent = useMemo(
    () =>
      orders
        .filter((o) => new Date(o.createdAt).toDateString() === today)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 30),
    [orders, today],
  );
  if (!recent.length) {
    return (
      <div className="mt-6 rounded-[20px] border border-dashed border-[#d6c9b8] bg-white p-10 text-center text-[16px] text-[#736860]">
        No activity today yet.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <h2 className="mb-2 font-serif text-[20px] font-bold text-[#1a1410]">Today&apos;s activity</h2>
      {recent.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </div>
  );
}

function OrderRow({ order }: { order: RestaurantOrder }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#e8ddd2] bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-[16px] font-bold text-[#1a1410]">{order.customerName || "Guest"}</p>
        <p className="text-[14px] text-[#736860]">
          Order #{order.orderNumber} · Table {order.tableNumber} · {order.items.length} items · {orderTime(order.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <OrderStatusBadge status={order.status} />
        <span className="font-serif text-[16px] font-bold text-[#1a1410]">{formatEuro(order.total)}</span>
      </div>
    </div>
  );
}

function PreviousTab({ orders, today }: { orders: RestaurantOrder[]; today: string }) {
  const groups = useMemo(() => {
    const previous = orders.filter(
      (o) => new Date(o.createdAt).toDateString() !== today && !["rejected", "cancelled"].includes(o.status),
    );
    const map = new Map<string, RestaurantOrder[]>();
    for (const order of previous) {
      const key = new Date(order.createdAt).toDateString();
      const list = map.get(key) ?? [];
      list.push(order);
      map.set(key, list);
    }
    return [...map.entries()]
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([date, list]) => ({
        date,
        orders: list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        total: list.reduce((sum, o) => sum + o.total, 0),
      }));
  }, [orders, today]);

  if (!groups.length) {
    return (
      <div className="mt-6 rounded-[20px] border border-dashed border-[#d6c9b8] bg-white p-10 text-center text-[16px] text-[#736860]">
        No previous orders yet. Completed days will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.date}>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-serif text-[18px] font-bold text-[#1a1410]">{formatDay(group.date)}</h2>
            <span className="text-[14px] font-semibold text-[#736860]">
              {group.orders.length} {group.orders.length === 1 ? "order" : "orders"} · {formatEuro(group.total)}
            </span>
          </div>
          <div className="space-y-2">
            {group.orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function formatDay(dateString: string) {
  return new Date(dateString).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

// ── Weekly Menu manager (dish CRUD + weekly planner) ──

function WeeklyMenuManager({
  menu,
  plan,
  trash,
  onBack,
  onUpdateDraft,
  onSaveDish,
  onAddDish,
  onDeleteDish,
  onRestoreDish,
  onPurgeDish,
  onSavePlan,
}: {
  menu: EditableMenuItem[];
  plan: WeeklyMenuPlan | null;
  trash: MenuItem[];
  onBack: () => void;
  onUpdateDraft: (id: string, patch: Partial<EditableMenuItem>) => void;
  onSaveDish: (item: EditableMenuItem) => void;
  onAddDish: (form: NewDishForm) => Promise<boolean>;
  onDeleteDish: (item: EditableMenuItem) => void;
  onRestoreDish: (item: MenuItem) => void;
  onPurgeDish: (item: MenuItem) => void;
  onSavePlan: (plan: WeeklyMenuPlan) => void;
}) {
  const [section, setSection] = useState<"dishes" | "plan" | "trash">("dishes");

  const sectionLabel = (target: "dishes" | "plan" | "trash") =>
    target === "dishes" ? "Dishes" : target === "plan" ? "Weekly Plan" : `Trash${trash.length ? ` (${trash.length})` : ""}`;

  return (
    <main className="flex min-h-screen flex-col bg-[#faf0e8] text-[#1a1410]">
      <header className="flex items-center gap-3 bg-[#1a1410] px-5 py-4 text-white">
        <button onClick={onBack} aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-serif text-[22px] font-extrabold leading-none">Weekly Menu</h1>
          <p className="mt-1.5 text-[14px] text-white/70">Manage dishes & plan the week</p>
        </div>
      </header>

      <nav className="flex items-center gap-1 border-b border-[#e8ddd2] bg-white px-2">
        {(["dishes", "plan", "trash"] as const).map((target) => (
          <button
            key={target}
            onClick={() => setSection(target)}
            className={`relative px-4 py-3.5 text-[16px] font-bold transition ${section === target ? "text-[#c4703c]" : "text-[#736860]"}`}
          >
            {sectionLabel(target)}
            {section === target && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#c4703c]" />}
          </button>
        ))}
      </nav>

      <div className="mx-auto w-full max-w-md flex-1 overflow-y-auto px-4 pb-10 pt-4">
        {section === "dishes" ? (
          <DishesManager menu={menu} onUpdateDraft={onUpdateDraft} onSaveDish={onSaveDish} onAddDish={onAddDish} onDeleteDish={onDeleteDish} />
        ) : section === "trash" ? (
          <TrashManager trash={trash} onRestore={onRestoreDish} onPurge={onPurgeDish} />
        ) : plan ? (
          <WeeklyPlanner menu={menu} plan={plan} onSavePlan={onSavePlan} />
        ) : (
          <p className="mt-6 text-center text-[#736860]">Loading plan…</p>
        )}
      </div>
    </main>
  );
}

function DishesManager({
  menu,
  onUpdateDraft,
  onSaveDish,
  onAddDish,
  onDeleteDish,
}: {
  menu: EditableMenuItem[];
  onUpdateDraft: (id: string, patch: Partial<EditableMenuItem>) => void;
  onSaveDish: (item: EditableMenuItem) => void;
  onAddDish: (form: NewDishForm) => Promise<boolean>;
  onDeleteDish: (item: EditableMenuItem) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [category, setCategory] = useState<MenuCategory | "All">("All");
  const [query, setQuery] = useState("");
  const [newDish, setNewDish] = useState<NewDishForm>({ title: "", description: "", price: "", category: "Starters", image: "", recommended: false });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menu.filter((item) => {
      const inCat = category === "All" || item.category === category;
      const inQuery = !q || [item.title, item.description, item.category].join(" ").toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }, [menu, category, query]);

  function readImage(setForm: Dispatch<SetStateAction<NewDishForm>>, file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  // Keep only digits and a single decimal point. Accepts comma as the decimal
  // separator too, since some mobile keyboards show "," instead of "." — this is
  // what made the price hard to edit ("full stop" not available).
  function sanitizePrice(raw: string) {
    return raw
      .replace(",", ".")
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*)\./g, "$1");
  }

  // Change a dish photo from the edit card and persist it immediately.
  function changeDishPhoto(item: EditableMenuItem, file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result);
      onUpdateDraft(item.id, { image });
      onSaveDish({ ...item, image });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowAdd((s) => !s)}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#c4703c] text-[16px] font-bold text-white"
      >
        <Plus className="h-5 w-5" />
        {showAdd ? "Close" : "Add a dish"}
      </button>

      {showAdd && (
        <div className="space-y-3 rounded-[20px] border border-[#e8ddd2] bg-white p-4">
          <label className="flex h-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#d6c9b8] bg-[#faf0e8] text-center text-[14px] font-bold text-[#736860]">
            {newDish.image ? (
              <DishImage src={newDish.image} alt="" width={320} height={112} className="h-full w-full object-cover" />
            ) : (
              <span className="inline-flex items-center gap-2"><Upload className="h-4 w-4" /> Upload photo</span>
            )}
            <input className="hidden" type="file" accept="image/*" onChange={(e) => readImage(setNewDish, e.target.files?.[0] ?? null)} />
          </label>
          <input value={newDish.title} onChange={(e) => setNewDish((c) => ({ ...c, title: e.target.value }))} placeholder="Dish name" className="h-12 w-full rounded-xl border border-[#e8ddd2] bg-white px-3 text-[16px] outline-none focus:border-[#c4703c]" />
          <input value={newDish.description} onChange={(e) => setNewDish((c) => ({ ...c, description: e.target.value }))} placeholder="Short description" className="h-12 w-full rounded-xl border border-[#e8ddd2] bg-white px-3 text-[16px] outline-none focus:border-[#c4703c]" />
          <div className="flex gap-3">
            <select value={newDish.category} onChange={(e) => setNewDish((c) => ({ ...c, category: e.target.value as MenuCategory }))} className="h-12 flex-1 rounded-xl border border-[#e8ddd2] bg-white px-3 text-[16px] outline-none focus:border-[#c4703c]">
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input value={newDish.price} onChange={(e) => setNewDish((c) => ({ ...c, price: sanitizePrice(e.target.value) }))} placeholder="€ price" inputMode="decimal" className="h-12 w-28 rounded-xl border border-[#e8ddd2] bg-white px-3 text-[16px] outline-none focus:border-[#c4703c]" />
          </div>
          <button
            type="button"
            onClick={() => setNewDish((c) => ({ ...c, recommended: !c.recommended }))}
            className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border text-[15px] font-bold transition ${newDish.recommended ? "border-[#c4703c] bg-[#fae7d6] text-[#c4703c]" : "border-[#e8ddd2] bg-white text-[#736860]"}`}
          >
            <Star className={`h-4 w-4 ${newDish.recommended ? "fill-[#c4703c]" : ""}`} />
            {newDish.recommended ? "Recommended dish" : "Mark as recommended"}
          </button>
          <button
            onClick={async () => {
              const ok = await onAddDish(newDish);
              if (ok) {
                setNewDish({ title: "", description: "", price: "", category: "Starters", image: "", recommended: false });
                setShowAdd(false);
              }
            }}
            className="h-12 w-full rounded-full bg-[#1a1410] text-[16px] font-bold text-white"
          >
            Save dish
          </button>
        </div>
      )}

      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#736860]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search dishes…" className="h-12 w-full rounded-full border border-[#e8ddd2] bg-white pl-10 pr-4 text-[16px] outline-none focus:border-[#c4703c]" />
      </label>
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
        {(["All", ...categories] as const).map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`h-9 shrink-0 rounded-full px-3 text-[13px] font-bold transition ${category === c ? "bg-[#c4703c] text-white" : "border border-[#e8ddd2] bg-white text-[#47403a]"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <article key={item.id} className="rounded-[20px] border border-[#e8ddd2] bg-white p-3">
            <div className="flex gap-3">
              <label className="relative h-[72px] w-[72px] shrink-0 cursor-pointer overflow-hidden rounded-xl">
                <DishImage src={item.image} alt="" width={72} height={72} className="h-full w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/55 py-[3px] text-[10px] font-bold uppercase tracking-wide text-white">
                  <Upload className="h-3 w-3" /> Photo
                </span>
                <input className="hidden" type="file" accept="image/*" onChange={(e) => changeDishPhoto(item, e.target.files?.[0] ?? null)} />
              </label>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <input
                    value={item.title}
                    onChange={(e) => onUpdateDraft(item.id, { title: e.target.value })}
                    className="min-w-0 flex-1 rounded-lg bg-transparent font-serif text-[18px] font-bold text-[#1a1410] outline-none focus:bg-[#faf0e8] focus:px-1"
                  />
                  <button
                    onClick={() => {
                      onUpdateDraft(item.id, { available: !item.available });
                      onSaveDish({ ...item, available: !item.available });
                    }}
                    className={`inline-flex h-8 shrink-0 items-center rounded-full px-3 text-[12px] font-bold ${item.available ? "bg-[#e3f1e8] text-[#2f7d4f]" : "bg-[#f7e1de] text-[#b3261e]"}`}
                  >
                    {item.available ? "In stock" : "Hidden"}
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6b8fa6]">{item.category}</p>
                  <button
                    onClick={() => {
                      onUpdateDraft(item.id, { recommended: !item.recommended });
                      onSaveDish({ ...item, recommended: !item.recommended });
                    }}
                    aria-pressed={Boolean(item.recommended)}
                    className={`inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-2.5 text-[12px] font-bold transition ${item.recommended ? "bg-[#fae7d6] text-[#c4703c]" : "bg-[#f1ece5] text-[#736860]"}`}
                  >
                    <Star className={`h-3.5 w-3.5 ${item.recommended ? "fill-[#c4703c]" : ""}`} />
                    {item.recommended ? "Recommended" : "Recommend"}
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center rounded-xl border border-[#e8ddd2] bg-[#faf0e8] px-2">
                    <span className="text-[15px] font-bold text-[#736860]">€</span>
                    <input value={item.draftPrice} onChange={(e) => onUpdateDraft(item.id, { draftPrice: sanitizePrice(e.target.value) })} inputMode="decimal" className="h-10 w-16 bg-transparent px-1 text-[15px] font-bold outline-none" />
                  </div>
                  <button onClick={() => onSaveDish(item)} className="h-10 rounded-full bg-[#c4703c] px-4 text-[14px] font-bold text-white">Save</button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete “${item.title}”?\n\nIt will be moved to Trash, where you can restore it.`)) {
                        onDeleteDish(item);
                      }
                    }}
                    aria-label={`Delete ${item.title}`}
                    className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-[#e8ddd2] text-[#b3261e] transition hover:bg-[#f7e1de]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
        {!filtered.length && <p className="py-6 text-center text-[#736860]">No dishes match.</p>}
      </div>
    </div>
  );
}

function TrashManager({
  trash,
  onRestore,
  onPurge,
}: {
  trash: MenuItem[];
  onRestore: (item: MenuItem) => void;
  onPurge: (item: MenuItem) => void;
}) {
  if (!trash.length) {
    return (
      <div className="mt-6 flex flex-col items-center gap-2 text-center text-[#736860]">
        <Trash2 className="h-8 w-8 text-[#c9bbab]" />
        <p className="text-[15px] font-semibold">Trash is empty</p>
        <p className="text-[13px]">Deleted dishes land here so you can restore them.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[14px] text-[#736860]">
        Deleted dishes are kept here. Restore them to the menu, or delete them permanently.
      </p>
      <div className="space-y-3">
        {trash.map((item) => (
          <article key={item.id} className="rounded-[20px] border border-[#e8ddd2] bg-white p-3">
            <div className="flex gap-3">
              <DishImage src={item.image} alt="" width={64} height={64} className="h-16 w-16 shrink-0 rounded-xl object-cover opacity-70" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-serif text-[17px] font-bold text-[#1a1410]">{item.title}</h3>
                <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6b8fa6]">{item.category}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => onRestore(item)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#c4703c] px-4 text-[14px] font-bold text-white"
                  >
                    <RotateCcw className="h-4 w-4" /> Restore
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Permanently delete “${item.title}”? This cannot be undone.`)) {
                        onPurge(item);
                      }
                    }}
                    aria-label={`Permanently delete ${item.title}`}
                    className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-full border border-[#e8ddd2] px-4 text-[14px] font-bold text-[#b3261e] transition hover:bg-[#f7e1de]"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function WeeklyPlanner({ menu, plan, onSavePlan }: { menu: EditableMenuItem[]; plan: WeeklyMenuPlan; onSavePlan: (plan: WeeklyMenuPlan) => void }) {
  function toggle(day: keyof WeeklyMenuPlan, itemId: string) {
    const exists = plan[day].includes(itemId);
    onSavePlan({ ...plan, [day]: exists ? plan[day].filter((id) => id !== itemId) : [...plan[day], itemId] });
  }

  return (
    <div className="space-y-4">
      <p className="text-[14px] text-[#736860]">Tick the dishes available each day. The customer menu shows the current day&apos;s selection.</p>
      {weekdays.map((day) => (
        <section key={day} className="rounded-[20px] border border-[#e8ddd2] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-serif text-[18px] font-bold text-[#1a1410]">{weekdayLabels[day]}</h3>
            <span className="text-[13px] font-semibold text-[#736860]">{plan[day].length} dishes</span>
          </div>
          <div className="space-y-2">
            {menu.map((item) => {
              const checked = plan[day].includes(item.id);
              return (
                <button
                  key={`${day}-${item.id}`}
                  onClick={() => toggle(day, item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${checked ? "border-[#c4703c] bg-[#fae7d6]" : "border-[#e8ddd2] bg-[#faf0e8]"}`}
                >
                  <span className={`grid h-5 w-5 place-items-center rounded-md border-2 text-white ${checked ? "border-[#c4703c] bg-[#c4703c]" : "border-[#d6c9b8] bg-white"}`}>
                    {checked && "✓"}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[#1a1410]">{item.title}</span>
                  <span className="text-[13px] font-bold text-[#736860]">{formatEuro(item.price)}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
