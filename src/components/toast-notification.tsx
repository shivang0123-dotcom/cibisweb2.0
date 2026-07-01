"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ToastMessage } from "@/hooks/use-notifications";

export function ToastNotification({
  toast,
  onDismiss,
}: {
  toast: ToastMessage | null;
  onDismiss: () => void;
}) {
  const tone = toast?.tone ?? "amber";
  const styles = {
    amber: "border-[#f59e0b]/30 bg-[#f59e0b] text-[#111827]",
    green: "border-[#22c55e]/30 bg-[#22c55e] text-[#052e16]",
    red: "border-[#ef4444]/30 bg-[#ef4444] text-white",
    indigo: "border-[#818cf8]/30 bg-[#818cf8] text-[#111827]",
  };
  const Icon = tone === "green" ? CheckCircle2 : tone === "red" ? XCircle : tone === "indigo" ? Info : Bell;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -28 }}
          className={`fixed left-3 right-3 top-3 z-50 mx-auto flex min-h-[60px] max-w-xl items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl ${styles[tone]}`}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <p className="min-w-0 flex-1 text-sm font-bold">{toast.message}</p>
          {toast.actionLabel && (
            <button
              onClick={toast.onAction}
              className="min-h-10 rounded-xl bg-black/15 px-3 text-xs font-bold"
            >
              {toast.actionLabel}
            </button>
          )}
          <button onClick={onDismiss} className="min-h-10 rounded-xl bg-black/10 px-3 text-xs font-bold">
            Close
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
