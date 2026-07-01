"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  Clock3,
  Leaf,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  WheatOff,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DishImage } from "@/components/dish-image";
import { formatEuro, type MenuItem } from "@/lib/menu";
import type { CartItem } from "@/lib/orders";
import { playSfx } from "@/lib/sfx";

const cartStorageKey = "circolo:cart";
const cartNoteStorageKey = "circolo:cartNote";
const openCartStorageKey = "circolo:openCart";

type DishDetailExperienceProps = {
  dish: MenuItem;
};

type AccordionKey = "ingredients" | "allergens" | "notes";

function readCart() {
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

function getCartCount(cart: CartItem[]) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function writeCart(cart: CartItem[]) {
  window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  window.dispatchEvent(new StorageEvent("storage", { key: cartStorageKey }));
}

function writeCartNote(note: string) {
  const trimmed = note.trim();
  if (trimmed) {
    window.localStorage.setItem(cartNoteStorageKey, trimmed);
  } else {
    window.localStorage.removeItem(cartNoteStorageKey);
  }
  window.dispatchEvent(new StorageEvent("storage", { key: cartNoteStorageKey }));
}

function requestCartOpen() {
  window.localStorage.setItem(openCartStorageKey, "1");
}

function italianName(title: string) {
  if (title.includes("Panna")) return "Panna Cotta alla Vaniglia";
  if (title.includes("Tiramisu")) return "Tiramisu Classico";
  if (title.includes("Limonata")) return "Limonata Siciliana";
  return title;
}

function ingredientList(dish: MenuItem) {
  if (dish.tags.includes("pizza")) {
    return [
      { icon: "🍅", name: "San Marzano tomato", badge: "Imported" },
      { icon: "🧀", name: "Fior di latte", badge: "Fresh" },
      { icon: "🌿", name: "Fresh basil", badge: "Organic" },
      { icon: "🫒", name: "Extra virgin olive oil", badge: "House Made" },
      { icon: "🧂", name: "Sea salt", badge: "Seasonal" },
    ];
  }

  if (dish.tags.includes("pasta")) {
    return [
      { icon: "🍝", name: "Fresh pasta", badge: "House Made" },
      { icon: "🧀", name: "Parmigiano Reggiano", badge: "Imported" },
      { icon: "🧄", name: "Garlic", badge: "Fresh" },
      { icon: "🌿", name: "Italian herbs", badge: "Organic" },
      { icon: "🫒", name: "Extra virgin olive oil", badge: "Seasonal" },
    ];
  }

  if (dish.category === "Cocktails") {
    return [
      { icon: "🍊", name: "Orange", badge: "Fresh" },
      { icon: "🍾", name: "Prosecco", badge: "Imported" },
      { icon: "🧊", name: "Clear ice", badge: "House Made" },
      { icon: "🌿", name: "Aromatic garnish", badge: "Seasonal" },
      { icon: "✨", name: "Italian aperitivo", badge: "Premium" },
    ];
  }

  if (dish.category === "Desserts") {
    return [
      { icon: "🥛", name: "Mascarpone cream", badge: "Fresh" },
      { icon: "🌰", name: "Almond crumble", badge: "House Made" },
      { icon: "🍓", name: "Seasonal fruit", badge: "Seasonal" },
      { icon: "🍫", name: "Cocoa", badge: "Imported" },
      { icon: "✨", name: "Vanilla", badge: "Organic" },
    ];
  }

  return [
    { icon: "🌿", name: "Seasonal produce", badge: "Seasonal" },
    { icon: "🌱", name: "Italian herbs", badge: "Organic" },
    { icon: "🥣", name: "House sauce", badge: "House Made" },
    { icon: "🫒", name: "Extra virgin olive oil", badge: "Imported" },
    { icon: "🧂", name: "Sea salt", badge: "Fresh" },
  ];
}

function dietaryInfo(dish: MenuItem) {
  const text = `${dish.title} ${dish.description} ${dish.tags.join(" ")}`.toLowerCase();
  const containsGluten = ["pasta", "pizza", "bread", "sandwich", "sourdough", "ravioli", "gnocchi"].some((value) => text.includes(value));
  const containsDairy = ["cheese", "burrata", "mozzarella", "cream", "mascarpone", "milk", "parmesan", "gelato"].some((value) => text.includes(value));
  const containsNuts = ["nut", "almond", "pistachio", "walnut"].some((value) => text.includes(value));
  const vegetarian = dish.tags.includes("vegetarian") || ["Pizza", "Desserts", "Drinks", "Coffee"].includes(dish.category);
  const vegan = dish.tags.includes("vegan");
  const alcohol = dish.category === "Cocktails" || ["negroni", "spritz", "martini", "bellini"].some((value) => text.includes(value));

  return [
    containsDairy && { label: "Contains Dairy", icon: AlertTriangle, tone: "warning" },
    containsGluten && { label: "Contains Gluten", icon: WheatOff, tone: "warning" },
    !containsNuts && { label: "Nut Free", icon: ShieldCheck, tone: "safe" },
    vegetarian && { label: "Vegetarian", icon: Leaf, tone: "safe" },
    vegan && { label: "Vegan", icon: Leaf, tone: "safe" },
    !alcohol && !text.includes("pork") && { label: "Halal Friendly", icon: ShieldCheck, tone: "safe" },
    alcohol && { label: "Contains Alcohol", icon: AlertTriangle, tone: "warning" },
  ].filter(Boolean) as Array<{ label: string; icon: typeof AlertTriangle; tone: "safe" | "warning" }>;
}

export function DishDetailExperience({ dish }: DishDetailExperienceProps) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [openSections, setOpenSections] = useState<Record<AccordionKey, boolean>>({
    ingredients: true,
    allergens: true,
    notes: true,
  });
  const ingredients = useMemo(() => ingredientList(dish), [dish]);
  const dietary = useMemo(() => dietaryInfo(dish), [dish]);

  useEffect(() => {
    setCartCount(getCartCount(readCart()));

    function syncStoredCart(event: StorageEvent) {
      if (event.key === cartStorageKey) {
        setCartCount(getCartCount(readCart()));
      }
    }

    window.addEventListener("storage", syncStoredCart);
    return () => window.removeEventListener("storage", syncStoredCart);
  }, []);

  function toggleSection(section: AccordionKey) {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  function addToCart(item: MenuItem, itemQuantity = 1) {
    const cart = readCart();
    const existing = cart.find((entry) => entry.menuItem.id === item.id);
    const nextCart = existing
      ? cart.map((entry) =>
          entry.menuItem.id === item.id
            ? { ...entry, quantity: entry.quantity + itemQuantity }
            : entry,
        )
      : [...cart, { menuItem: item, quantity: itemQuantity }];

    writeCart(nextCart);
    writeCartNote(note);
    setCartCount(getCartCount(nextCart));
    playSfx("send");
  }

  function addMainDish() {
    addToCart(dish, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <main className="min-h-screen bg-[#FFF8F1] pb-28 text-[#101614]">
      <section className="mx-auto max-w-3xl">
        <div className="relative h-[35dvh] min-h-[284px] max-h-[460px] overflow-hidden bg-[#F6E8DA]">
          <DishImage
            src={dish.image}
            alt={dish.title}
            width={1200}
            height={900}
            sizes="(min-width: 768px) 768px, 100vw"
            className="absolute inset-0 h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/36 via-black/5 to-black/16" />
          <div className="absolute left-5 right-5 top-5 flex items-center justify-between pt-[env(safe-area-inset-top)]">
            <Link href="/menu" className="grid h-14 w-14 place-items-center rounded-full bg-white/96 text-[#D06A49] shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <Link
              href="/menu?cart=open"
              onClick={() => {
                writeCartNote(note);
                requestCartOpen();
              }}
              className="relative grid h-14 w-14 place-items-center rounded-full bg-white/96 text-[#D06A49] shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {!!cartCount && (
                <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-[#D06A49] px-1 text-xs font-extrabold text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <section className="relative -mt-6 rounded-t-[30px] bg-white px-5 pb-7 pt-5 shadow-[0_-18px_40px_rgba(25,22,20,0.12)]">
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-[#D95B3D]">{dish.category}</p>
              <h1 className="mt-4 text-[2rem] font-black leading-[1.02] tracking-normal text-[#101614]">
                {dish.title}
              </h1>
              <p className="mt-2 text-lg font-extrabold text-[#E44B2D]">{italianName(dish.title)}</p>
              <p className="mt-3 max-w-xl text-[15px] font-medium leading-6 text-[#414A48]">{dish.description}</p>
            </div>
            <div className="pt-14 text-right">
              <p className="whitespace-nowrap text-[1.85rem] font-black leading-none text-[#D06A49]">{formatEuro(dish.price)}</p>
              <p className="mt-1.5 text-xs font-semibold text-[#6C716E]">Tax shown in cart</p>
            </div>
          </div>

          <div className="my-4 h-px bg-[#E8DDD2]" />

          <section className="rounded-2xl border border-[#E8DDD2] bg-[#FFF8F1] p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#D06A49] shadow-sm">
                <Clock3 className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-[#69716D]">Preparation Time</span>
                <span className="text-xl font-black text-[#101614]">{dish.prepMinutes} min</span>
              </span>
            </div>
          </section>

          <div className="my-4 h-px bg-[#E8DDD2]" />

          <div className="divide-y divide-[#E8DDD2]">
            <AccordionSection
              title="Ingredients"
              subtitle="What makes this special"
              icon={<Leaf className="h-6 w-6" />}
              open={openSections.ingredients}
              onToggle={() => toggleSection("ingredients")}
            >
              <div className="divide-y divide-[#EEE4DA]">
                {ingredients.map((ingredient) => (
                  <div key={ingredient.name} className="grid grid-cols-[34px_1fr_auto] items-center gap-3 py-3">
                    <span className="text-xl">{ingredient.icon}</span>
                    <span className="text-[15px] font-bold text-[#202825]">{ingredient.name}</span>
                    <span className="rounded-full bg-[#FFF0E8] px-2.5 py-1 text-[11px] font-extrabold text-[#A5482E]">
                      {ingredient.badge}
                    </span>
                  </div>
                ))}
              </div>
            </AccordionSection>

            <AccordionSection
              title="Allergens & Dietary"
              subtitle="Important information for your health"
              icon={<ShieldCheck className="h-6 w-6" />}
              open={openSections.allergens}
              onToggle={() => toggleSection("allergens")}
            >
              <div className="grid grid-cols-2 gap-2">
                {dietary.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`flex min-h-12 items-center gap-2 rounded-2xl border px-3 text-sm font-extrabold ${
                        item.tone === "safe"
                          ? "border-[#DCE9DF] bg-[#F2FAF3] text-[#23523B]"
                          : "border-[#F2D3C6] bg-[#FFF1EA] text-[#94452F]"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </AccordionSection>

            <AccordionSection
              title="Customer Notes"
              subtitle="Allergies, spice level, or special requests"
              open={openSections.notes}
              onToggle={() => toggleSection("notes")}
            >
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
                placeholder="No onions, extra spicy, allergy details..."
                className="min-h-24 w-full resize-y rounded-2xl border border-[#D9C8B5] bg-[#FFF8F1] p-4 text-base font-medium text-[#191614] outline-none placeholder:text-[#82766C] focus:border-[#D06A49] focus:ring-4 focus:ring-[#D06A49]/20"
              />
            </AccordionSection>
          </div>
        </section>
      </section>

      <section className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto grid max-w-3xl grid-cols-[128px_1fr] items-center gap-4 rounded-[28px] bg-white p-3 shadow-[0_-10px_40px_rgba(25,22,20,0.18)]">
          <div className="flex h-14 items-center justify-between rounded-full bg-white px-3 shadow-[0_8px_24px_rgba(25,22,20,0.10)]">
            <button onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="grid h-10 w-10 place-items-center rounded-full text-[#D06A49]" aria-label="Decrease quantity">
              <Minus className="h-5 w-5" />
            </button>
            <span className="text-xl font-black tabular-nums">{String(quantity).padStart(2, "0")}</span>
            <button onClick={() => setQuantity((current) => current + 1)} className="grid h-11 w-11 place-items-center rounded-full bg-[#D06A49] text-white shadow-[0_10px_22px_rgba(208,106,73,0.25)]" aria-label="Increase quantity">
              <Plus className="h-6 w-6" />
            </button>
          </div>
          <button
            onClick={addMainDish}
            className="flex min-h-14 items-center justify-center rounded-full bg-[#D06A49] px-5 text-lg font-extrabold text-white shadow-[0_14px_30px_rgba(208,106,73,0.28)]"
          >
            {added ? "Added" : "Add To Order"}
          </button>
        </div>
      </section>
    </main>
  );
}

function AccordionSection({
  title,
  subtitle,
  icon,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="py-4">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="flex min-w-0 items-center gap-4">
          {icon && (
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#F7F3EE] text-[#D06A49]">
              {icon}
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-[20px] font-black leading-6 text-[#101614]">{title}</span>
            {subtitle && <span className="mt-0.5 block text-[14px] font-medium leading-5 text-[#4F5B57]">{subtitle}</span>}
          </span>
        </span>
        <ChevronDown className={`h-6 w-6 shrink-0 text-[#D06A49] transition ${open ? "rotate-180" : "-rotate-90"}`} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.22 }}
          className={`${icon ? "pl-16" : ""} pt-3`}
        >
          {children}
        </motion.div>
      )}
    </section>
  );
}
