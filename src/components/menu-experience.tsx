"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BellRing,
  Check,
  CookingPot,
  Loader2,
  Minus,
  PackageCheck,
  Plus,
  ReceiptText,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatEuro,
  getCurrentWeekday,
  getRecipeDetails,
  menuItems,
  menuTabs,
  type MenuItem,
  type MenuTab,
  type WeeklyMenuPlan,
} from "@/lib/menu";
import {
  orderStatusLabels,
  type CartItem,
  type OrderStatus,
  type RestaurantOrder,
} from "@/lib/orders";
import { DishImage } from "@/components/dish-image";
import { playSfx } from "@/lib/sfx";

type MenuExperienceProps = {
  tableNumber: number;
};

type CustomerCopy = {
  table: string;
  recommended: string;
  welcome: string;
  heroTitle: string;
  heroSub: string;
  search: string;
  searchResults: string;
  fresh: string;
  dishes: string;
  noDishes: string;
  add: string;
  item: string;
  items: string;
  cart: string;
  confirmTitle: string;
  close: string;
  each: string;
  total: string;
  payment: string;
  noteLabel: string;
  notePlaceholder: string;
  sending: string;
  confirm: string;
  requestSent: string;
  waitingAdmin: string;
  adminAcceptSoon: string;
  acceptedNotice: string;
  rejected: string;
  rejectedSub: string;
  orderConfirmed: string;
  inProgress: string;
  minutes: string;
  beingServed: string;
  completed: string;
  cancelled: string;
  cancelRequested: string;
  browseMenu: string;
  viewOrder: string;
  newOrder: string;
  feedback: string;
  itemsOrdered: string;
  liveStatus: string;
  tapForDetails: string;
  callWaiter: string;
  waiterOnWay: string;
  categoryLabels: Record<string, string>;
};

const categoryLabels = {
  en: {
    All: "All",
    Starters: "Starters",
    Pasta: "Pasta",
    Pizza: "Pizza",
    "Main Course": "Main Course",
    Desserts: "Desserts",
    Drinks: "Drinks",
    Coffee: "Coffee",
    Cocktails: "Cocktails",
  },
  it: {
    All: "Tutti",
    Starters: "Antipasti",
    Pasta: "Pasta",
    Pizza: "Pizza",
    "Main Course": "Secondi",
    Desserts: "Dolci",
    Drinks: "Bevande",
    Coffee: "Caffè",
    Cocktails: "Cocktail",
  },
};

const customerCopy: Record<"en" | "it", CustomerCopy> = {
  en: {
    table: "Table",
    recommended: "Recommended",
    categoryLabels: categoryLabels.en,
    welcome: "Welcome to Circolo Del Bridge",
    heroTitle: "Explore today's Italian menu.",
    heroSub: "Authentic Italian cuisine crafted fresh every day, served with a quiet sense of occasion.",
    search: "Search for dishes, cuisines...",
    searchResults: "Search results",
    fresh: "Fresh from the kitchen",
    dishes: "dishes",
    noDishes: "No dishes match that search in",
    add: "Add",
    item: "item",
    items: "items",
    cart: "Your cart",
    confirmTitle: "Confirm your order",
    close: "Close",
    each: "each",
    total: "Total",
    payment: "Payment will be collected at the restaurant.",
    noteLabel: "Notes for the kitchen",
    notePlaceholder: "No onion, allergy details, extra cutlery...",
    sending: "Sending order request...",
    confirm: "Confirm Order",
    requestSent: "Order request sent",
    waitingAdmin: "The admin will accept soon.",
    adminAcceptSoon: "Your order request is sent. The admin will accept soon.",
    acceptedNotice: "Your order has been accepted. We are estimating preparation time.",
    rejected: "Order not accepted",
    rejectedSub: "The restaurant declined this request. Please place a new order or ask the staff.",
    orderConfirmed: "Order in progress",
    inProgress: "Your order will take about",
    minutes: "mins",
    beingServed: "Your order is being served. Our team will bring it to your table shortly.",
    completed: "Enjoy your meal. Thank you.",
    cancelled: "Your order was cancelled.",
    cancelRequested: "Cancellation requested. The restaurant will confirm soon.",
    browseMenu: "Browse menu",
    viewOrder: "View order",
    newOrder: "Place another order",
    feedback: "Leave feedback",
    itemsOrdered: "Items Ordered",
    liveStatus: "Live order status",
    tapForDetails: "Details",
    callWaiter: "Call waiter",
    waiterOnWay: "A waiter is on the way to your table.",
  },
  it: {
    table: "Tavolo",
    recommended: "Consigliati",
    categoryLabels: categoryLabels.it,
    welcome: "Benvenuti al Circolo Del Bridge",
    heroTitle: "Scopri il menu italiano di oggi.",
    heroSub: "Cucina italiana autentica preparata fresca ogni giorno.",
    search: "Cerca piatti, cucina...",
    searchResults: "Risultati",
    fresh: "Fresco dalla cucina",
    dishes: "piatti",
    noDishes: "Nessun piatto trovato in",
    add: "Aggiungi",
    item: "articolo",
    items: "articoli",
    cart: "Il tuo carrello",
    confirmTitle: "Conferma l'ordine",
    close: "Chiudi",
    each: "cad.",
    total: "Totale",
    payment: "Il pagamento verra riscosso al ristorante.",
    noteLabel: "Note per la cucina",
    notePlaceholder: "Senza cipolla, allergie, posate extra...",
    sending: "Invio richiesta...",
    confirm: "Conferma ordine",
    requestSent: "Richiesta inviata",
    waitingAdmin: "L'admin accettera presto.",
    adminAcceptSoon: "La tua richiesta e stata inviata. L'admin accettera presto.",
    acceptedNotice: "Il tuo ordine e stato accettato. Stiamo stimando il tempo di preparazione.",
    rejected: "Ordine non accettato",
    rejectedSub: "Il ristorante ha rifiutato questa richiesta. Fai un nuovo ordine o chiedi allo staff.",
    orderConfirmed: "Ordine in preparazione",
    inProgress: "Il tuo ordine richiedera circa",
    minutes: "min",
    beingServed: "Il tuo ordine sta arrivando al tavolo. Il nostro team lo portera a breve.",
    completed: "Buon appetito. Grazie.",
    cancelled: "Il tuo ordine e stato annullato.",
    cancelRequested: "Annullamento richiesto. Il ristorante confermera presto.",
    browseMenu: "Sfoglia menu",
    viewOrder: "Vedi ordine",
    newOrder: "Fai un altro ordine",
    feedback: "Lascia feedback",
    itemsOrdered: "Piatti ordinati",
    liveStatus: "Stato ordine",
    tapForDetails: "Dettagli",
    callWaiter: "Chiama cameriere",
    waiterOnWay: "Un cameriere sta arrivando al tuo tavolo.",
  },
};

const cartStorageKey = "circolo:cart";
const cartNoteStorageKey = "circolo:cartNote";
const openCartStorageKey = "circolo:openCart";
const lastOrderStorageKey = "circolo:lastOrder";
const orderRestoreWindowMs = 10 * 60 * 60 * 1000;

function readStoredCart() {
  try {
    const saved = window.localStorage.getItem(cartStorageKey);
    if (!saved) return [];

    const parsed = JSON.parse(saved) as CartItem[];
    return parsed.filter((item) => item.menuItem?.id && item.quantity > 0);
  } catch {
    window.localStorage.removeItem(cartStorageKey);
    return [];
  }
}

function readStoredCartNote() {
  try {
    return window.localStorage.getItem(cartNoteStorageKey) ?? "";
  } catch {
    return "";
  }
}

function shouldOpenStoredCart() {
  try {
    const shouldOpen = window.localStorage.getItem(openCartStorageKey) === "1";
    if (shouldOpen) window.localStorage.removeItem(openCartStorageKey);
    return shouldOpen;
  } catch {
    return false;
  }
}

function canRestoreOrder(order: RestaurantOrder) {
  const createdAt = new Date(order.createdAt).getTime();
  const isExpired = !Number.isFinite(createdAt) || Date.now() - createdAt > orderRestoreWindowMs;
  const isFinished = ["served", "rejected", "cancelled"].includes(order.status);
  return !isExpired && !isFinished;
}

export function MenuExperience({ tableNumber }: MenuExperienceProps) {
  const [language, setLanguage] = useState<"en" | "it">("en");
  const [activeCategory, setActiveCategory] = useState<MenuTab>("All");
  const [query, setQuery] = useState("");
  const [liveMenuItems, setLiveMenuItems] = useState<MenuItem[]>(menuItems);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyMenuPlan | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [order, setOrder] = useState<RestaurantOrder | null>(null);
  const [showOrderStatus, setShowOrderStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [waiterCalled, setWaiterCalled] = useState(false);
  const lastStatusRef = useRef<OrderStatus | null>(null);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.quantity * item.menuItem.price, 0);
  const cartTax = cartSubtotal * 0.1;
  const cartTotal = cartSubtotal + cartTax;
  const today = getCurrentWeekday();
  const copy = customerCopy[language];

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const plannedIds = weeklyPlan?.[today] ?? [];

    const filtered = liveMenuItems.filter((item) => {
      const inTodayPlan = plannedIds.length ? plannedIds.includes(item.id) : true;
      const inCategory =
        normalizedQuery || activeCategory === "All" ? true : item.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        [item.title, item.description, item.category, ...item.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return item.available && inTodayPlan && inCategory && matchesQuery;
    });

    // Float admin-recommended dishes to the top; order is otherwise preserved
    // (Array.prototype.sort is stable in modern engines).
    return filtered.sort(
      (a, b) => Number(Boolean(b.recommended)) - Number(Boolean(a.recommended)),
    );
  }, [activeCategory, liveMenuItems, query, today, weeklyPlan]);

  useEffect(() => {
    setCart(readStoredCart());
    setOrderNote(readStoredCartNote());
    setCartHydrated(true);

    const params = new URLSearchParams(window.location.search);
    if (params.get("cart") === "open" || shouldOpenStoredCart()) {
      setCartOpen(true);
      params.delete("cart");
      const nextQuery = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`);
    }

    function syncStoredCart(event: StorageEvent) {
      if (event.key === cartStorageKey) {
        setCart(readStoredCart());
      }
      if (event.key === cartNoteStorageKey) {
        setOrderNote(readStoredCartNote());
      }
    }

    window.addEventListener("storage", syncStoredCart);
    return () => window.removeEventListener("storage", syncStoredCart);
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  }, [cart, cartHydrated]);

  useEffect(() => {
    if (!cartHydrated) return;
    if (orderNote.trim()) {
      window.localStorage.setItem(cartNoteStorageKey, orderNote);
    } else {
      window.localStorage.removeItem(cartNoteStorageKey);
    }
  }, [cartHydrated, orderNote]);

  useEffect(() => {
    async function loadMenu() {
      try {
        const response = await fetch("/api/menu", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as {
          items?: MenuItem[];
          weeklyPlan?: WeeklyMenuPlan;
        };
        if (data.items?.length) setLiveMenuItems(data.items);
        if (data.weeklyPlan) setWeeklyPlan(data.weeklyPlan);
      } catch {
        // Keep the bundled menu available if the live menu cannot be reached.
      }
    }

    loadMenu();
    const interval = window.setInterval(loadMenu, 5000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(lastOrderStorageKey);
      if (saved) {
        const restoredOrder = JSON.parse(saved) as RestaurantOrder;
        if (canRestoreOrder(restoredOrder)) {
          lastStatusRef.current = restoredOrder.status;
          setOrder(restoredOrder);
        } else {
          window.localStorage.removeItem(lastOrderStorageKey);
        }
      }
    } catch {
      window.localStorage.removeItem(lastOrderStorageKey);
    }
  }, []);

  useEffect(() => {
    if (!order) {
      return;
    }

    if (canRestoreOrder(order)) {
      window.localStorage.setItem(lastOrderStorageKey, JSON.stringify(order));
    } else {
      window.localStorage.removeItem(lastOrderStorageKey);
    }
  }, [order]);

  useEffect(() => {
    if (!order?.id) {
      return;
    }

    const orderId = order.id;
    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { order?: RestaurantOrder };
        if (data.order) {
          if (lastStatusRef.current === "pending" && data.order.status === "preparing") {
            playSfx("accept");
          }
          lastStatusRef.current = data.order.status;
          setOrder(data.order);
        }
      } catch {
        // Keep the current locked order screen visible if a status poll fails.
      }
    }, 2500);

    return () => window.clearInterval(interval);
  }, [order?.id]);

  function addItem(menuItem: MenuItem) {
    setCart((current) => {
      const existing = current.find((item) => item.menuItem.id === menuItem.id);
      if (existing) {
        return current.map((item) =>
          item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...current, { menuItem, quantity: 1 }];
    });
  }

  function adjustQuantity(itemId: string, delta: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.menuItem.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  async function confirmOrder() {
    if (!cart.length || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setOrderError("");
    let timeout: number | undefined;

    try {
      const controller = new AbortController();
      timeout = window.setTimeout(() => controller.abort(), 10000);
      // Table, session, and customer name are derived server-side from the
      // httpOnly session cookie — we only send the cart and note.
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          note: orderNote,
          items: cart.map((item) => ({
            id: item.menuItem.id,
            quantity: item.quantity,
          })),
        }),
      });
      window.clearTimeout(timeout);

      const data = (await response.json()) as {
        order?: RestaurantOrder;
        error?: string;
      };

      if (!response.ok || !data.order) {
        throw new Error(data.error ?? "Unable to place order.");
      }

      setOrder(data.order);
      lastStatusRef.current = data.order.status;
      playSfx("tick");
      navigator.vibrate?.([18, 45, 18]);
      setShowOrderStatus(true);
      setCart([]);
      window.localStorage.removeItem(cartStorageKey);
      window.localStorage.removeItem(cartNoteStorageKey);
      setOrderNote("");
      setCartOpen(false);
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Unable to place order.");
    } finally {
      if (timeout) window.clearTimeout(timeout);
      setIsSubmitting(false);
    }
  }

  async function cancelActiveOrder() {
    if (!order) return;
    try {
      const response = await fetch(`/api/orders?id=${encodeURIComponent(order.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request-cancel" }),
      });
      if (response.ok) {
        const data = (await response.json()) as { order?: RestaurantOrder };
        if (data.order) {
          setOrder(data.order);
          lastStatusRef.current = data.order.status;
        }
      }
    } catch {
      // The status poll reconciles if the request fails transiently.
    }
  }

  async function callWaiter() {
    if (waiterCalled) return;
    setWaiterCalled(true);
    navigator.vibrate?.([25, 40, 25]);
    try {
      await fetch("/api/assistance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber }),
      });
      playSfx("send");
    } catch {
      // The confirmation still shows; the request is best-effort.
    }
    window.setTimeout(() => setWaiterCalled(false), 8000);
  }

  function clearCompletedOrder() {
    window.localStorage.removeItem(lastOrderStorageKey);
    lastStatusRef.current = null;
    setOrder(null);
    setShowOrderStatus(false);
  }

  if (order && showOrderStatus) {
    return (
      <OrderStatusScreen
        order={order}
        menuItems={liveMenuItems}
        language={language}
        onBrowseMenu={() => setShowOrderStatus(false)}
        onOrderMore={clearCompletedOrder}
        onCancel={cancelActiveOrder}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#faf0e8] text-[#1a1410]">
      {/* Call-waiter confirmation */}
      <AnimatePresence>
        {waiterCalled && (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            className="fixed left-1/2 top-4 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#1a1410] px-5 py-2.5 text-[14px] font-bold text-white shadow-[0_10px_30px_rgba(26,20,16,0.3)]"
          >
            <BellRing className="h-4 w-4 text-[#f6b98d]" />
            {copy.waiterOnWay}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header — brand green with centered logo */}
      <header className="sticky top-0 z-20 bg-[#c4703c] px-4 pb-3 pt-safe-4">
        <div className="mx-auto max-w-xl">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            {/* left — table + active order */}
            <div className="flex items-center gap-2 justify-self-start">
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-bold text-white">
                {copy.table} {tableNumber}
              </span>
              {order && (
                <button
                  onClick={() => setShowOrderStatus(true)}
                  className="rounded-full bg-white/15 px-2.5 py-1.5 text-[13px] font-bold text-white"
                >
                  #{order.orderNumber}
                </button>
              )}
            </div>

            {/* center — logo */}
            <Image
              src="/images/logo.png"
              alt="Circolo del Bridge"
              width={546}
              height={424}
              priority
              unoptimized
              className="h-16 w-auto justify-self-center"
            />

            {/* right — call waiter + language */}
            <div className="flex items-center gap-2 justify-self-end">
              <button
                onClick={callWaiter}
                disabled={waiterCalled}
                aria-label={copy.callWaiter}
                title={copy.callWaiter}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25 disabled:opacity-70"
              >
                <BellRing className="h-[18px] w-[18px]" />
              </button>
              <button
                onClick={() => setLanguage((current) => (current === "en" ? "it" : "en"))}
                className="h-9 w-9 rounded-full bg-white/15 text-xs font-bold text-white"
                aria-label="Change language"
              >
                {language === "en" ? "IT" : "EN"}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#736860]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.search}
                className="h-11 w-full rounded-full border-0 bg-white pl-10 pr-4 text-[15px] text-[#1a1410] outline-none placeholder:text-[#a89e94]"
              />
            </label>
          </div>
        </div>
      </header>

      {/* Category chips */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto border-b border-[#e8ddd2] bg-[#faf0e8] px-4 py-3">
        {menuTabs.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`shrink-0 rounded-full px-4 py-2 text-[15px] font-bold transition ${
              activeCategory === category
                ? "bg-[#c4703c] text-white shadow-[0_2px_8px_rgba(196,112,60,0.25)]"
                : "bg-white text-[#47403a] shadow-[0_1px_3px_rgba(40,28,20,0.08)]"
            }`}
          >
            {copy.categoryLabels[category] || category}
          </button>
        ))}
      </div>

      {/* Section header */}
      <div className="mx-auto max-w-xl px-4 pb-2 pt-4">
        <div className="flex items-baseline gap-2">
          <h2 className="font-serif text-xl font-bold text-[#1a1410]">
            {query.trim() ? copy.searchResults : activeCategory === "All" ? copy.fresh : copy.categoryLabels[activeCategory] || activeCategory}
          </h2>
          <span className="text-sm text-[#736860]">{visibleItems.length} {copy.dishes}</span>
        </div>
      </div>

      {/* Item list — single column matching design */}
      <div className="mx-auto max-w-xl space-y-3 px-4 pb-32 pt-1">
        <AnimatePresence mode="popLayout">
          {visibleItems.map((item) => {
            const qty = cart.find((c) => c.menuItem.id === item.id)?.quantity ?? 0;
            return (
              <MenuCard
                key={item.id}
                item={item}
                qty={qty}
                onAdd={() => addItem(item)}
                onSetQty={(q) => {
                  if (q <= 0) adjustQuantity(item.id, -qty);
                  else adjustQuantity(item.id, q - qty);
                }}
                addLabel={copy.add}
                detailLabel={copy.tapForDetails}
              />
            );
          })}
        </AnimatePresence>

        {!visibleItems.length && (
          <div className="rounded-2xl border border-dashed border-[#e8ddd2] bg-white p-8 text-center text-[#736860]">
            {copy.noDishes} {copy.categoryLabels[activeCategory] || activeCategory}.
          </div>
        )}
      </div>

      {/* Cart bar — fixed bottom, matches design */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e8ddd2] bg-[#faf0e8] px-4 pb-5 pt-2.5 shadow-[0_-6px_20px_rgba(40,28,20,0.08)]"
          >
            <button
              onClick={() => setCartOpen(true)}
              className="mx-auto flex h-14 w-full max-w-xl items-center justify-between rounded-full bg-[#c4703c] px-5 text-white"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[15px] font-bold text-[#c4703c]">
                  {cartCount}
                </span>
                <span className="text-[18px] font-bold">{copy.viewOrder}</span>
              </span>
              <span className="font-serif text-[21px] font-bold">{formatEuro(cartTotal)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CartSheet
        cart={cart}
        cartTotal={cartTotal}
        open={cartOpen}
        isSubmitting={isSubmitting}
        onClose={() => setCartOpen(false)}
        onQuantity={adjustQuantity}
        onConfirm={confirmOrder}
        orderError={orderError}
        note={orderNote}
        onNote={setOrderNote}
        copy={copy}
      />
    </main>
  );
}

function MenuCard({
  item,
  qty,
  onAdd,
  onSetQty,
  addLabel,
}: {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onSetQty: (q: number) => void;
  addLabel: string;
  detailLabel: string;
}) {
  const details = getRecipeDetails(item);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="overflow-hidden rounded-2xl border border-[#e8ddd2] bg-white shadow-[0_2px_8px_rgba(60,40,28,0.07)]"
    >
      {/* Hero image with badges */}
      <Link href={`/menu/${item.id}`} className="relative block h-[140px] overflow-hidden">
        <DishImage
          src={item.image}
          alt={item.title}
          width={600}
          height={280}
          className="h-full w-full object-cover"
          sizes="(min-width: 640px) 576px, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55" />
        <div className="absolute bottom-2.5 left-3 flex flex-wrap gap-1.5">
          {(details.recommended || item.recommended) && (
            <span className="rounded-full bg-[#c4703c] px-2.5 py-0.5 text-xs font-bold text-white">
              Recommended
            </span>
          )}
          {details.highlyReordered && (
            <span className="rounded-full bg-white/92 px-2.5 py-0.5 text-xs font-bold text-[#47403a]">
              Reordered
            </span>
          )}
        </div>
      </Link>

      {/* Card body */}
      <div className="px-3.5 pb-3.5 pt-3">
        <p className="text-[13px] font-bold uppercase tracking-[0.06em] text-[#6b8fa6]">{item.category}</p>
        <h3 className="mt-0.5 font-serif text-[18px] font-bold leading-tight text-[#1a1410]">{item.title}</h3>
        <p className="mt-1 line-clamp-2 text-[14px] leading-snug text-[#736860]">{item.description}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] text-[#736860]">⭐ {details.rating}</span>
            <span className="font-serif text-[18px] font-bold text-[#c4703c]">{formatEuro(item.price)}</span>
          </div>
          {qty > 0 ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onSetQty(qty - 1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#c4703c] bg-white text-[#c4703c]"
                aria-label="Decrease"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[2ch] text-center text-[20px] font-bold text-[#1a1410]">{qty}</span>
              <button
                onClick={() => onSetQty(qty + 1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#c4703c] bg-white text-[#c4703c]"
                aria-label="Increase"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              className="h-12 rounded-full border-2 border-[#c4703c] px-5 text-[17px] font-bold text-[#c4703c] transition hover:bg-[#fae7d6]"
            >
              {addLabel}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function CartSheet({
  cart,
  cartTotal,
  open,
  isSubmitting,
  onClose,
  onQuantity,
  onConfirm,
  orderError,
  note,
  onNote,
  copy,
}: {
  cart: CartItem[];
  cartTotal: number;
  open: boolean;
  isSubmitting: boolean;
  orderError: string;
  note: string;
  copy: CustomerCopy;
  onClose: () => void;
  onQuantity: (itemId: string, delta: number) => void;
  onConfirm: () => void;
  onNote: (value: string) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            className="fixed inset-0 z-40 bg-black/40"
            aria-label="Close cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex h-[min(92dvh,760px)] max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-[#faf0e8] text-[#1a1410] shadow-[0_-8px_28px_rgba(40,28,20,0.16)]"
          >
            <div className="mx-auto mt-3 h-1.5 w-11 rounded-full bg-[#d6c9b8]" />
            <div className="shrink-0 flex items-center justify-between border-b border-[#e8ddd2] px-5 py-4">
              <h2 className="font-serif text-[26px] font-bold text-[#1a1410]">{copy.cart}</h2>
              <button
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e8ddd2] bg-white text-[22px] text-[#47403a]"
              >
                ×
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
              {cart.map((item) => (
                <div key={item.menuItem.id} className="flex items-center gap-3 border-b border-[#e8ddd2] py-3.5">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-[17px] font-bold leading-tight text-[#1a1410]">{item.menuItem.title}</h3>
                    <p className="mt-0.5 text-[14px] text-[#736860]">{formatEuro(item.menuItem.price)} {copy.each}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onQuantity(item.menuItem.id, -1)}
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#d6c9b8] bg-white text-[#c4703c]"
                      aria-label={`Decrease ${item.menuItem.title}`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2ch] text-center text-[20px] font-bold text-[#1a1410]">{item.quantity}</span>
                    <button
                      onClick={() => onQuantity(item.menuItem.id, 1)}
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#d6c9b8] bg-white text-[#c4703c]"
                      aria-label={`Increase ${item.menuItem.title}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="min-w-[4ch] text-right font-serif text-[17px] font-bold text-[#1a1410]">
                    {formatEuro(item.menuItem.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => onQuantity(item.menuItem.id, -item.quantity)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#736860]"
                    aria-label={`Remove ${item.menuItem.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="shrink-0 border-t border-[#e8ddd2] bg-[#faf0e8] px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
              <label className="mb-4 block">
                <span className="mb-2 block text-[16px] font-semibold text-[#1a1410]">{copy.noteLabel}</span>
                <textarea
                  value={note}
                  onChange={(event) => onNote(event.target.value)}
                  maxLength={500}
                  placeholder={copy.notePlaceholder}
                  rows={2}
                  className="w-full resize-none rounded-xl border-2 border-[#d6c9b8] bg-white p-3 font-[inherit] text-[16px] text-[#1a1410] outline-none focus:border-[#c4703c]"
                />
              </label>
              <div className="mb-4 flex items-baseline justify-between border-t border-[#e8ddd2] pt-3">
                <span className="font-serif text-[22px] font-bold text-[#1a1410]">{copy.total}</span>
                <span className="font-serif text-[28px] font-bold text-[#c4703c]">{formatEuro(cartTotal)}</span>
              </div>
              {orderError && (
                <p className="mb-4 rounded-xl bg-[#f7e1de] px-3 py-2 text-sm font-semibold text-[#b3261e]">
                  {orderError}
                </p>
              )}
              <button
                onClick={onConfirm}
                disabled={!cart.length || isSubmitting}
                className="flex h-14 w-full items-center justify-center rounded-full bg-[#c4703c] text-[19px] font-bold text-white transition hover:bg-[#a35a2c] disabled:cursor-not-allowed disabled:bg-[#d6c9b8]"
              >
                {isSubmitting ? copy.sending : copy.confirm}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function ActiveOrderCancelCard({
  order,
  onCancel,
}: {
  order: RestaurantOrder;
  onCancel: () => void | Promise<void>;
}) {
  const [revealed, setRevealed] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [busy, setBusy] = useState(false);

  async function confirmCancel() {
    setBusy(true);
    try {
      await onCancel();
    } finally {
      setBusy(false);
      setStep(0);
      setRevealed(false);
    }
  }

  return (
    <div className="mb-4">
      <div className="relative overflow-hidden rounded-2xl border border-[#e8ddd2]">
        {/* Red action revealed on swipe-left */}
        <div className="absolute inset-y-0 right-0 flex items-stretch">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 bg-[#b3261e] px-5 text-sm font-bold text-white"
          >
            <Trash2 className="h-4 w-4" /> Cancel Order
          </button>
        </div>
        {/* Draggable front card */}
        <motion.div
          drag="x"
          dragConstraints={{ left: -150, right: 0 }}
          dragElastic={0.06}
          animate={{ x: revealed ? -150 : 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          onDragEnd={(_, info) => setRevealed(info.offset.x < -70)}
          className="relative flex touch-pan-y items-center justify-between gap-3 bg-white px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold text-[#1a1410]">Active order · #{order.orderNumber}</p>
            <p className="text-[13px] text-[#736860]">Swipe left to cancel</p>
          </div>
          <span className="shrink-0 rounded-full bg-[#fae7d6] px-3 py-1 text-xs font-bold text-[#a35a2c]">
            {orderStatusLabels[order.status]}
          </span>
        </motion.div>
      </div>

      {step > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            {step === 1 ? (
              <>
                <h3 className="text-lg font-extrabold text-[#1a1410]">Cancel Order?</h3>
                <p className="mt-2 text-sm text-[#47403a]">Are you sure you want to cancel this order?</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setStep(0);
                      setRevealed(false);
                    }}
                    className="h-12 rounded-2xl border border-[#d6c9b8] bg-[#faf0e8] text-sm font-bold text-[#1a1410]"
                  >
                    Keep Order
                  </button>
                  <button onClick={() => setStep(2)} className="h-12 rounded-2xl bg-[#c4703c] text-sm font-bold text-white">
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-extrabold text-[#b3261e]">Final Confirmation</h3>
                <p className="mt-2 text-sm text-[#47403a]">This action cannot be undone.</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    disabled={busy}
                    onClick={() => setStep(1)}
                    className="h-12 rounded-2xl border border-[#d6c9b8] bg-[#faf0e8] text-sm font-bold text-[#1a1410] disabled:opacity-60"
                  >
                    Go Back
                  </button>
                  <button
                    disabled={busy}
                    onClick={confirmCancel}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#b3261e] text-sm font-bold text-white disabled:opacity-60"
                  >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    Cancel Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderStatusScreen({
  order,
  menuItems,
  language,
  onBrowseMenu,
  onOrderMore,
  onCancel,
}: {
  order: RestaurantOrder;
  menuItems: MenuItem[];
  language: "en" | "it";
  onBrowseMenu: () => void;
  onOrderMore: () => void;
  onCancel: () => void | Promise<void>;
}) {
  const copy = customerCopy[language];
  const [, setTick] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const acceptedTime = order.acceptedAt ? new Date(order.acceptedAt).getTime() : null;
  const hasPrepEstimate = order.prepMinutes > 0;
  const targetTime = acceptedTime && hasPrepEstimate ? acceptedTime + order.prepMinutes * 60 * 1000 : null;
  const remainingMs = targetTime ? Math.max(0, targetTime - Date.now()) : 0;
  const remainingMinutes = Math.max(0, Math.ceil(remainingMs / 60000));
  const isPending = order.status === "pending";
  const isRejected = order.status === "rejected";
  const isCancelled = order.status === "cancelled";
  const isCancelRequested = order.status === "cancel_requested";
  const isBeingServed = order.status === "ready";
  const isCompleted = order.status === "served";
  const isEstimating = order.status === "preparing" && order.prepMinutes <= 0;
  const isPreparing = order.status === "preparing" && order.prepMinutes > 0;
  const isTerminal = isCompleted || isRejected || isCancelled;
  const menuById = useMemo(() => new Map(menuItems.map((item) => [item.id, item])), [menuItems]);
  const orderedItems = order.items.map((item) => {
    const menuItem = menuById.get(item.id);
    return {
      ...item,
      image: menuItem?.image ?? "",
      prepMinutes: menuItem?.prepMinutes ?? order.prepMinutes,
      description: menuItem?.description ?? "",
    };
  });
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const statusHeading = isCancelled
    ? "Cancelled"
    : isRejected
      ? "Rejected"
      : isCancelRequested
        ? "Cancel Requested"
        : isBeingServed
          ? "Ready for Delivery"
          : isCompleted
            ? "Delivered"
            : order.status === "preparing"
              ? "Preparing"
              : "Order Received";
  const statusNotice = isRejected
    ? copy.rejectedSub
    : isCancelled
      ? copy.cancelled
      : isCancelRequested
        ? copy.cancelRequested
        : isPending
          ? "We have received your order. Please wait while our staff reviews it."
          : isEstimating
            ? copy.acceptedNotice
            : isPreparing
              ? `${copy.inProgress} ${Math.max(1, remainingMinutes || order.prepMinutes)} ${copy.minutes}.`
              : isBeingServed
                ? copy.beingServed
                : copy.completed;
  const stageOrder: OrderStatus[] = ["pending", "preparing", "ready", "served"];
  const rawStageIndex = stageOrder.indexOf(order.status);
  const currentStageIndex = rawStageIndex >= 0 ? rawStageIndex : isCancelRequested ? 1 : 0;
  const fmtTime = (iso?: string) =>
    iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  const timeline = [
    { label: "Order Received", helper: "We have received your order.", icon: ReceiptText, time: fmtTime(order.createdAt) },
    { label: "Preparing", helper: "Our chef is preparing your order.", icon: CookingPot, time: fmtTime(order.acceptedAt) },
    { label: "Ready for Delivery", helper: "Your order is ready and on its way to the table.", icon: PackageCheck, time: "" },
    { label: "Delivered", helper: "Enjoy your meal. Thank you.", icon: PackageCheck, time: fmtTime(order.deliveredAt) },
  ].map((step, index) => ({
    ...step,
    done: index < currentStageIndex || (isCompleted && index === currentStageIndex),
    active: index === currentStageIndex && !isCompleted,
  }));
  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#faf0e8] px-4 py-5 text-[#1a1410]">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl rounded-[30px] border border-[#e8ddd2] bg-white p-5 shadow-[0_18px_50px_rgba(25,22,20,0.12)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBrowseMenu}
            className="grid h-11 w-11 place-items-center rounded-full border border-[#e8ddd2] bg-[#faf0e8] text-[#1a1410]"
            aria-label="Back to menu"
          >
            <ReceiptText className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-extrabold">Order #{order.orderNumber}</h1>
          <span className="rounded-full bg-[#fae7d6] px-3 py-2 text-xs font-bold text-[#a35a2c]">
            {totalItems} item{totalItems === 1 ? "" : "s"}
          </span>
        </div>

        {(order.status === "pending" || order.status === "preparing") && (
          <ActiveOrderCancelCard order={order} onCancel={onCancel} />
        )}

        <div className="text-center">
          <p className="text-sm font-semibold text-[#736860]">Status</p>
          <p className="mt-1 text-3xl font-extrabold text-[#c4703c]">{statusHeading}</p>
          <div className="mx-auto mt-4 h-36 w-52 overflow-hidden rounded-[50%] bg-[#faf0e8] shadow-[0_18px_34px_rgba(25,22,20,0.13)]">
            {orderedItems[0]?.image ? (
              <DishImage
                src={orderedItems[0].image}
                alt=""
                width={320}
                height={220}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-[#c4703c]">
                <CookingPot className="h-12 w-12" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="mb-3 text-sm font-extrabold uppercase tracking-[0.14em] text-[#47403a]">
            Ordered dishes
          </h2>
          <div className="space-y-2">
            {orderedItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[#e8ddd2] bg-[#faf0e8] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-extrabold leading-5 text-[#1a1410]">{item.title}</p>
                    <p className="mt-1 line-clamp-1 text-sm font-semibold text-[#736860]">
                      {item.category} · {item.prepMinutes > 0 ? `${item.prepMinutes} min` : "Prep time pending"}
                    </p>
                  </div>
                  <p className="shrink-0 text-base font-extrabold text-[#1a1410]">{formatEuro(item.lineTotal)}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-[#736860]">
                  <span>Quantity</span>
                  <span>x{item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`mt-4 flex items-center gap-3 rounded-2xl p-4 ${
          isRejected || isCancelled ? "bg-[#f7e1de] text-[#b3261e]" : "bg-[#1a1410] text-white"
        }`}>
          {(isPending || isEstimating || isPreparing || isCancelRequested) && <Loader2 className="h-5 w-5 shrink-0 animate-spin" />}
          <p className="text-sm font-bold">
            {statusNotice}
          </p>
        </div>

        {feedbackOpen && (
          <div className="mt-4 rounded-2xl border border-[#e8ddd2] bg-[#faf0e8] p-4">
            {feedbackSent ? (
              <p className="text-sm font-bold text-[#2f7d4f]">Thank you. Your feedback has been received.</p>
            ) : (
              <>
                <label className="text-sm font-bold text-[#47403a]" htmlFor="order-feedback">
                  How was your experience?
                </label>
                <textarea
                  id="order-feedback"
                  className="mt-2 min-h-24 w-full resize-y rounded-2xl border border-[#e8ddd2] bg-white p-3 text-sm outline-none focus:border-[#c4703c] focus:ring-4 focus:ring-[#c4703c]/20"
                  placeholder="Tell us what went well or what we can improve..."
                />
                <button
                  onClick={() => setFeedbackSent(true)}
                  className="mt-3 h-12 w-full rounded-2xl bg-[#c4703c] text-sm font-bold text-white"
                >
                  Send Feedback
                </button>
              </>
            )}
          </div>
        )}

        <div className="mt-6 space-y-0">
          {timeline.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="grid grid-cols-[44px_1fr_auto] gap-3">
                <div className="flex flex-col items-center">
                  <div className={`grid h-9 w-9 place-items-center rounded-full text-white ${
                    step.done ? "bg-[#c4703c]" : step.active ? "bg-[#6b8fa6]" : "bg-[#a89e94]"
                  }`}>
                    {step.done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  {index < timeline.length - 1 && <div className="h-12 w-px bg-[#d6c9b8]" />}
                </div>
                <div className="pb-5">
                  <p className="text-base font-extrabold">{step.label}</p>
                  <p className="mt-1 text-sm leading-5 text-[#47403a]">{step.helper}</p>
                </div>
                <p className="pt-1 text-xs font-bold text-[#736860]">{step.time}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {isTerminal ? (
            <>
              <button
                onClick={onOrderMore}
                className="h-12 rounded-2xl bg-[#c4703c] text-sm font-bold text-white"
              >
                {copy.newOrder}
              </button>
              <button
                onClick={() => setFeedbackOpen((current) => !current)}
                className="h-12 rounded-2xl border border-[#d6c9b8] bg-[#faf0e8] text-sm font-bold text-[#1a1410]"
              >
                {copy.feedback}
              </button>
            </>
          ) : (
            <button
              onClick={onBrowseMenu}
              className="h-12 rounded-2xl border border-[#d6c9b8] bg-[#faf0e8] text-sm font-bold text-[#1a1410] sm:col-span-2"
            >
              {copy.browseMenu}
            </button>
          )}
        </div>
      </motion.section>
    </main>
  );
}
