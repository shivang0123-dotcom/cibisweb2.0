"use client";

import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatEuro, type MenuItem } from "@/lib/menu";
import type { CartItem } from "@/lib/orders";
import { playSfx } from "@/lib/sfx";

const cartStorageKey = "circolo:cart";

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

function writeCart(cart: CartItem[]) {
  window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
}

export function DishDetailActions({ item }: { item: MenuItem }) {
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const cartHref = "/menu?cart=open";

  function addToCart() {
    const cart = readCart();
    const existing = cart.find((entry) => entry.menuItem.id === item.id);
    const nextCart = existing
      ? cart.map((entry) =>
          entry.menuItem.id === item.id ? { ...entry, quantity: entry.quantity + quantity } : entry,
        )
      : [...cart, { menuItem: item, quantity }];

    writeCart(nextCart);
    playSfx("send");
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <section className="rounded-[26px] border border-[#E2CEBA] bg-white p-4 shadow-[0_12px_28px_rgba(25,22,20,0.08)]">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6B5F55]">Ready to order</p>
          <p className="mt-1 text-2xl font-extrabold text-[#191614]">{formatEuro(item.price * quantity)}</p>
        </div>
        <div className="flex h-12 w-32 items-center justify-between rounded-2xl border border-[#D9C8B5] bg-[#FFF8F1] px-2">
          <button
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            className="grid h-9 w-9 place-items-center rounded-full"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="font-bold">{quantity}</span>
          <button
            onClick={() => setQuantity((current) => current + 1)}
            className="grid h-9 w-9 place-items-center rounded-full bg-[#D06A49] text-white"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          onClick={addToCart}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#D06A49] px-5 text-sm font-bold text-white transition hover:bg-[#B85A3D]"
        >
          {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          {added ? "Added" : "Add to order"}
        </button>
        <Link
          href={cartHref}
          className="inline-flex h-14 items-center justify-center rounded-2xl border border-[#D9C8B5] bg-[#FFF8F1] px-5 text-sm font-bold text-[#191614]"
        >
          View cart
        </Link>
      </div>
    </section>
  );
}
