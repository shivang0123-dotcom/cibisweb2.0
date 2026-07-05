"use client";

import { useMemo, useState } from "react";
import { Icon } from "./icons";
import { Container, SectionLabel, useGo } from "./ui";
import { CITIES, CITY_MAP_POS, cityById, cityExtra } from "./data";
import { cityRestaurants, cityDishes, cityStories, cityVideos } from "./search-utils";
import { useI18n } from "./i18n";

/* Stylized Italy silhouette (viewBox 0 0 400 520) */
const ITALY_MAINLAND =
  "M 150,60 C 178,48 206,52 226,64 C 244,74 240,92 254,104 C 244,116 228,110 220,122 C 220,146 236,172 252,200 C 272,232 292,262 312,292 C 328,314 330,332 314,344 C 302,352 288,344 282,330 C 274,310 260,306 248,314 C 238,320 232,332 222,336 C 208,342 196,336 192,322 C 186,306 198,296 204,282 C 202,258 190,248 186,228 C 180,204 170,196 166,178 C 160,160 162,146 154,134 C 146,124 130,124 122,114 C 112,102 118,88 126,78 C 134,68 142,64 150,60 Z";
const ITALY_SICILY =
  "M 176,360 C 200,352 230,358 240,370 C 244,382 228,398 210,400 C 190,402 176,388 174,374 C 173,368 172,364 176,360 Z";
const ITALY_SARDINIA =
  "M 92,250 C 106,246 114,260 112,280 C 110,300 98,312 88,306 C 80,302 78,282 82,266 C 84,256 86,252 92,250 Z";

type MetricKey = "restaurants" | "dishes" | "stories" | "videos" | "festivals";
const METRICS: { key: MetricKey; label: string; icon: string; count: (id: string) => number }[] = [
  { key: "restaurants", label: "Restaurants", icon: "store", count: (id) => cityRestaurants(id).length },
  { key: "dishes", label: "Dishes", icon: "utensils", count: (id) => cityDishes(id).length },
  { key: "stories", label: "Stories", icon: "book-open", count: (id) => cityStories(id).length },
  { key: "videos", label: "Videos", icon: "play", count: (id) => cityVideos(id).length },
  { key: "festivals", label: "Festivals", icon: "party-popper", count: (id) => cityExtra(id).festivals.length },
];
function CityPin({ id, active, emphasis, onEnter, onClick, label }: { id: string; active: boolean; emphasis: number; onEnter: () => void; onClick: () => void; label: string }) {
  const [h, setH] = useState(false);
  const pos = CITY_MAP_POS[id];
  if (!pos) return null;
  const on = h || active;
  const base = 11 + emphasis * 8; // pins scale with the selected metric
  const size = on ? base + 5 : base;
  return (
    <button
      onMouseEnter={() => { setH(true); onEnter(); }}
      onMouseLeave={() => setH(false)}
      onFocus={onEnter}
      onClick={onClick}
      aria-label={label}
      style={{
        position: "absolute", left: `${(pos.x / 400) * 100}%`, top: `${(pos.y / 520) * 100}%`,
        transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
        zIndex: on ? 6 : 2,
      }}>
      <span className={active ? "map-pin-active" : ""}
        style={{
          width: `${size}px`, height: `${size}px`, borderRadius: "50%",
          background: "var(--red)", border: "2.5px solid #fff", boxShadow: "var(--shadow-sm)",
          opacity: 0.55 + emphasis * 0.45,
          transition: "width 320ms cubic-bezier(.2,.8,.2,1), height 320ms cubic-bezier(.2,.8,.2,1), opacity 320ms ease",
        }} />
      <span style={{
        fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap", color: on ? "var(--red)" : "var(--text-2)",
        background: on ? "var(--card)" : "transparent", borderRadius: "6px", padding: on ? "2px 7px" : "0",
        boxShadow: on ? "var(--shadow-sm)" : "none", transition: "all 160ms ease",
      }}>{label}</span>
    </button>
  );
}

const GLANCE = [
  { value: "20", label: "Regions" },
  { value: "350+", label: "Cities" },
  { value: "2,000+", label: "Restaurants" },
  { value: "5,000+", label: "Dishes" },
];

export function MapSection() {
  const go = useGo();
  const { l } = useI18n();
  const [activeId, setActiveId] = useState("rome");
  const [enabled, setEnabled] = useState<Set<MetricKey>>(() => new Set(METRICS.map((m) => m.key)));
  const city = cityById(activeId)!;

  const score = (id: string) => METRICS.filter((m) => enabled.has(m.key)).reduce((s, m) => s + m.count(id), 0);
  const maxScore = useMemo(() => Math.max(1, ...CITIES.map((c) => score(c.id))), [enabled]); // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = (k: MetricKey) => setEnabled((prev) => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const shownMetrics = METRICS.filter((m) => enabled.has(m.key));

  return (
    <section style={{ padding: "56px 0" }}>
      <Container style={{ maxWidth: "1320px" }}>
        <div className="reveal" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "36px", alignItems: "start" }}>
          {/* ── Sidebar ── */}
          <div>
            <SectionLabel>{l("The Map")}</SectionLabel>
            <h2 style={{ fontSize: "36px", fontWeight: 600, letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1.1, marginBottom: "14px" }}>{l("Explore Italy Through Food")}</h2>
            <p style={{ fontSize: "16px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "26px" }}>
              {l("Every region tells a different culinary story. Discover restaurants, signature dishes, local traditions and food culture across Italy.")}
            </p>

            {/* Show on map */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "18px", boxShadow: "var(--shadow-sm)", padding: "18px 20px", marginBottom: "18px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "14px" }}>{l("Show on map")}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {METRICS.map((m) => {
                  const on = enabled.has(m.key);
                  return (
                    <button key={m.key} onClick={() => toggle(m.key)} aria-pressed={on}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "9px 10px", borderRadius: "11px", textAlign: "left", transition: "background 160ms ease" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FCFBF8"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "11px", fontSize: "15px", fontWeight: 500, color: "var(--text)" }}>
                        <Icon name={m.icon} size={17} color={on ? "var(--red)" : "var(--text-2)"} />{l(m.label)}
                      </span>
                      <span style={{ width: "22px", height: "22px", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", background: on ? "var(--red)" : "transparent", boxShadow: on ? "none" : "inset 0 0 0 1.5px var(--border)", transition: "all 160ms ease" }}>
                        {on && <Icon name="check-circle" size={14} color="#fff" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Italy at a Glance */}
            <div style={{ background: "var(--text)", borderRadius: "18px", padding: "22px 24px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: "16px" }}>{l("Italy at a Glance")}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                {GLANCE.map((g) => (
                  <div key={g.label}>
                    <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>{g.value}</div>
                    <div style={{ fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>{l(g.label)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Map ── */}
          <div style={{ position: "relative", background: "linear-gradient(160deg, #FCFBF8 0%, #F5F1E9 100%)", border: "1px solid var(--border)", borderRadius: "24px", boxShadow: "var(--shadow)", overflow: "hidden", minHeight: "560px", padding: "24px" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: "430px", margin: "0 auto", aspectRatio: "400 / 520" }}>
              <svg viewBox="0 0 400 520" width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
                <g fill="#EFE7DA" stroke="#E1DBCC" strokeWidth="1.5" strokeLinejoin="round">
                  <path d={ITALY_MAINLAND} />
                  <path d={ITALY_SICILY} />
                  <path d={ITALY_SARDINIA} />
                </g>
              </svg>
              {CITIES.map((c) => (
                <CityPin key={c.id} id={c.id} label={l(c.name)} active={activeId === c.id}
                  emphasis={score(c.id) / maxScore}
                  onEnter={() => setActiveId(c.id)} onClick={() => go("city", c.name)} />
              ))}
            </div>

            {/* Floating city popover */}
            <div key={city.id} style={{ position: "absolute", left: "22px", bottom: "22px", width: "300px", maxWidth: "calc(100% - 44px)", background: "var(--card)", borderRadius: "18px", border: "1px solid var(--border)", boxShadow: "var(--shadow-float)", overflow: "hidden", animation: "acc-in 260ms cubic-bezier(.16,1,.3,1)" }}>
              <div style={{ display: "flex", gap: "12px", padding: "12px" }}>
                <span style={{ width: "58px", height: "58px", borderRadius: "12px", overflow: "hidden", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={city.image} alt={city.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.1 }}>{l(city.name)}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-2)", marginBottom: "5px" }}>{l(city.region)}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>{l("Famous for")}: </span>{city.famous.slice(0, 2).join(", ")}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "14px", padding: "0 14px 10px", flexWrap: "wrap" }}>
                {shownMetrics.slice(0, 3).map((m) => (
                  <span key={m.key} style={{ fontSize: "13px", fontWeight: 600, color: "var(--red)" }}>
                    {m.count(city.id)} <span style={{ fontWeight: 500, color: "var(--text-2)" }}>{l(m.label).toLowerCase()}</span>
                  </span>
                ))}
              </div>
              <button onClick={() => go("city", city.name)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", height: "42px", background: "var(--red)", color: "#fff", fontSize: "14px", fontWeight: 600 }}>
                {l("Explore")} {l(city.name)} <Icon name="arrow-right" size={15} color="#fff" />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
