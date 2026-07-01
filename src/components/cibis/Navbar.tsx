"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "./icons";
import { Container, useLang, useSetLang, useGo } from "./ui";

const NAV_ITEMS = [
  { label: "Restaurants", it: "Ristoranti", view: "restaurants" },
  { label: "Food Stories", it: "Storie", view: "stories", query: "All" },
  { label: "Videos", it: "Video", view: "stories", query: "Videos" },
  { label: "News", it: "Notizie", view: "stories", query: "News" },
  { label: "Fun", it: "Svago", view: "stories", query: "Fun" },
  { label: "About Us", it: "Chi Siamo", view: "about" },
  { label: "Contact", it: "Contatti", view: "contact" },
];

export function Navbar({ current }: { current: string }) {
  const lang = useLang();
  const go = useGo();
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
      <Container style={{ height: "76px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "1320px" }}>
        {/* Logo */}
        <a href="#" onClick={(e) => { e.preventDefault(); go("home"); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0px", textDecoration: "none", flexShrink: 0, marginRight: "22px" }}>
          <Image src="/assets/cibis-logo.png" alt="CIBISWEB" width={132} height={44} style={{ height: "44px", width: "auto", objectFit: "contain", display: "block" }} priority unoptimized />
          <svg width="112" height="22" viewBox="0 0 112 22" style={{ display: "block", marginTop: "-3px", overflow: "visible" }}>
            <path id="cibLogoCurve" d="M 7,9 Q 56,21 105,9" fill="none" />
            <text style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "2.5px", fontFamily: "var(--font-inter), sans-serif" }}>
              <textPath href="#cibLogoCurve" startOffset="50%" textAnchor="middle" style={{ fill: "var(--text)" }}>
                CIBIS<tspan style={{ fill: "var(--red)" }}>WEB</tspan>
              </textPath>
            </text>
          </svg>
        </a>
        {/* Center nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "34px" }}>
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.label} item={item} on={current === item.view} lang={lang} onGo={() => go(item.view, item.query || "")} />
          ))}
        </div>
        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <LangSwitch />
          <IconBtn name="search" onClick={() => go("home")} />
          <IconBtn name="user" />
        </div>
      </Container>
    </nav>
  );
}

function NavItem({ item, on, lang, onGo }: { item: { label: string; it: string }; on: boolean; lang: string; onGo: () => void }) {
  const [h, setH] = useState(false);
  return (
    <a href="#" onClick={(e) => { e.preventDefault(); onGo(); }} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ position: "relative", fontSize: "15px", fontWeight: on ? 600 : 500, color: on || h ? "var(--text)" : "var(--text-2)", transition: "color 200ms ease", paddingBottom: "4px" }}>
      {lang === "IT" ? item.it : item.label}
      <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "2px", background: "var(--red)", borderRadius: "2px", transform: on ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform 220ms ease" }} />
    </a>
  );
}

function LangSwitch() {
  const lang = useLang();
  const setLang = useSetLang();
  const opt = (l: "EN" | "IT") => {
    const on = lang === l;
    return (
      <button key={l} onClick={() => setLang(l)} aria-pressed={on}
        style={{ height: "30px", minWidth: "34px", padding: "0 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em", color: on ? "#fff" : "var(--text-2)", background: on ? "var(--red)" : "transparent", transition: "color 180ms ease, background 180ms ease" }}>
        {l}
      </button>
    );
  };
  return (
    <div title={lang === "EN" ? "Switch to Italian" : "Passa all’inglese"}
      style={{ display: "flex", alignItems: "center", gap: "2px", padding: "3px", borderRadius: "11px", background: "var(--bg-2)", border: "1px solid var(--border)" }}>
      <span style={{ display: "inline-flex", marginLeft: "4px", marginRight: "2px", color: "var(--text-2)" }}><Icon name="globe" size={15} color="var(--text-2)" /></span>
      {opt("EN")}
      {opt("IT")}
    </div>
  );
}

function IconBtn({ name, onClick }: { name: string; onClick?: () => void }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: "42px", height: "42px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: h ? "#F5F3EE" : "transparent", color: "var(--text)", transition: "background 200ms ease" }}>
      <Icon name={name} size={20} />
    </button>
  );
}
