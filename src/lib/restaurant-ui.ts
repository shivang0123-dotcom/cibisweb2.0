import type { OrderStatus } from "@/lib/orders";

export type OperationalStatus = "new" | "in_progress" | "ready" | "paid" | "closed";

export const statusCopy: Record<OrderStatus, { label: string; tone: OperationalStatus }> = {
  pending: { label: "New", tone: "new" },
  preparing: { label: "In Progress", tone: "in_progress" },
  ready: { label: "Being Served", tone: "ready" },
  served: { label: "Completed", tone: "paid" },
  rejected: { label: "Declined", tone: "closed" },
  cancel_requested: { label: "Cancel Requested", tone: "new" },
  cancelled: { label: "Cancelled", tone: "closed" },
};

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function minutesSince(isoDate: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000));
}

export function elapsedTone(isoDate: string) {
  const minutes = minutesSince(isoDate);
  if (minutes > 20) return "text-[#E97A55]";
  if (minutes >= 10) return "text-[#7C9EB9]";
  return "text-[#5b7f68]";
}
