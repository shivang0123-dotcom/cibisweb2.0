"use client";

import { createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "./icons";

/* ── Language (EN / IT) ─────────────────────────────────────────── */
type Lang = "EN" | "IT";
const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "EN",
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("EN");
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cibis-lang") as Lang | null;
      if (stored) setLangState(stored);
    } catch {}
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("cibis-lang", l); } catch {}
  };
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}
export function useLang() { return useContext(LangContext).lang; }
export function useSetLang() { return useContext(LangContext).setLang; }
export function t(pair: { EN: string; IT: string }, lang: Lang) {
  return pair[lang] ?? pair.EN;
}

/* ── Navigation ─────────────────────────────────────────────────── */
export const NavContext = createContext<{ go: (view: string, query?: string) => void }>({
  go: () => {},
});
export function useGo() { return useContext(NavContext).go; }

/* ── Section shell — consistent max width + horizontal padding ──── */
export function Container({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 48px", ...style }}>{children}</div>;
}

/* Small uppercase section label (red, tracked) */
export function SectionLabel({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: color || "var(--red)", marginBottom: "14px" }}>
      {children}
    </div>
  );
}

/* Section heading row: heading left, optional action link right */
export function SectionHead({ label, title, action }: { label?: string; title: string; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", gap: "24px", flexWrap: "wrap" }}>
      <div>
        {label && <SectionLabel>{label}</SectionLabel>}
        <h2 style={{ fontSize: "40px", fontWeight: 600, letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1.1 }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function ActionLink({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const [h, setH] = useState(false);
  return (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick?.(); }} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "15px", fontWeight: 600, color: h ? "var(--red)" : "var(--text)", transition: "color 200ms ease", paddingBottom: "6px" }}>
      {children}
      <span style={{ display: "inline-flex", transform: h ? "translateX(3px)" : "none", transition: "transform 200ms ease" }}>
        <Icon name="arrow-right" size={17} />
      </span>
    </a>
  );
}

/* Primary / outline / dark button */
export function Btn({
  children, variant = "primary", size = "md", icon, iconRight, onClick, href, style,
}: {
  children: ReactNode; variant?: "primary" | "outline" | "dark"; size?: "sm" | "md" | "lg";
  icon?: string; iconRight?: string; onClick?: () => void; href?: string; style?: CSSProperties;
}) {
  const [h, setH] = useState(false);
  const sizes = {
    sm: { padding: "0 18px", height: "40px", fontSize: "14px" },
    md: { padding: "0 24px", height: "48px", fontSize: "15px" },
    lg: { padding: "0 30px", height: "56px", fontSize: "16px" },
  } as const;
  const variants = {
    primary: { background: h ? "var(--red-dark)" : "var(--red)", color: "#fff" },
    outline: { background: h ? "#F7F5F0" : "transparent", color: "var(--text)", boxShadow: "inset 0 0 0 1.5px var(--border)" },
    dark: { background: h ? "#000" : "var(--text)", color: "#fff" },
  } as const;
  const inner = (
    <>
      {icon && <Icon name={icon} size={18} />}
      {children}
      {iconRight && <span style={{ display: "inline-flex", transform: h ? "translateX(3px)" : "none", transition: "transform 200ms ease" }}><Icon name={iconRight} size={18} /></span>}
    </>
  );
  const css: CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "9px",
    borderRadius: "14px", fontWeight: 600, whiteSpace: "nowrap",
    transition: "background 220ms ease, box-shadow 220ms ease, transform 220ms ease",
    ...sizes[size], ...variants[variant], ...style,
  };
  if (href) return <a href={href} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={css}>{inner}</a>;
  return <button onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={onClick} style={css}>{inner}</button>;
}

/* Star rating row */
export function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
      <Icon name="star" size={15} color="var(--star)" className="rating-star" />
      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>{rating.toFixed(1)}</span>
    </span>
  );
}
