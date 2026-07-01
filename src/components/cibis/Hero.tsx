"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { Icon } from "./icons";
import { Container, Btn, useLang, useGo } from "./ui";
import { suggestions as buildSuggestions, didYouMean, surprise, type Suggestion } from "./search-utils";
import { POPULAR_CATEGORIES } from "./data";

const EXPERIENCES = [
  { label: "Fine Dining", icon: "utensils" },
  { label: "Pizza", icon: "pizza" },
  { label: "Date Night", icon: "heart" },
  { label: "Rome", icon: "map-pin" },
  { label: "Hidden Cafés", icon: "coffee" },
  { label: "Michelin", icon: "award" },
  { label: "Vegetarian", icon: "leaf" },
];

const TRENDING = ["Best Pizza in Naples", "Michelin Restaurants", "Tiramisu"];
const CAT_ICON: Record<string, string> = {
  Pizza: "pizza", Pasta: "utensils", Desserts: "coffee", Seafood: "map-pin",
  Vegetarian: "leaf", "Fine Dining": "award",
};

function ExperienceChip({ label, icon }: { label: string; icon: string }) {
  const go = useGo();
  const [h, setH] = useState(false);
  return (
    <button onClick={() => go("search", label)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "42px", padding: "0 18px", borderRadius: "999px", fontSize: "14px", fontWeight: 500, color: h ? "var(--red)" : "var(--text)", background: "var(--card)", boxShadow: h ? "inset 0 0 0 1.5px var(--red)" : "inset 0 0 0 1px var(--border)", transition: "box-shadow 200ms ease, color 200ms ease" }}>
      <Icon name={icon} size={16} color={h ? "var(--red)" : "var(--text-2)"} />
      {label}
    </button>
  );
}

function PanelRow({ icon, children, onClick, sub }: { icon: string; children: ReactNode; onClick?: () => void; sub?: string }) {
  const [h, setH] = useState(false);
  return (
    <button onMouseDown={(e) => { e.preventDefault(); onClick?.(); }} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: "13px", padding: "11px 14px", borderRadius: "12px", background: h ? "#FCFBF8" : "transparent", transition: "background 160ms ease", textAlign: "left" }}>
      <span style={{ width: "34px", height: "34px", borderRadius: "10px", background: h ? "#FBE9EA" : "#F5F3EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 160ms ease" }}>
        <Icon name={icon} size={17} color={h ? "var(--red)" : "var(--text-2)"} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "15px", fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{children}</span>
        {sub && <span style={{ display: "block", fontSize: "12px", color: "var(--text-2)" }}>{sub}</span>}
      </span>
      <span style={{ display: "inline-flex", opacity: h ? 1 : 0, transform: h ? "none" : "translateX(-4px)", transition: "all 160ms ease", color: "var(--text-2)" }}><Icon name="arrow-up-right" size={16} /></span>
    </button>
  );
}

function PanelLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 14px 8px" }}>
      <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--text-2)" }}>{children}</span>
      {action}
    </div>
  );
}

function SearchBar() {
  const lang = useLang();
  const go = useGo();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>(["Rome", "Pizza", "Carbonara"]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const remember = (term: string) => setRecent((r) => [term, ...r.filter((x) => x !== term)].slice(0, 5));
  const submit = (term?: string) => {
    const val = (term != null ? term : q).trim();
    if (!val) return;
    remember(val);
    go("search", val);
    setOpen(false);
  };
  const goSuggestion = (s: Suggestion) => {
    remember(s.label);
    const view = s.kind === "restaurant" ? "restaurant" : s.kind === "dish" ? "dish" : s.kind === "city" ? "city" : s.kind === "video" ? "video" : "story";
    go(view, s.label);
    setOpen(false);
  };
  const doSurprise = () => { const s = surprise(); go(s.view, s.query); setOpen(false); };

  const typing = q.trim().length > 0;
  const grouped = typing ? buildSuggestions(q) : {};
  const groupKeys = Object.keys(grouped);
  const hasMatches = groupKeys.length > 0;
  const suggestion = typing ? didYouMean(q) : null;

  return (
    <div ref={wrapRef} style={{ position: "relative", maxWidth: "560px", zIndex: 40 }}>
      {/* Bar — visually unchanged */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--card)", borderRadius: "18px", boxShadow: open ? "var(--shadow-lg)" : "var(--shadow)", padding: "10px 10px 10px 22px", transition: "box-shadow 220ms ease", position: "relative", zIndex: 2 }}>
        <Icon name="search" size={21} color="var(--text-2)" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") setOpen(false); }}
          placeholder={lang === "IT" ? "Cerca ristoranti, piatti o città..." : "Search restaurants, dishes or cities..."}
          style={{ flex: 1, fontSize: "16px", color: "var(--text)", background: "none" }} />
        {q && (
          <button onMouseDown={(e) => { e.preventDefault(); setQ(""); }} style={{ width: "30px", height: "30px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)" }}>
            <Icon name="x" size={17} />
          </button>
        )}
        <Btn variant="primary" size="md" style={{ borderRadius: "13px" }} onClick={() => submit()}>{lang === "IT" ? "Cerca" : "Search"}</Btn>
      </div>

      {/* Floating panel */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 12px)", left: 0, right: 0, zIndex: 1,
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(18px) saturate(180%)", WebkitBackdropFilter: "blur(18px) saturate(180%)",
          borderRadius: "20px", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "var(--shadow-lg)",
          padding: "12px", maxHeight: "min(70vh, 520px)", overflowY: "auto", animation: "panelIn 240ms cubic-bezier(.16,1,.3,1)",
        }}>
          {!typing && (
            <>
              {recent.length > 0 && (
                <div style={{ marginBottom: "6px" }}>
                  <PanelLabel action={<button onMouseDown={(e) => { e.preventDefault(); setRecent([]); }} style={{ fontSize: "12px", fontWeight: 600, color: "var(--red)" }}>Clear All</button>}>Recent Searches</PanelLabel>
                  {recent.map((r) => <PanelRow key={r} icon="clock" onClick={() => submit(r)}>{r}</PanelRow>)}
                </div>
              )}
              <div style={{ marginBottom: "6px" }}>
                <PanelLabel>Trending</PanelLabel>
                {TRENDING.map((tr) => <PanelRow key={tr} icon="trending-up" onClick={() => submit(tr)}>{tr}</PanelRow>)}
              </div>

              {/* Discover Something New — Surprise Me */}
              <div style={{ padding: "0 6px" }}>
                <PanelLabel>Discover Something New</PanelLabel>
                <button onMouseDown={(e) => { e.preventDefault(); doSurprise(); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", background: "linear-gradient(135deg, #FBE9EA, #F8F1E7)", borderRadius: "16px", padding: "14px 16px", textAlign: "left", transition: "transform 180ms ease" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "none"; }}>
                  <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: "var(--shadow-sm)" }}>🎲</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>Surprise Me</span>
                    <span style={{ display: "block", fontSize: "13px", color: "var(--text-2)" }}>Open a random restaurant, dish, story or city.</span>
                  </span>
                  <span style={{ color: "var(--red)" }}><Icon name="arrow-right" size={18} /></span>
                </button>
              </div>

              {/* Popular Categories */}
              <div style={{ padding: "0 6px", marginTop: "8px" }}>
                <PanelLabel>Popular Categories</PanelLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "0 8px 6px" }}>
                  {POPULAR_CATEGORIES.map((cat) => (
                    <button key={cat} onMouseDown={(e) => { e.preventDefault(); remember(cat); go("search", cat); setOpen(false); }}
                      style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", padding: "0 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 500, color: "var(--text)", background: "var(--card)", boxShadow: "inset 0 0 0 1px var(--border)", transition: "box-shadow 180ms ease, color 180ms ease" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "inset 0 0 0 1.5px var(--red)"; (e.currentTarget as HTMLElement).style.color = "var(--red)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "inset 0 0 0 1px var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}>
                      <Icon name={CAT_ICON[cat] || "utensils"} size={14} color="var(--text-2)" />{cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discovery CTA */}
              <div style={{ margin: "8px 6px 4px", background: "#FCFBF8", border: "1px solid var(--border)", borderRadius: "16px", padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "3px" }}>Not sure what to search?</div>
                  <div style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.5 }}>Explore hand-picked restaurants, dishes and stories.</div>
                </div>
                <Btn variant="primary" size="sm" iconRight="arrow-right" style={{ flexShrink: 0 }} onClick={() => { setOpen(false); go("restaurants"); }}>Explore Now</Btn>
              </div>
            </>
          )}

          {typing && suggestion && (
            <button onMouseDown={(e) => { e.preventDefault(); submit(suggestion); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", marginBottom: "4px", borderRadius: "12px", background: "#FBE9EA", textAlign: "left" }}>
              <Icon name="search" size={16} color="var(--red)" />
              <span style={{ fontSize: "14px", color: "var(--text)" }}>Did you mean <strong style={{ color: "var(--red)" }}>{suggestion}</strong>?</span>
            </button>
          )}

          {typing && hasMatches && (
            <>
              {groupKeys.map((group) => (
                <div key={group} style={{ marginBottom: "4px" }}>
                  <PanelLabel>{group}</PanelLabel>
                  {grouped[group].map((s) => <PanelRow key={s.kind + s.label} icon={s.icon} sub={s.sub} onClick={() => goSuggestion(s)}>{s.label}</PanelRow>)}
                </div>
              ))}
              <button onMouseDown={(e) => { e.preventDefault(); submit(); }}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", height: "44px", marginTop: "4px", borderRadius: "12px", background: "var(--red)", color: "#fff", fontSize: "14px", fontWeight: 600 }}>
                See all results for “{q.trim()}” <Icon name="arrow-right" size={16} />
              </button>
            </>
          )}

          {typing && !hasMatches && !suggestion && (
            <div style={{ padding: "28px 16px", textAlign: "center" }}>
              <div style={{ display: "inline-flex", width: "46px", height: "46px", borderRadius: "14px", background: "#F5F3EE", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <Icon name="search-x" size={22} color="var(--text-2)" />
              </div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>No matches for “{q}”</div>
              <div style={{ fontSize: "13px", color: "var(--text-2)" }}>Try a dish, restaurant or city — or press Enter to search.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Hero3DFood() {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, active: false });
  const onMove = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 14, ry: px * 18, active: true });
  };
  const reset = () => setTilt({ rx: 0, ry: 0, active: false });
  const chip: CSSProperties = { position: "absolute", background: "var(--card)", borderRadius: "16px", boxShadow: "var(--shadow-lg)", padding: "12px 16px", display: "flex", alignItems: "center", gap: "11px" };

  return (
    <div className="reveal in" onMouseMove={onMove} onMouseLeave={reset}
      style={{ position: "relative", display: "flex", justifyContent: "center", perspective: "1100px", transformStyle: "preserve-3d" }}>
      <div style={{ position: "relative", width: "540px", height: "420px", transformStyle: "preserve-3d", animation: "floaty 6s ease-in-out infinite" }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, transition: tilt.active ? "transform 120ms ease-out" : "transform 500ms cubic-bezier(.2,.8,.2,1)" }}>
          <div style={{ position: "absolute", inset: "0", borderRadius: "50%", background: "radial-gradient(circle at 50% 46%, #F3ECE0 0%, rgba(243,236,224,0) 68%)", transform: "translateZ(-90px) scale(1.05)" }} />
          <div style={{ position: "absolute", left: "50%", bottom: "34px", width: "400px", height: "56px", transform: "translateX(-50%) translateZ(-70px)", background: "rgba(17,17,17,0.26)", filter: "blur(34px)", borderRadius: "50%" }} />
          <Image src="/assets/carbonara-plate.png" alt="Spaghetti Carbonara" width={540} height={420} priority unoptimized
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", transform: "translateZ(0)", filter: "drop-shadow(0 26px 34px rgba(17,17,17,0.22))" }} />
          <div style={{ ...chip, top: "6px", left: "-18px", transform: "translateZ(95px)" }}>
            <span style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#FCEFD6", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="star" size={18} color="var(--star)" className="rating-star" /></span>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 600, lineHeight: 1.1 }}>4.9 Rating</div>
              <div style={{ fontSize: "12px", color: "var(--text-2)" }}>2,400+ reviews</div>
            </div>
          </div>
          <div style={{ ...chip, bottom: "20px", right: "-22px", transform: "translateZ(130px)" }}>
            <span style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#FBE3E4", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="map-pin" size={18} color="var(--red)" /></span>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 600, lineHeight: 1.1 }}>300+ Cities</div>
              <div style={{ fontSize: "12px", color: "var(--text-2)" }}>Across Italy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const lang = useLang();
  return (
    <section style={{ position: "relative", overflow: "visible" }}>
      <Container style={{ maxWidth: "1320px", paddingTop: "72px", paddingBottom: "64px", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "56px", alignItems: "center" }}>
        <div className="reveal in">
          <h1 style={{ fontSize: "64px", fontWeight: 600, lineHeight: 1.04, letterSpacing: "-0.035em", color: "var(--text)" }}>
            {lang === "IT"
              ? <>Scopri l&apos;Italia<br />attraverso il <span style={{ color: "var(--red)" }}>Cibo</span></>
              : <>Discover Italy<br />Through <span style={{ color: "var(--red)" }}>Food</span></>}
          </h1>
          <p style={{ fontSize: "19px", color: "var(--text-2)", marginTop: "22px", marginBottom: "34px", maxWidth: "440px" }}>
            {lang === "IT" ? "Quale esperienza culinaria cerchi oggi?" : "What food experience are you looking for today?"}
          </p>
          <SearchBar />
          <div style={{ marginTop: "40px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.04em", color: "var(--text-2)", marginBottom: "16px" }}>{lang === "IT" ? "Esplora per esperienza" : "Explore by Experience"}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", maxWidth: "580px" }}>
              {EXPERIENCES.map((e) => <ExperienceChip key={e.label} {...e} />)}
            </div>
          </div>
        </div>
        <Hero3DFood />
      </Container>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", paddingBottom: "36px" }}>
        <span style={{ width: "24px", height: "38px", borderRadius: "12px", border: "2px solid #D6D3CC", display: "flex", justifyContent: "center", paddingTop: "7px" }}>
          <span style={{ width: "4px", height: "8px", borderRadius: "2px", background: "var(--red)", animation: "scrolldot 1.6s ease-in-out infinite" }} />
        </span>
        <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-2)" }}>{lang === "IT" ? "Scorri per esplorare" : "Scroll to Explore"}</span>
      </div>
    </section>
  );
}
