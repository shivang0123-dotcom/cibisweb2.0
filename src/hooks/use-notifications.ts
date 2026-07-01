"use client";

import { useCallback, useEffect, useState } from "react";

export type ToastMessage = {
  id: string;
  message: string;
  tone?: "amber" | "green" | "red" | "indigo";
  actionLabel?: string;
  onAction?: () => void;
};

export function useNotifications() {
  const [queue, setQueue] = useState<ToastMessage[]>([]);
  const active = queue[0] ?? null;

  const notify = useCallback((toast: Omit<ToastMessage, "id">) => {
    setQueue((current) => [...current, { id: crypto.randomUUID(), ...toast }]);
  }, []);

  const dismiss = useCallback(() => {
    setQueue((current) => current.slice(1));
  }, []);

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(dismiss, 5000);
    return () => window.clearTimeout(timer);
  }, [active, dismiss]);

  return { active, notify, dismiss };
}
