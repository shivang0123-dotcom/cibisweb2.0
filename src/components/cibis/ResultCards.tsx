"use client";

import { useState, type CSSProperties } from "react";
import { Icon } from "./icons";
import { Btn, Stars, useGo } from "./ui";
import { cityById, type Dish, type Restaurant, type Story, type Video, type City, type News } from "./data";
import { servedCount, restaurantsServing, dishStories, dishVideos, type Result } from "./search-utils";

const cardBase: CSSProperties = {
  cursor: "pointer", background: "var(--card)", borderRadius: "20px", border: "1px solid var(--border)",
  overflow: "hidden", transition: "transform 240ms ease, box-shadow 240ms ease",
};
function useHover() {
  const [h, setH] = useState(false);
  return { h, on: { onMouseEnter: () => setH(true), onMouseLeave: () => setH(false) } };
}
const priceStr = (p: number) => "€".repeat(p);

/* ── Restaurant card ────────────────────────────────────────────── */
export function RestaurantCard({ r }: { r: Restaurant }) {
  const go = useGo();
  const { h, on } = useHover();
  return (
    <div {...on} onClick={() => go("restaurant", r.name)}
      style={{ ...cardBase, boxShadow: h ? "var(--shadow-lg)" : "var(--shadow-sm)", transform: h ? "translateY(-4px)" : "none" }}>
      <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={r.image} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 400ms ease", transform: h ? "scale(1.04)" : "scale(1)" }} />
        {r.michelin > 0 && (
          <span style={{ position: "absolute", top: "14px", left: "14px", display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, color: "#fff", background: "var(--red)", borderRadius: "999px", padding: "5px 11px" }}>
            <Icon name="award" size={13} color="#fff" />{r.michelin} Michelin
          </span>
        )}
        {r.openNow && (
          <span style={{ position: "absolute", top: "14px", right: "14px", fontSize: "11px", fontWeight: 600, color: "#fff", background: "var(--success)", borderRadius: "999px", padding: "5px 11px" }}>Open Now</span>
        )}
      </div>
      <div style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
          <h3 style={{ fontSize: "19px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.2 }}>{r.name}</h3>
          <Stars rating={r.rating} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--text-2)", fontSize: "14px", marginBottom: "14px" }}>
          <Icon name="map-pin" size={15} color="var(--text-2)" />{cityById(r.cityId)?.name}, {cityById(r.cityId)?.region}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--red)", background: "#FBE9EA", borderRadius: "999px", padding: "5px 13px" }}>{r.cuisine}</span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)" }}>{priceStr(r.price)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Dish card (with story / recipe / explore) ──────────────────── */
export function DishCard({ d }: { d: Dish }) {
  const go = useGo();
  const { h, on } = useHover();
  return (
    <div {...on} style={{ ...cardBase, boxShadow: h ? "var(--shadow-lg)" : "var(--shadow-sm)", transform: h ? "translateY(-4px)" : "none" }}>
      <div onClick={() => go("dish", d.name)} style={{ position: "relative", height: "200px", overflow: "hidden", cursor: "pointer" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={d.image} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 500ms ease", transform: h ? "scale(1.06) rotate(-0.5deg)" : "scale(1)" }} />
        <span style={{ position: "absolute", top: "14px", left: "14px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#fff", background: "rgba(17,17,17,0.6)", backdropFilter: "blur(6px)", borderRadius: "999px", padding: "5px 11px" }}>{d.category}</span>
      </div>
      <div style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "6px" }}>
          <h3 onClick={() => go("dish", d.name)} style={{ fontSize: "19px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.2, cursor: "pointer" }}>{d.name}</h3>
          <Stars rating={d.rating} />
        </div>
        <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.55, marginBottom: "16px", minHeight: "44px" }}>{d.description}</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <MiniBtn icon="book-open" onClick={() => go("dish", d.name)}>Story</MiniBtn>
          <MiniBtn icon="utensils" onClick={() => go("dish", d.name)}>Recipe</MiniBtn>
          <Btn variant="primary" size="sm" iconRight="arrow-right" onClick={() => go("dish", d.name)}>Explore</Btn>
        </div>
      </div>
    </div>
  );
}
function MiniBtn({ icon, children, onClick }: { icon: string; children: React.ReactNode; onClick?: () => void }) {
  const { h, on } = useHover();
  return (
    <button {...on} onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "40px", padding: "0 14px", borderRadius: "12px", fontSize: "13px", fontWeight: 600, color: "var(--text)", background: h ? "#F7F5F0" : "transparent", boxShadow: "inset 0 0 0 1.5px var(--border)", transition: "background 180ms ease" }}>
      <Icon name={icon} size={15} color="var(--text-2)" />{children}
    </button>
  );
}

/* ── Story card ─────────────────────────────────────────────────── */
export function StoryResultCard({ s }: { s: Story }) {
  const go = useGo();
  const { h, on } = useHover();
  const view = s.category === "Video" ? "video" : s.category === "News" ? "news" : "story";
  const badge = s.category === "Video" ? "#2E7D32" : s.category === "News" ? "#F5A623" : "#B3262E";
  return (
    <div {...on} onClick={() => go(view, s.title)} style={{ ...cardBase, boxShadow: h ? "var(--shadow-lg)" : "var(--shadow-sm)", transform: h ? "translateY(-4px)" : "none" }}>
      <div style={{ position: "relative", height: "190px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.image} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 400ms ease", transform: h ? "scale(1.04)" : "scale(1)" }} />
        <span style={{ position: "absolute", top: "14px", left: "14px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", background: badge, borderRadius: "999px", padding: "6px 13px" }}>{s.category}</span>
      </div>
      <div style={{ padding: "20px 22px 22px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.25, marginBottom: "10px" }}>{s.title}</h3>
        <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.55, marginBottom: "16px" }}>{s.excerpt}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "13px", color: "var(--text-2)", paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="calendar" size={14} color="var(--text-2)" />{s.date}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="clock" size={14} color="var(--text-2)" />{s.readTime}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Video card ─────────────────────────────────────────────────── */
export function VideoCard({ v }: { v: Video }) {
  const go = useGo();
  const { h, on } = useHover();
  return (
    <div {...on} onClick={() => go("video", v.title)} style={{ ...cardBase, boxShadow: h ? "var(--shadow-lg)" : "var(--shadow-sm)", transform: h ? "translateY(-4px)" : "none" }}>
      <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={v.thumb} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 400ms ease", transform: h ? "scale(1.04)" : "scale(1)" }} />
        <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "60px", height: "60px", borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow)" }}>
          <Icon name="play" size={24} color="var(--red)" className="fill-current" />
        </span>
        <span style={{ position: "absolute", bottom: "12px", right: "12px", fontSize: "12px", fontWeight: 600, color: "#fff", background: "rgba(17,17,17,0.75)", borderRadius: "8px", padding: "3px 9px" }}>{v.duration}</span>
      </div>
      <div style={{ padding: "18px 22px 20px" }}>
        <h3 style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.3, marginBottom: "6px" }}>{v.title}</h3>
        <div style={{ fontSize: "13px", color: "var(--text-2)" }}>{v.channel}</div>
      </div>
    </div>
  );
}

/* ── City card ──────────────────────────────────────────────────── */
export function CityCard({ c }: { c: City }) {
  const go = useGo();
  const { h, on } = useHover();
  return (
    <div {...on} onClick={() => go("city", c.name)} style={{ ...cardBase, boxShadow: h ? "var(--shadow-lg)" : "var(--shadow-sm)", transform: h ? "translateY(-4px)" : "none" }}>
      <div style={{ position: "relative", height: "230px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.image} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 500ms ease", transform: h ? "scale(1.05)" : "scale(1)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(17,17,17,0.72), rgba(17,17,17,0) 55%)" }} />
        <div style={{ position: "absolute", left: "20px", bottom: "16px", right: "20px" }}>
          <div style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>{c.name}</div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>{c.region}</div>
        </div>
      </div>
      <div style={{ padding: "18px 22px 20px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)", marginBottom: "8px" }}>Famous for</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
          {c.famous.slice(0, 3).map((f) => (
            <span key={f} style={{ fontSize: "12px", fontWeight: 600, color: "var(--red)", background: "#FBE9EA", borderRadius: "999px", padding: "5px 12px" }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── News card ──────────────────────────────────────────────────── */
export function NewsCard({ n }: { n: News }) {
  const go = useGo();
  const { h, on } = useHover();
  return (
    <div {...on} onClick={() => go("news", n.title)} style={{ ...cardBase, boxShadow: h ? "var(--shadow-lg)" : "var(--shadow-sm)", transform: h ? "translateY(-4px)" : "none" }}>
      <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={n.image} alt={n.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 400ms ease", transform: h ? "scale(1.04)" : "scale(1)" }} />
        <span style={{ position: "absolute", top: "14px", left: "14px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text)", background: "var(--star)", borderRadius: "999px", padding: "5px 12px" }}>{n.tag}</span>
      </div>
      <div style={{ padding: "18px 22px 20px" }}>
        <h3 style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.3, marginBottom: "8px" }}>{n.title}</h3>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-2)" }}><Icon name="calendar" size={14} color="var(--text-2)" />{n.date}</div>
      </div>
    </div>
  );
}

/* ── Dispatcher ─────────────────────────────────────────────────── */
export function ResultCard({ r }: { r: Result }) {
  if (r.kind === "restaurant") return <RestaurantCard r={r.item} />;
  if (r.kind === "dish") return <DishCard d={r.item} />;
  if (r.kind === "story") return <StoryResultCard s={r.item} />;
  if (r.kind === "video") return <VideoCard v={r.item} />;
  if (r.kind === "city") return <CityCard c={r.item} />;
  return <NewsCard n={r.item} />;
}

/* ── AI Quick Summary card ──────────────────────────────────────── */
export function QuickSummaryCard({ entity }: { entity: Result }) {
  const go = useGo();
  const wrap: CSSProperties = { background: "var(--card)", borderRadius: "24px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", overflow: "hidden", display: "grid", gridTemplateColumns: "1.15fr 0.85fr", marginBottom: "40px" };
  const pad: CSSProperties = { padding: "36px 40px", display: "flex", flexDirection: "column", justifyContent: "center" };
  const label: CSSProperties = { fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "12px", display: "inline-flex", alignItems: "center", gap: "7px" };

  if (entity.kind === "dish") {
    const d = entity.item;
    const rests = restaurantsServing(d), stories = dishStories(d), vids = dishVideos(d);
    return (
      <div style={wrap} className="card-in">
        <div style={pad}>
          <span style={label}><Icon name="star" size={14} color="var(--red)" />Quick Summary</span>
          <h2 style={{ fontSize: "38px", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1.05, marginBottom: "12px" }}>{d.name}</h2>
          <p style={{ fontSize: "16px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "20px", maxWidth: "480px" }}>{d.description}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", marginBottom: "26px" }}>
            <Stars rating={d.rating} />
            <Stat icon="store" value={`${servedCount(d)} restaurants`} />
            <Stat icon="book-open" value={`${stories.length} related stories`} />
            <Stat icon="play" value={`${vids.length} videos`} />
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Btn variant="primary" size="md" iconRight="arrow-right" onClick={() => go("dish", d.name)}>Explore Dish</Btn>
            <Btn variant="outline" size="md" onClick={() => go("city", cityById(d.cityId)?.name || "")}>{cityById(d.cityId)?.name}</Btn>
          </div>
          {rests.length > 0 && (
            <div style={{ marginTop: "22px", fontSize: "13px", color: "var(--text-2)" }}>
              Served at <strong style={{ color: "var(--text)" }}>{rests.slice(0, 3).map((r) => r.name).join(", ")}</strong>
              {rests.length > 3 ? ` +${rests.length - 3} more` : ""}
            </div>
          )}
        </div>
        <div style={{ position: "relative", minHeight: "300px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={d.image} alt={d.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
    );
  }

  if (entity.kind === "restaurant") {
    const r = entity.item;
    return (
      <div style={wrap} className="card-in">
        <div style={pad}>
          <span style={label}><Icon name="award" size={14} color="var(--red)" />Restaurant</span>
          <h2 style={{ fontSize: "36px", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1.05, marginBottom: "12px" }}>{r.name}</h2>
          <p style={{ fontSize: "16px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "20px", maxWidth: "480px" }}>{r.blurb}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", marginBottom: "26px" }}>
            <Stars rating={r.rating} />
            <Stat icon="map-pin" value={`${cityById(r.cityId)?.name}, ${cityById(r.cityId)?.region}`} />
            <Stat icon="utensils" value={r.cuisine} />
            {r.michelin > 0 && <Stat icon="award" value={`${r.michelin} Michelin`} />}
          </div>
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)", marginBottom: "8px" }}>Signature dishes</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {r.signatureDishes.map((s) => <span key={s} style={{ fontSize: "12px", fontWeight: 600, color: "var(--red)", background: "#FBE9EA", borderRadius: "999px", padding: "5px 12px" }}>{s}</span>)}
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Btn variant="primary" size="md" iconRight="arrow-right" onClick={() => go("restaurant", r.name)}>View Restaurant</Btn>
            <Btn variant="dark" size="md" icon="calendar-check" onClick={() => go("restaurant", r.name)}>Reserve</Btn>
          </div>
        </div>
        <div style={{ position: "relative", minHeight: "300px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={r.image} alt={r.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
    );
  }

  if (entity.kind !== "city") return null;
  const c = entity.item;
  return (
    <div style={wrap} className="card-in">
      <div style={pad}>
        <span style={label}><Icon name="map-pin" size={14} color="var(--red)" />City Guide</span>
        <h2 style={{ fontSize: "38px", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1.05, marginBottom: "12px" }}>{c.name}</h2>
        <p style={{ fontSize: "16px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "22px", maxWidth: "480px" }}>{c.blurb}</p>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)", marginBottom: "8px" }}>Famous dishes</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
            {c.famous.map((f) => <span key={f} style={{ fontSize: "12px", fontWeight: 600, color: "var(--red)", background: "#FBE9EA", borderRadius: "999px", padding: "5px 12px" }}>{f}</span>)}
          </div>
        </div>
        <Btn variant="primary" size="md" iconRight="arrow-right" onClick={() => go("city", c.name)}>Explore {c.name}</Btn>
      </div>
      <div style={{ position: "relative", minHeight: "300px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.image} alt={c.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </div>
  );
}
function Stat({ icon, value }: { icon: string; value: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
      <Icon name={icon} size={16} color="var(--text-2)" />{value}
    </span>
  );
}
