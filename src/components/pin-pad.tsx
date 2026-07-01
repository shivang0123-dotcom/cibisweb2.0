"use client";

import { LockKeyhole } from "lucide-react";

export function PinPad({
  title,
  subtitle,
  pin,
  error,
  loading,
  onPin,
  onSubmit,
}: {
  title: string;
  subtitle: string;
  pin: string;
  error?: string;
  loading?: boolean;
  onPin: (pin: string) => void;
  onSubmit: () => void;
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-4 text-[#211b17]">
      <section className="w-full max-w-sm rounded-lg border border-[#ded7ca] bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#20261f] text-[#f3d18a]">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a2f25]">{subtitle}</p>
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>
        </div>
        <div className="mb-4 flex h-14 items-center justify-center rounded-lg border border-[#ded7ca] bg-[#f7f5ef] text-2xl tracking-[0.4em]">
          {"•".repeat(pin.length).padEnd(4, "○")}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {keys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (key === "clear") onPin("");
                else if (key === "back") onPin(pin.slice(0, -1));
                else if (pin.length < 6) onPin(pin + key);
              }}
              className="min-h-14 rounded-md border border-[#ded7ca] bg-[#f7f5ef] text-base font-bold text-[#211b17]"
            >
              {key === "clear" ? "Clear" : key === "back" ? "Back" : key}
            </button>
          ))}
        </div>
        {error && <p className="mt-3 text-sm font-bold text-[#9a2f25]">{error}</p>}
        <button
          type="button"
          disabled={loading || !pin}
          onClick={onSubmit}
          className="mt-4 min-h-12 w-full rounded-md bg-[#20261f] px-4 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? "Checking..." : "Enter"}
        </button>
      </section>
    </main>
  );
}
