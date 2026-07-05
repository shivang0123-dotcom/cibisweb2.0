"use client";

import { useMemo, useState } from "react";
import { Icon } from "./icons";
import { Container, SectionLabel, Btn, useGo } from "./ui";
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
const metricByKey = (k: MetricKey) => METRICS.find((m) => m.key === k)!;

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

export function MapSection() {
  const go = useGo();
  const { l, cityBlurb } = useI18n();
  const [activeId, setActiveId] = useState("rome");
  const [metric, setMetric] = useState<MetricKey>("restaurants");
  const city = cityById(activeId)!;

  const maxForMetric = useMemo(() => {
    const m = metricByKey(metric);
    return Math.max(1, ...CITIES.map((c) => m.count(c.id)));
  }, [metric]);

  // Stats shown in the preview: the active metric first, then the essentials.
  const previewMetrics = useMemo(() => {
    const base: MetricKey[] = ["restaurants", "dishes", "stories"];
    const ordered = [metric, ...base.filter((k) => k !== metric)];
    return [...new Set(ordered)].slice(0, 3).map(metricByKey);
  }, [metric]);

  return (
    <section style={{ padding: "56px 0" }}>
      <Container style={{ maxWidth: "1320px" }}>
        <div className="reveal" style={{ marginBottom: "28px", maxWidth: "640px" }}>
          <SectionLabel>{l("The Map")}</SectionLabel>
          <h2 style={{ fontSize: "40px", fontWeight: 600, letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1.1, marginBottom: "16px" }}>{l("Explore Italy Through Food")}</h2>
          <p style={{ fontSize: "17px", color: "var(--text-2)", lineHeight: 1.6 }}>
            {l("Every region tells a different culinary story. Discover restaurants, signature dishes, local traditions and food culture across Italy.")}
          </p>
        </div>

        {/* Filters — update the map markers smoothly */}
        <div className="reveal" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
          {METRICS.map((m) => {
            const on = metric === m.key;
            return (
              <button key={m.key} onClick={() => setMetric(m.key)}
                style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "38px", padding: "0 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 600, color: on ? "#fff" : "var(--text)", background: on ? "var(--red)" : "var(--card)", boxShadow: on ? "none" : "inset 0 0 0 1px var(--border)", transition: "all 200ms ease" }}>
                <Icon name={m.icon} size={15} color={on ? "#fff" : "var(--text-2)"} />{l(m.label)}
              </button>
            );
          })}
        </div>

        <div className="reveal" style={{ background: "var(--card)", borderRadius: "24px", border: "1px solid var(--border)", boxShadow: "var(--shadow)", overflow: "hidden", display: "grid", gridTemplateColumns: "1.15fr 0.85fr" }}>
          {/* Map */}
          <div style={{ position: "relative", padding: "28px 20px", background: "linear-gradient(160deg, #FCFBF8 0%, #F7F5F0 100%)", borderRight: "1px solid var(--border)" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: "440px", margin: "0 auto", aspectRatio: "400 / 520" }}>
              <svg viewBox="0 0 400 520" width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
                <g fill="#F0E9DD" stroke="#E2DCCE" strokeWidth="1.5" strokeLinejoin="round">
                  <path d={ITALY_MAINLAND} />
                  <path d={ITALY_SICILY} />
                  <path d={ITALY_SARDINIA} />
                </g>
              </svg>
              {CITIES.map((c) => (
                <CityPin key={c.id} id={c.id} label={l(c.name)} active={activeId === c.id}
                  emphasis={metricByKey(metric).count(c.id) / maxForMetric}
                  onEnter={() => setActiveId(c.id)} onClick={() => go("city", c.name)} />
              ))}
            </div>
          </div>

          {/* Active city preview card */}
          <div style={{ padding: "30px 34px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div key={city.id} style={{ animation: "acc-in 300ms cubic-bezier(.16,1,.3,1)" }}>
              <div style={{ borderRadius: "18px", overflow: "hidden", height: "160px", marginBottom: "18px", position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={city.image} alt={city.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(17,17,17,0.55), rgba(17,17,17,0) 55%)" }} />
                <div style={{ position: "absolute", left: "16px", bottom: "12px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>{l(city.region)}</div>
                  <div style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>{l(city.name)}</div>
                </div>
              </div>

              {/* Signature dish */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <span style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#FBE9EA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="utensils" size={16} color="var(--red)" />
                </span>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-2)" }}>{l("Signature dish")}</div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>{city.famous[0]}</div>
                </div>
              </div>

              {/* Stats — active filter highlighted */}
              <div style={{ display: "flex", gap: "22px", marginBottom: "22px", flexWrap: "wrap" }}>
                {previewMetrics.map((m) => {
                  const on = m.key === metric;
                  return (
                    <div key={m.key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Icon name={m.icon} size={16} color={on ? "var(--red)" : "var(--text-2)"} />
                      <span style={{ fontSize: "14px", fontWeight: 600, color: on ? "var(--red)" : "var(--text)" }}>
                        {m.count(city.id)} <span style={{ fontWeight: 500, color: "var(--text-2)" }}>{l(m.label).toLowerCase()}</span>
                      </span>
                    </div>
                  );
                })}
              </div>

              <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "20px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{cityBlurb(city)}</p>

              <Btn variant="primary" size="md" iconRight="arrow-right" onClick={() => go("city", city.name)}>{l("Explore")} {l(city.name)}</Btn>
              <div style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "16px", display: "flex", alignItems: "center", gap: "7px" }}>
                <Icon name="map-pin" size={13} color="var(--text-2)" />{l("Hover a city to explore")}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
