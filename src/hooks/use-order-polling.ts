"use client";

import { useEffect, useRef, useState } from "react";
import type { RestaurantOrder } from "@/lib/orders";

export function useOrderPolling(intervalMs: number, enabled = true) {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [newOrders, setNewOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/orders", { cache: "no-store" });
        if (!response.ok) throw new Error(response.status === 401 ? "unauthorized" : "orders");
        const data = (await response.json()) as { orders?: RestaurantOrder[] };
        const nextOrders = data.orders ?? [];

        if (!active) return;

        const fresh = nextOrders.filter(
          (order) => order.status === "pending" && !seenIds.current.has(order.id),
        );
        if (seenIds.current.size && fresh.length) {
          setNewOrders(fresh);
        }

        nextOrders.forEach((order) => seenIds.current.add(order.id));
        setOrders(nextOrders);
        setError("");
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "orders");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    const timer = window.setInterval(load, intervalMs);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [enabled, intervalMs]);

  return { orders, setOrders, newOrders, loading, error };
}
