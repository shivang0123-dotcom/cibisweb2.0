"use client";

import { useState } from "react";
import Image from "next/image";
import { createSession } from "@/lib/session-store";
import { Loader2 } from "lucide-react";

type SessionInitializerProps = {
  tableNumber: number;
  capacity?: number;
  onSessionReady: () => void;
};

export function SessionInitializer({ tableNumber, capacity, onSessionReady }: SessionInitializerProps) {
  const [customerName, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleStartSession() {
    if (!customerName.trim()) {
      setError("Inserisci il tuo nome");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      // Server creates the session and sets the httpOnly session cookie.
      await createSession(tableNumber, customerName.trim());
      onSessionReady();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossibile creare la sessione");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center px-5 text-[#1a1410]">
      {/* Classy restaurant backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[#1a1410] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80')",
        }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/45" />

      <div className="relative w-full max-w-sm rounded-[28px] border border-white/30 bg-white p-7 shadow-[0_30px_70px_-18px_rgba(0,0,0,0.65)]">
        {/* Brand logo */}
        <Image
          src="/images/logo.png"
          alt="Circolo del Bridge"
          width={546}
          height={424}
          priority
          unoptimized
          className="mx-auto h-24 w-auto"
        />

        {/* Welcome */}
        <h1 className="mt-4 text-center font-serif text-[26px] font-extrabold leading-tight text-[#1a1410]">
          Benvenuti al Circolo Del Bridge
        </h1>
        <p className="mt-2 text-center text-[12px] font-bold uppercase tracking-[0.22em] text-[#c4703c]">
          Tavolo {tableNumber}
        </p>
        {typeof capacity === "number" && (
          <p className="mt-1 text-center text-[13px] font-semibold text-[#736860]">
            Posti: {capacity}
          </p>
        )}

        {/* Name entry */}
        <label htmlFor="customer-name" className="mb-2 mt-7 block text-[14px] font-semibold text-[#736860]">
          Inserisci il tuo nome
        </label>
        <input
          id="customer-name"
          type="text"
          placeholder="Il tuo nome"
          value={customerName}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleStartSession();
            }
          }}
          className="h-12 w-full rounded-2xl border border-[#e8ddd2] bg-[#faf0e8] px-4 text-[16px] outline-none transition focus:border-[#c4703c]"
          disabled={isCreating}
          autoFocus
        />

        {error && <p className="mt-3 text-[14px] font-semibold text-[#9a2f25]">{error}</p>}

        <button
          onClick={handleStartSession}
          disabled={isCreating || !customerName.trim()}
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#c4703c] text-[16px] font-bold text-white transition hover:bg-[#b5642f] disabled:opacity-50"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creazione sessione…
            </>
          ) : (
            "Inizia a ordinare"
          )}
        </button>
      </div>
    </main>
  );
}
