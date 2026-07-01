"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { ArrowLeft, Copy, Check, Download, Users } from "lucide-react";
import type { RestaurantTable } from "@/lib/tables-store";

type QrEntry = { url: string; dataUrl: string };

export function TablesManager({ initialTables }: { initialTables: RestaurantTable[] }) {
  const [tables, setTables] = useState<RestaurantTable[]>(initialTables);
  const [qr, setQr] = useState<Record<number, QrEntry>>({});
  const [copied, setCopied] = useState<number | null>(null);

  // Build the permanent QR image for each table from the live origin, so the
  // printed sticker always points at the deployed domain.
  useEffect(() => {
    let active = true;
    (async () => {
      // Permanent QR stickers must always encode the canonical production domain,
      // regardless of which URL an admin happens to open this page on.
      const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.circolodelbridge.com";
      const entries = await Promise.all(
        tables.map(async (table) => {
          const url = `${base}${table.qrUrl}`;
          const dataUrl = await QRCode.toDataURL(url, {
            width: 320,
            margin: 1,
            color: { dark: "#1a1410", light: "#ffffff" },
          });
          return [table.tableNumber, { url, dataUrl }] as const;
        }),
      );
      if (active) setQr(Object.fromEntries(entries));
    })();
    return () => {
      active = false;
    };
  }, [tables]);

  async function toggle(tableNumber: number, flags: { active?: boolean; occupied?: boolean }) {
    // Optimistic update.
    setTables((current) =>
      current.map((t) => (t.tableNumber === tableNumber ? { ...t, ...flags } : t)),
    );
    const response = await fetch("/api/tables", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableNumber, ...flags }),
    });
    if (response.ok) {
      const { table } = (await response.json()) as { table: RestaurantTable };
      setTables((current) => current.map((t) => (t.tableNumber === table.tableNumber ? table : t)));
    }
  }

  async function copyLink(tableNumber: number, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(tableNumber);
      window.setTimeout(() => setCopied((c) => (c === tableNumber ? null : c)), 1500);
    } catch {
      // Clipboard may be blocked; the URL is still shown for manual copy.
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#faf0e8] text-[#1a1410]">
      <header className="flex items-center gap-3 bg-[#1a1410] px-5 py-4 text-white">
        <Link
          href="/admin"
          aria-label="Back to admin"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-serif text-[22px] font-extrabold leading-none">Tables</h1>
          <p className="mt-1.5 text-[14px] text-white/70">QR codes & seating · {tables.length} tables</p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md flex-1 space-y-4 px-4 pb-12 pt-4">
        {tables.map((table) => {
          const entry = qr[table.tableNumber];
          return (
            <section key={table.tableNumber} className="rounded-[20px] border border-[#e8ddd2] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-[22px] font-extrabold leading-tight">{table.displayName}</h2>
                  <p className="mt-0.5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#736860]">
                    <Users className="h-4 w-4" /> Capacity: {table.capacity} Guests
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${table.active ? "bg-[#e3f1e8] text-[#2f7d4f]" : "bg-[#f1ece5] text-[#736860]"}`}>
                    {table.active ? "Active" : "Inactive"}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${table.occupied ? "bg-[#fae7d6] text-[#a35a2c]" : "bg-[#f1ece5] text-[#736860]"}`}>
                    {table.occupied ? "Occupied" : "Free"}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[#e8ddd2] bg-white">
                  {entry ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.dataUrl} alt={`QR code for ${table.displayName}`} width={112} height={112} className="h-28 w-28" />
                  ) : (
                    <span className="text-[12px] text-[#736860]">…</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="break-all text-[13px] font-semibold text-[#47403a]">{entry?.url ?? `…${table.qrUrl}`}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => entry && copyLink(table.tableNumber, entry.url)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#e8ddd2] bg-white px-3 text-[13px] font-bold text-[#47403a] transition hover:bg-[#faf0e8]"
                    >
                      {copied === table.tableNumber ? <Check className="h-4 w-4 text-[#2f7d4f]" /> : <Copy className="h-4 w-4" />}
                      {copied === table.tableNumber ? "Copied" : "Copy Link"}
                    </button>
                    {entry && (
                      <a
                        href={entry.dataUrl}
                        download={`circolo-table-${table.tableNumber}-qr.png`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#c4703c] px-3 text-[13px] font-bold text-white transition hover:bg-[#b5642f]"
                      >
                        <Download className="h-4 w-4" /> Download QR
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => toggle(table.tableNumber, { active: !table.active })}
                  className={`h-10 rounded-full border text-[14px] font-bold transition ${table.active ? "border-[#e8ddd2] bg-white text-[#47403a]" : "border-[#2f7d4f] bg-[#e3f1e8] text-[#2f7d4f]"}`}
                >
                  {table.active ? "Set inactive" : "Set active"}
                </button>
                <button
                  onClick={() => toggle(table.tableNumber, { occupied: !table.occupied })}
                  className={`h-10 rounded-full border text-[14px] font-bold transition ${table.occupied ? "border-[#c4703c] bg-[#fae7d6] text-[#a35a2c]" : "border-[#e8ddd2] bg-white text-[#47403a]"}`}
                >
                  {table.occupied ? "Mark free" : "Mark occupied"}
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
