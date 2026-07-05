"use client";

import { useState } from "react";
import { Icon } from "./icons";
import { Container, useGo } from "./ui";
import { useL } from "./i18n";

const FOOTER_COLS: Record<string, string[]> = {
  Explore: ["Restaurants", "Food Stories", "Videos", "News", "Chefs"],
  "Popular Cities": ["Rome", "Milan", "Florence", "Naples", "Venice"],
  Information: ["About Us", "Careers", "Press", "Partners", "Roadmap"],
  Support: ["Help Center", "Contact", "Privacy Policy", "Terms"],
};

const FOOT_ROUTES: Record<string, [string, string?]> = {
  Restaurants: ["restaurants"], "Food Stories": ["stories", "All"], Videos: ["stories", "Videos"], News: ["stories", "News"], Chefs: ["restaurants"],
  Rome: ["experience", "Rome"], Milan: ["experience", "Milan"], Florence: ["experience", "Florence"], Naples: ["experience", "Naples"], Venice: ["experience", "Venice"],
  "About Us": ["about"], Careers: ["about"], Press: ["about"], Partners: ["about"], Roadmap: ["v2"],
  "Help Center": ["contact"], Contact: ["contact"], "Privacy Policy": ["legal", "Privacy Policy"], Terms: ["legal", "Terms & Conditions"],
};

export function Footer() {
  const l = useL();
  return (
    <footer style={{ background: "var(--card)", borderTop: "1px solid var(--border)", paddingTop: "64px", paddingBottom: "32px", marginTop: "24px" }}>
      <Container style={{ maxWidth: "1320px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr 1.2fr", gap: "40px", marginBottom: "48px" }}>
          <div>
            <a href="#" style={{ fontSize: "23px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)" }}>CIBIS<span style={{ color: "var(--red)" }}>WEB</span></a>
            <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.65, margin: "16px 0 22px", maxWidth: "260px" }}>
              {l("Discover Italy through its food. Restaurants, chefs, stories and the culture behind every plate.")}
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              {["instagram", "facebook", "twitter", "youtube"].map((s) => <SocialBtn key={s} name={s} />)}
            </div>
          </div>
          {Object.entries(FOOTER_COLS).map(([col, links]) => (
            <div key={col}>
              <div style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.04em", color: "var(--text)", marginBottom: "18px" }}>{l(col)}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {links.map((lnk) => <FootLink key={lnk} label={lnk} />)}
              </div>
            </div>
          ))}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.04em", color: "var(--text)", marginBottom: "18px" }}>{l("Download App")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <StoreBtn icon="apple" top={l("Download on the")} big="App Store" />
              <StoreBtn icon="play" top={l("Get it on")} big="Google Play" />
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "var(--text-2)" }}>{l("© 2026 CIBISWEB. All rights reserved.")}</span>
          <span style={{ fontSize: "13px", color: "var(--text-2)" }}>{l("Made with care in Italy 🇮🇹")}</span>
        </div>
      </Container>
    </footer>
  );
}

function FootLink({ label }: { label: string }) {
  const go = useGo();
  const l = useL();
  const [h, setH] = useState(false);
  const onGo = () => { const r = FOOT_ROUTES[label]; if (r) go(r[0], r[1] || ""); };
  return <a href="#" onClick={(e) => { e.preventDefault(); onGo(); }} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ fontSize: "14px", color: h ? "var(--red)" : "var(--text-2)", transition: "color 180ms ease" }}>{l(label)}</a>;
}

function SocialBtn({ name }: { name: string }) {
  const [h, setH] = useState(false);
  return (
    <a href="#" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: "40px", height: "40px", borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", background: h ? "var(--red)" : "#FCFBF8", color: h ? "#fff" : "var(--text)", border: "1px solid var(--border)", transition: "all 200ms ease" }}>
      <Icon name={name} size={18} />
    </a>
  );
}

function StoreBtn({ icon, top, big }: { icon: string; top: string; big: string }) {
  const [h, setH] = useState(false);
  return (
    <a href="#" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "flex", alignItems: "center", gap: "11px", background: h ? "#000" : "var(--text)", color: "#fff", borderRadius: "13px", padding: "9px 16px", transition: "background 200ms ease" }}>
      <Icon name={icon} size={22} />
      <div style={{ lineHeight: 1.2 }}>
        <div style={{ fontSize: "10px", opacity: 0.7 }}>{top}</div>
        <div style={{ fontSize: "15px", fontWeight: 600 }}>{big}</div>
      </div>
    </a>
  );
}
