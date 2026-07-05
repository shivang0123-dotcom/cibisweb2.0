"use client";

import { useState } from "react";
import { Icon } from "./icons";
import { Container, SectionLabel, Btn, useGo } from "./ui";
import { CITIES, CITY_MAP_POS, cityById } from "./data";
import { cityRestaurants, cityDishes } from "./search-utils";
import { useI18n } from "./i18n";

/* Stylized Italy silhouette (viewBox 0 0 400 520) */
const ITALY_MAINLAND =
  "M 150,60 C 178,48 206,52 226,64 C 244,74 240,92 254,104 C 244,116 228,110 220,122 C 220,146 236,172 252,200 C 272,232 292,262 312,292 C 328,314 330,332 314,344 C 302,352 288,344 282,330 C 274,310 260,306 248,314 C 238,320 232,332 222,336 C 208,342 196,336 192,322 C 186,306 198,296 204,282 C 202,258 190,248 186,228 C 180,204 170,196 166,178 C 160,160 162,146 154,134 C 146,124 130,124 122,114 C 112,102 118,88 126,78 C 134,68 142,64 150,60 Z";
const ITALY_SICILY =
  "M 176,360 C 200,352 230,358 240,370 C 244,382 228,398 210,400 C 190,402 176,388 174,374 C 173,368 172,364 176,360 Z";
const ITALY_SARDINIA =
  "M 92,250 C 106,246 114,260 112,280 C 110,300 98,312 88,306 C 80,302 78,282 82,266 C 84,256 86,252 92,250 Z";

function CityPin({ id, active, onEnter, onClick, label }: { id: string; active: boolean; onEnter: () => void; onClick: () => void; label: string }) {
  const [h, setH] = useState(false);
  const pos = CITY_MAP_POS[id];
  if (!pos) return null;
  const on = h || active;
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
        zIndex: on ? 5 : 2,
      }}>
      <span className={active ? "map-pin-active" : ""}
        style={{
          width: on ? "17px" : "13px", height: on ? "17px" : "13px", borderRadius: "50%",
          background: "var(--red)", border: "2.5px solid #fff", boxShadow: "var(--shadow-sm)",
          transition: "width 180ms ease, height 180ms ease",
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
  const city = cityById(activeId)!;
  const restCount = cityRestaurants(city.id).length;
  const dishCount = cityDishes(city.id).length;

  return (
    <section style={{ padding: "56px 0" }}>
      <Container style={{ maxWidth: "1320px" }}>
        <div className="reveal" style={{ marginBottom: "36px", maxWidth: "640px" }}>
          <SectionLabel>{l("The Map")}</SectionLabel>
          <h2 style={{ fontSize: "40px", fontWeight: 600, letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1.1, marginBottom: "16px" }}>{l("Explore Italy Through Food")}</h2>
          <p style={{ fontSize: "17px", color: "var(--text-2)", lineHeight: 1.6 }}>
            {l("Every region tells a different culinary story. Discover restaurants, signature dishes, local traditions and food culture across Italy.")}
          </p>
        </div>

        <div className="reveal" style={{ background: "var(--card)", borderRadius: "24px", border: "1px solid var(--border)", boxShadow: "var(--shadow)", overflow: "hidden", display: "grid", gridTemplateColumns: "1.15fr 0.85fr" }}>
          {/* Map */}
          <div style={{ position: "relative", padding: "28px 20px", background: "linear-gradient(160deg, #FCFBF8 0%, #F7F5F0 100%)", borderRight: "1px solid var(--border)" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: "440px", margin: "0 auto", aspectRatio: "400 / 520" }}>
              <svg viewBox="0 0 400 520" width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
                <g fill="#F0E9DD" stroke="#E2DccE" strokeWidth="1.5" strokeLinejoin="round">
                  <path d={ITALY_MAINLAND} />
                  <path d={ITALY_SICILY} />
                  <path d={ITALY_SARDINIA} />
                </g>
              </svg>
              {CITIES.map((c) => (
                <CityPin key={c.id} id={c.id} label={l(c.name)} active={activeId === c.id}
                  onEnter={() => setActiveId(c.id)} onClick={() => go("city", c.name)} />
              ))}
            </div>
          </div>

          {/* Active city info */}
          <div style={{ padding: "30px 34px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div key={city.id} style={{ animation: "acc-in 300ms cubic-bezier(.16,1,.3,1)" }}>
              <div style={{ borderRadius: "18px", overflow: "hidden", height: "170px", marginBottom: "20px", position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={city.image} alt={city.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(17,17,17,0.5), rgba(17,17,17,0) 55%)" }} />
                <div style={{ position: "absolute", left: "16px", bottom: "12px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>{l(city.region)}</div>
                  <div style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>{l(city.name)}</div>
                </div>
              </div>
              <p style={{ fontSize: "15px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "18px" }}>{cityBlurb(city)}</p>
              <div style={{ display: "flex", gap: "20px", marginBottom: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
                  <Icon name="store" size={16} color="var(--red)" />{restCount} {l("restaurants")}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
                  <Icon name="utensils" size={16} color="var(--red)" />{dishCount} {l("Dishes").toLowerCase()}
                </div>
              </div>
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
