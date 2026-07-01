"use client";

import { LockKeyhole } from "lucide-react";

export function AdminLogin({
  title,
  subtitle,
  email,
  password,
  error,
  loading,
  onEmail,
  onPassword,
  onSubmit,
}: {
  title: string;
  subtitle: string;
  email: string;
  password: string;
  error?: string;
  loading?: boolean;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-4 text-[#211b17]">
      <form
        className="w-full max-w-sm rounded-lg border border-[#ded7ca] bg-white p-5 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          if (!loading) onSubmit();
        }}
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#20261f] text-[#f3d18a]">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a2f25]">{subtitle}</p>
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>
        </div>

        <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#736860]">
          Email
        </label>
        <input
          type="email"
          autoComplete="username"
          inputMode="email"
          value={email}
          onChange={(event) => onEmail(event.target.value)}
          disabled={loading}
          autoFocus
          className="mb-4 h-12 w-full rounded-lg border border-[#ded7ca] bg-[#f7f5ef] px-4 text-[16px] outline-none focus:border-[#c4703c]"
        />

        <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#736860]">
          Password
        </label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => onPassword(event.target.value)}
          disabled={loading}
          className="mb-4 h-12 w-full rounded-lg border border-[#ded7ca] bg-[#f7f5ef] px-4 text-[16px] outline-none focus:border-[#c4703c]"
        />

        {error && <p className="mb-4 text-sm font-semibold text-[#9a2f25]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-lg bg-[#20261f] text-[15px] font-semibold text-[#f3d18a] transition disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
