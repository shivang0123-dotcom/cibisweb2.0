"use client";

import { useState, type CSSProperties } from "react";
import { Icon } from "./icons";
import { Btn, Stars, useGo } from "./ui";
import { cityById, type Dish, type Restaurant, type Story, type Video, type City, type News } from "./data";
import { servedCount, restaurantsServing, dishStories, dishVideos, type Result } from "./search-utils";
import { useI18n } from "./i18n";

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
  const { l } = useI18n();
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
          <span style={{ position: "absolute", top: "14px", right: "14px", fontSize: "11px", fontWeight: 600, color: "#fff", background: "var(--success)", borderRadius: "999px", padding: "5px 11px" }}>{l("Open Now")}</span>
        )}
      </div>
      <div style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
          <h3 style={{ fontSize: "19px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.2 }}>{r.name}</h3>
          <Stars rating={r.rating} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--text-2)", fontSize: "14px", marginBottom: "14px" }}>
          <Icon name="map-pin" size={15} color="var(--text-2)" />{l(cityById(r.cityId)?.name)}, {l(cityById(r.cityId)?.region)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--red)", background: "#FBE9EA", borderRadius: "999px", padding: "5px 13px" }}>{l(r.cuisine)}</span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)" }}>{priceStr(r.price)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Universal DishCard ─────────────────────────────────────────────
   The single, reusable dish component (search, related, city, experience,
   restaurant menu, recommendations). Data via props only; restaurant-
   specific data (price, signature) passed separately as optional props. */
function DishBadge({ bg, color, icon, children }: { bg: string; color: string; icon: string; children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color, background: bg, borderRadius: "999px", padding: "4px 9px", boxShadow: "var(--shadow-sm)" }}>
      <Icon name={icon} size={11} color={color} />{children}
    </span>
  );
}
export function DishCard({ d, price, signature }: { d: Dish; price?: number; signature?: boolean }) {
  const go = useGo();
  const { l, dishDesc } = useI18n();
  const { h, on } = useHover();
  return (
    <div {...on} onClick={() => go("dish", d.name)}
      style={{ ...cardBase, borderRadius: "22px", display: "flex", flexDirection: "column", boxShadow: h ? "var(--shadow-lg)" : "var(--shadow-sm)", transform: h ? "translateY(-6px)" : "none", transition: "transform 300ms cubic-bezier(.16,1,.3,1), box-shadow 300ms ease" }}>
      {/* Master dish render — plated, studio-lit, consistent everywhere */}
      <div style={{ position: "relative", height: "208px", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 50% 38%, #FCFBF8 0%, #F1ECE3 100%)", perspective: "820px", overflow: "hidden" }}>
        <span style={{ position: "absolute", top: "14px", left: "14px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#fff", background: "rgba(17,17,17,0.55)", backdropFilter: "blur(6px)", borderRadius: "999px", padding: "5px 11px", zIndex: 2 }}>{l(d.category)}</span>
        <div style={{ position: "absolute", top: "14px", right: "14px", display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end", zIndex: 2 }}>
          {signature && <DishBadge bg="#FBE9EA" color="var(--red)" icon="star">{l("Signature")}</DishBadge>}
          {d.vegetarian && <DishBadge bg="#E3F0E4" color="var(--success)" icon="leaf">{l("Vegetarian")}</DishBadge>}
        </div>
        <div style={{ width: "156px", height: "156px", borderRadius: "50%", overflow: "hidden", border: "5px solid #fff", boxShadow: h ? "0 22px 34px rgba(17,17,17,0.24)" : "0 14px 26px rgba(17,17,17,0.16)", transformStyle: "preserve-3d", transform: h ? "rotateX(9deg) scale(1.06)" : "rotateX(0deg) scale(1)", transition: "transform 340ms cubic-bezier(.2,.8,.2,1), box-shadow 340ms ease" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={d.image} alt={d.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
      <div style={{ padding: "18px 22px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "6px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.2 }}>{d.name}</h3>
          <Stars rating={d.rating} />
        </div>
        <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.55, marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "43px" }}>{dishDesc(d)}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
          {price != null
            ? <span style={{ fontSize: "17px", fontWeight: 700, color: "var(--text)" }}>€{price}</span>
            : <span />}
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 600, color: "var(--red)" }}>
            {l("View Dish")}
            <span style={{ display: "inline-flex", transform: h ? "translateX(3px)" : "none", transition: "transform 220ms ease" }}><Icon name="arrow-right" size={16} color="var(--red)" /></span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Story card ─────────────────────────────────────────────────── */
export function StoryResultCard({ s }: { s: Story }) {
  const go = useGo();
  const { l, storyTitle, storyExcerpt, date, readTime } = useI18n();
  const { h, on } = useHover();
  const view = s.category === "Video" ? "video" : s.category === "News" ? "news" : "story";
  const badge = s.category === "Video" ? "#2E7D32" : s.category === "News" ? "#F5A623" : "#B3262E";
  return (
    <div {...on} onClick={() => go(view, s.title)} style={{ ...cardBase, boxShadow: h ? "var(--shadow-lg)" : "var(--shadow-sm)", transform: h ? "translateY(-4px)" : "none" }}>
      <div style={{ position: "relative", height: "190px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.image} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 400ms ease", transform: h ? "scale(1.04)" : "scale(1)" }} />
        <span style={{ position: "absolute", top: "14px", left: "14px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", background: badge, borderRadius: "999px", padding: "6px 13px" }}>{l(s.category)}</span>
      </div>
      <div style={{ padding: "20px 22px 22px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.25, marginBottom: "10px" }}>{storyTitle(s)}</h3>
        <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.55, marginBottom: "16px" }}>{storyExcerpt(s)}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "13px", color: "var(--text-2)", paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="calendar" size={14} color="var(--text-2)" />{date(s.date)}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="clock" size={14} color="var(--text-2)" />{readTime(s.readTime)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Video card ─────────────────────────────────────────────────── */
export function VideoCard({ v }: { v: Video }) {
  const go = useGo();
  const { videoTitle } = useI18n();
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
        <h3 style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.3, marginBottom: "6px" }}>{videoTitle(v.title)}</h3>
        <div style={{ fontSize: "13px", color: "var(--text-2)" }}>{v.channel}</div>
      </div>
    </div>
  );
}

/* ── City card ──────────────────────────────────────────────────── */
export function CityCard({ c }: { c: City }) {
  const go = useGo();
  const { l } = useI18n();
  const { h, on } = useHover();
  return (
    <div {...on} onClick={() => go("city", c.name)} style={{ ...cardBase, boxShadow: h ? "var(--shadow-lg)" : "var(--shadow-sm)", transform: h ? "translateY(-4px)" : "none" }}>
      <div style={{ position: "relative", height: "230px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.image} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 500ms ease", transform: h ? "scale(1.05)" : "scale(1)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(17,17,17,0.72), rgba(17,17,17,0) 55%)" }} />
        <div style={{ position: "absolute", left: "20px", bottom: "16px", right: "20px" }}>
          <div style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>{l(c.name)}</div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>{l(c.region)}</div>
        </div>
      </div>
      <div style={{ padding: "18px 22px 20px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)", marginBottom: "8px" }}>{l("Famous for")}</div>
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
  const { l, newsTitle, date } = useI18n();
  const { h, on } = useHover();
  return (
    <div {...on} onClick={() => go("news", n.title)} style={{ ...cardBase, boxShadow: h ? "var(--shadow-lg)" : "var(--shadow-sm)", transform: h ? "translateY(-4px)" : "none" }}>
      <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={n.image} alt={n.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 400ms ease", transform: h ? "scale(1.04)" : "scale(1)" }} />
        <span style={{ position: "absolute", top: "14px", left: "14px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text)", background: "var(--star)", borderRadius: "999px", padding: "5px 12px" }}>{l(n.tag)}</span>
      </div>
      <div style={{ padding: "18px 22px 20px" }}>
        <h3 style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.3, marginBottom: "8px" }}>{newsTitle(n.title)}</h3>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-2)" }}><Icon name="calendar" size={14} color="var(--text-2)" />{date(n.date)}</div>
      </div>
    </div>
  );
}

/* ── Recipe card (dish presented as a cookable recipe) ──────────── */
export function RecipeCard({ d }: { d: Dish }) {
  const go = useGo();
  const { l, dishIngredients } = useI18n();
  const { h, on } = useHover();
  const ing = dishIngredients(d);
  return (
    <div {...on} onClick={() => go("dish", d.name)}
      style={{ ...cardBase, boxShadow: h ? "var(--shadow-lg)" : "var(--shadow-sm)", transform: h ? "translateY(-4px)" : "none" }}>
      <div style={{ position: "relative", height: "190px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={d.image} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 400ms ease", transform: h ? "scale(1.04)" : "scale(1)" }} />
        <span style={{ position: "absolute", top: "14px", left: "14px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", background: "var(--success)", borderRadius: "999px", padding: "6px 12px" }}>
          <Icon name="chef-hat" size={13} color="#fff" />{l("Recipe")}
        </span>
      </div>
      <div style={{ padding: "20px 22px" }}>
        <h3 style={{ fontSize: "19px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.2, marginBottom: "12px" }}>{d.name}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px", color: "var(--text-2)", marginBottom: "16px", flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="timer" size={14} color="var(--text-2)" />{d.prepMinutes + d.cookMinutes} {l("min")}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="flame" size={14} color="var(--text-2)" />{l(d.difficulty)}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="users" size={14} color="var(--text-2)" />{l("Serves")} {d.servings}</span>
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.55, paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
          {ing.slice(0, 3).join(" · ")}{ing.length > 3 ? " · …" : ""}
        </div>
      </div>
    </div>
  );
}

/* ── Dispatcher ─────────────────────────────────────────────────── */
export function ResultCard({ r }: { r: Result }) {
  if (r.kind === "restaurant") return <RestaurantCard r={r.item} />;
  if (r.kind === "dish") return <DishCard d={r.item} />;
  if (r.kind === "recipe") return <RecipeCard d={r.item} />;
  if (r.kind === "story") return <StoryResultCard s={r.item} />;
  if (r.kind === "video") return <VideoCard v={r.item} />;
  if (r.kind === "city") return <CityCard c={r.item} />;
  return <NewsCard n={r.item} />;
}

/* ── AI Quick Summary card ──────────────────────────────────────── */
export function QuickSummaryCard({ entity }: { entity: Result }) {
  const go = useGo();
  const { l, dishDesc, blurb, cityBlurb } = useI18n();
  const wrap: CSSProperties = { background: "var(--card)", borderRadius: "24px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", overflow: "hidden", display: "grid", gridTemplateColumns: "1.15fr 0.85fr", marginBottom: "40px" };
  const pad: CSSProperties = { padding: "36px 40px", display: "flex", flexDirection: "column", justifyContent: "center" };
  const label: CSSProperties = { fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "12px", display: "inline-flex", alignItems: "center", gap: "7px" };

  if (entity.kind === "dish") {
    const d = entity.item;
    const rests = restaurantsServing(d), stories = dishStories(d), vids = dishVideos(d);
    return (
      <div style={wrap} className="card-in">
        <div style={pad}>
          <span style={label}><Icon name="star" size={14} color="var(--red)" />{l("Quick Summary")}</span>
          <h2 style={{ fontSize: "38px", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1.05, marginBottom: "12px" }}>{d.name}</h2>
          <p style={{ fontSize: "16px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "20px", maxWidth: "480px" }}>{dishDesc(d)}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", marginBottom: "26px" }}>
            <Stars rating={d.rating} />
            <Stat icon="store" value={`${servedCount(d)} ${l("restaurants")}`} />
            <Stat icon="book-open" value={`${stories.length} ${l("related stories")}`} />
            <Stat icon="play" value={`${vids.length} ${l("videos")}`} />
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Btn variant="primary" size="md" iconRight="arrow-right" onClick={() => go("dish", d.name)}>{l("Explore Dish")}</Btn>
            <Btn variant="outline" size="md" onClick={() => go("city", cityById(d.cityId)?.name || "")}>{l(cityById(d.cityId)?.name)}</Btn>
          </div>
          {rests.length > 0 && (
            <div style={{ marginTop: "22px", fontSize: "13px", color: "var(--text-2)" }}>
              {l("Served at")} <strong style={{ color: "var(--text)" }}>{rests.slice(0, 3).map((r) => r.name).join(", ")}</strong>
              {rests.length > 3 ? ` +${rests.length - 3} ${l("more")}` : ""}
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
          <span style={label}><Icon name="award" size={14} color="var(--red)" />{l("Restaurant")}</span>
          <h2 style={{ fontSize: "36px", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1.05, marginBottom: "12px" }}>{r.name}</h2>
          <p style={{ fontSize: "16px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "20px", maxWidth: "480px" }}>{blurb(r)}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", marginBottom: "26px" }}>
            <Stars rating={r.rating} />
            <Stat icon="map-pin" value={`${l(cityById(r.cityId)?.name)}, ${l(cityById(r.cityId)?.region)}`} />
            <Stat icon="utensils" value={l(r.cuisine)} />
            {r.michelin > 0 && <Stat icon="award" value={`${r.michelin} Michelin`} />}
          </div>
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)", marginBottom: "8px" }}>{l("Signature dishes")}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {r.signatureDishes.map((s) => <span key={s} style={{ fontSize: "12px", fontWeight: 600, color: "var(--red)", background: "#FBE9EA", borderRadius: "999px", padding: "5px 12px" }}>{s}</span>)}
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Btn variant="primary" size="md" iconRight="arrow-right" onClick={() => go("restaurant", r.name)}>{l("View Restaurant")}</Btn>
            <Btn variant="dark" size="md" icon="calendar-check" onClick={() => go("restaurant", r.name)}>{l("Reserve")}</Btn>
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
        <span style={label}><Icon name="map-pin" size={14} color="var(--red)" />{l("City Guide")}</span>
        <h2 style={{ fontSize: "38px", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1.05, marginBottom: "12px" }}>{l(c.name)}</h2>
        <p style={{ fontSize: "16px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "22px", maxWidth: "480px" }}>{cityBlurb(c)}</p>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)", marginBottom: "8px" }}>{l("Famous dishes")}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
            {c.famous.map((f) => <span key={f} style={{ fontSize: "12px", fontWeight: 600, color: "var(--red)", background: "#FBE9EA", borderRadius: "999px", padding: "5px 12px" }}>{f}</span>)}
          </div>
        </div>
        <Btn variant="primary" size="md" iconRight="arrow-right" onClick={() => go("city", c.name)}>{l("Explore")} {l(c.name)}</Btn>
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
