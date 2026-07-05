"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Icon } from "./icons";
import { Container, Btn, Stars, useGo } from "./ui";
import { DishCard, RestaurantCard, StoryResultCard, VideoCard, NewsCard, RecipeCard, CityCard } from "./ResultCards";
import {
  DISHES, RESTAURANTS, STORIES, VIDEOS, NEWS,
  cityById, dishByName, restaurantByName, cityByName, cityExtra, attractionsFor,
  type Restaurant,
} from "./data";
import {
  servedCount, restaurantsServing, relatedDishes, dishStories, dishVideos,
  cityRestaurants, cityDishes, cityStories, cityVideos,
  similarRestaurants, experienceContent, restaurantMenu, nearbyCities, dishPrice,
} from "./search-utils";
import { useI18n, useL } from "./i18n";

/* Shared section shell — auto-localizes its label/title */
function Section({ label, title, children, action }: { label?: string; title: string; children: ReactNode; action?: ReactNode }) {
  const l = useL();
  return (
    <section style={{ padding: "40px 0" }}>
      <Container style={{ maxWidth: "1320px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", gap: "20px", flexWrap: "wrap" }}>
          <div>
            {label && <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "10px" }}>{l(label)}</div>}
            <h2 style={{ fontSize: "32px", fontWeight: 600, letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1.1 }}>{l(title)}</h2>
          </div>
          {action}
        </div>
        {children}
      </Container>
    </section>
  );
}
function Grid({ children }: { children: ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>{children}</div>;
}
function Breadcrumb({ trail }: { trail: { label: string; go?: () => void }[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-2)", marginBottom: "18px", flexWrap: "wrap" }}>
      {trail.map((t, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          {t.go ? <button onClick={t.go} style={{ color: "var(--text-2)", fontWeight: 500 }}>{t.label}</button> : <span style={{ color: "var(--text)", fontWeight: 600 }}>{t.label}</span>}
          {i < trail.length - 1 && <Icon name="arrow-right" size={13} color="var(--text-2)" />}
        </span>
      ))}
    </div>
  );
}

/* Small image tile used for a city's Top Experiences */
function ExperienceTile({ title, sub, img, on }: { title: string; sub: string; img: string; on: () => void }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={on} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ textAlign: "left", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "18px", overflow: "hidden", boxShadow: h ? "var(--shadow-lg)" : "var(--shadow-sm)", transform: h ? "translateY(-4px)" : "none", transition: "transform 240ms ease, box-shadow 240ms ease" }}>
      <div style={{ position: "relative", height: "140px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 400ms ease", transform: h ? "scale(1.05)" : "scale(1)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(17,17,17,0.35), transparent 60%)" }} />
      </div>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</span>
          <span style={{ display: "inline-flex", transform: h ? "translateX(2px)" : "none", transition: "transform 200ms ease" }}><Icon name="arrow-right" size={15} color="var(--red)" /></span>
        </div>
      </div>
    </button>
  );
}

/* ── Dish page — Featured Mode (tabbed detail card) ─────────────── */
const DISH_TABS = ["Story", "Ingredients", "Recipe", "Nutrition", "Pairing", "Where to Try"] as const;
type DishTab = (typeof DISH_TABS)[number];

export function DishPage({ query }: { query: string }) {
  const go = useGo();
  const { l, dishDesc, dishHistory, dishFunFacts, dishSteps, dishIngredients, wineNote } = useI18n();
  const dish = dishByName(query) || DISHES.find((d) => d.name.toLowerCase().includes(query.toLowerCase())) || DISHES[0];
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, active: false });
  const [tab, setTab] = useState<DishTab>("Story");
  const [fav, setFav] = useState(false);
  const city = cityById(dish.cityId);
  const rests = restaurantsServing(dish), stories = dishStories(dish), vids = dishVideos(dish), related = relatedDishes(dish);
  const served = servedCount(dish);
  const reviews = 200 + ((dish.name.length * 89 + Math.round(dish.rating * 100)) % 1800);
  const price = dishPrice(dish, 3);

  const onMove = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTilt({ rx: -((e.clientY - r.top) / r.height - 0.5) * 10, ry: ((e.clientX - r.left) / r.width - 0.5) * 14, active: true });
  };

  const pill = (icon: string, value: string, label: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "3px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "16px", padding: "14px 16px" }}>
      <Icon name={icon} size={16} color="var(--red)" />
      <div style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text)", marginTop: "4px" }}>{value}</div>
      <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", color: "var(--text-2)" }}>{label}</div>
    </div>
  );

  const tabBody = () => {
    if (tab === "Story") return <p style={{ fontSize: "15px", color: "var(--text-2)", lineHeight: 1.7 }}>{dishHistory(dish)}</p>;
    if (tab === "Ingredients") return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {dishIngredients(dish).map((ing) => (
          <span key={ing} style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 500, color: "var(--text)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "999px", padding: "7px 13px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--red)" }} />{ing}
          </span>
        ))}
      </div>
    );
    if (tab === "Recipe") return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {dishSteps(dish).map((step, i) => (
          <div key={i} style={{ display: "flex", gap: "13px" }}>
            <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#FBE9EA", color: "var(--red)", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
            <span style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.55, paddingTop: "2px" }}>{step}</span>
          </div>
        ))}
      </div>
    );
    if (tab === "Nutrition") return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", maxWidth: "440px" }}>
        {([["Calories", dish.nutrition.calories, "kcal"], ["Protein", dish.nutrition.protein, "g"], ["Carbs", dish.nutrition.carbs, "g"], ["Fat", dish.nutrition.fat, "g"], ["Fiber", dish.nutrition.fiber, "g"], ["Sugar", dish.nutrition.sugar, "g"]] as [string, number, string][]).map(([lab, v, u]) => (
          <div key={lab}><div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>{v}<span style={{ fontSize: "12px", color: "var(--text-2)" }}> {u}</span></div><div style={{ fontSize: "12px", color: "var(--text-2)" }}>{l(lab)}</div></div>
        ))}
      </div>
    );
    if (tab === "Pairing") return (
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        <span style={{ width: "50px", height: "50px", borderRadius: "14px", background: "#FBE3E4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="wine" size={22} color="var(--red)" /></span>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--red)" }}>{dish.wine.type === "None" ? l("No pairing") : `${l(dish.wine.type)} ${l("wine")}`}</div>
          <div style={{ fontSize: "18px", fontWeight: 600, color: "var(--text)", margin: "2px 0 5px" }}>{dish.wine.name}</div>
          <div style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.5, maxWidth: "420px" }}>{wineNote(dish)}</div>
        </div>
      </div>
    );
    // Where to Try
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {rests.slice(0, 4).map((r) => (
          <button key={r.id} onClick={() => go("restaurant", r.name)} style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
            <span style={{ width: "40px", height: "40px", borderRadius: "11px", overflow: "hidden", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.image} alt={r.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>{r.name}</span>
              <span style={{ display: "block", fontSize: "12px", color: "var(--text-2)" }}>{l(cityById(r.cityId)?.name)} · ★ {r.rating.toFixed(1)}</span>
            </span>
            <Icon name="arrow-up-right" size={15} color="var(--text-2)" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Container style={{ maxWidth: "1320px", paddingTop: "36px", paddingBottom: "8px" }}>
        <Breadcrumb trail={[{ label: l("Home"), go: () => go("home") }, { label: l(city?.name || "Italy"), go: () => go("city", city?.name) }, { label: dish.name }]} />

        {/* Featured card */}
        <div style={{ position: "relative", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "28px", boxShadow: "var(--shadow)", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "22px", right: "24px", display: "flex", gap: "10px", zIndex: 4 }}>
            <button aria-label={l("Share")} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "38px", padding: "0 14px", borderRadius: "12px", background: "var(--bg)", border: "1px solid var(--border)", fontSize: "13px", fontWeight: 600, color: "var(--text)" }}><Icon name="arrow-up-right" size={15} color="var(--text-2)" />{l("Share")}</button>
            <button aria-label="Save" onClick={() => setFav((f) => !f)} style={{ width: "38px", height: "38px", borderRadius: "12px", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="heart" size={18} color={fav ? "var(--red)" : "var(--text-2)"} className={fav ? "fill-current" : ""} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.02fr 0.98fr" }}>
            {/* Left */}
            <div style={{ padding: "44px 46px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "10px" }}>{l(dish.category)}</div>
              <h1 style={{ fontSize: "44px", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05, color: "var(--text)", marginBottom: "6px" }}>{dish.name}</h1>
              <div style={{ fontSize: "15px", color: "var(--text-2)", marginBottom: "16px" }}>{l(dish.category)} · {l(city?.region)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                <Stars rating={dish.rating} />
                <span style={{ fontSize: "14px", color: "var(--text-2)" }}>({reviews.toLocaleString()} {l("reviews")})</span>
              </div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "var(--red)", background: "#FBE9EA", borderRadius: "999px", padding: "6px 12px" }}><Icon name="chef-hat" size={13} color="var(--red)" />{dish.rating >= 4.7 ? l("Chef's Choice") : l("Traditional")}</span>
                {served > 55 && <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "var(--star)", background: "#FCEFD6", borderRadius: "999px", padding: "6px 12px" }}><Icon name="trending-up" size={13} color="var(--star)" />{l("Popular")}</span>}
                {dish.vegetarian && <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "var(--success)", background: "#E3F0E4", borderRadius: "999px", padding: "6px 12px" }}><Icon name="leaf" size={13} color="var(--success)" />{l("Vegetarian")}</span>}
              </div>
              <p style={{ fontSize: "15px", color: "var(--text-2)", lineHeight: 1.65, marginBottom: "24px" }}>{dishDesc(dish)}</p>

              {/* Quick info pills */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "28px" }}>
                {pill("gem", `€${price}`, l("Price"))}
                {pill("timer", `${dish.prepMinutes} ${l("min")}`, l("Prep Time"))}
                {pill("flame", `${dish.nutrition.calories}`, l("Calories"))}
                {pill("alert-triangle", dish.allergens.length ? dish.allergens.slice(0, 2).map((a) => l(a)).join(", ") : l("None"), l("Contains"))}
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: "22px", borderBottom: "1px solid var(--border)", marginBottom: "20px", overflowX: "auto" }}>
                {DISH_TABS.map((t) => {
                  const on = tab === t;
                  return (
                    <button key={t} onClick={() => setTab(t)}
                      style={{ position: "relative", padding: "0 0 12px", fontSize: "14px", fontWeight: 600, whiteSpace: "nowrap", color: on ? "var(--red)" : "var(--text-2)", transition: "color 180ms ease" }}>
                      {l(t)}
                      <span style={{ position: "absolute", left: 0, right: 0, bottom: "-1px", height: "2px", background: "var(--red)", borderRadius: "2px", transform: on ? "scaleX(1)" : "scaleX(0)", transition: "transform 220ms ease" }} />
                    </button>
                  );
                })}
              </div>
              <div key={tab} style={{ minHeight: "150px", animation: "acc-in 260ms cubic-bezier(.16,1,.3,1)" }}>{tabBody()}</div>
            </div>

            {/* Right — big plated dish */}
            <div onMouseMove={onMove} onMouseLeave={() => setTilt({ rx: 0, ry: 0, active: false })}
              style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "30px", background: "radial-gradient(circle at 55% 42%, #FCFBF8 0%, #F1ECE3 100%)", perspective: "1100px" }}>
              <div style={{ position: "relative", width: "88%", maxWidth: "420px", aspectRatio: "1", transformStyle: "preserve-3d", transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, transition: tilt.active ? "transform 120ms ease-out" : "transform 500ms cubic-bezier(.2,.8,.2,1)", animation: "floaty 6s ease-in-out infinite" }}>
                <div style={{ position: "absolute", left: "50%", bottom: "6%", width: "70%", height: "10%", transform: "translateX(-50%) translateZ(-40px)", background: "rgba(17,17,17,0.22)", filter: "blur(26px)", borderRadius: "50%" }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dish.image} alt={dish.name} loading="eager" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", border: "8px solid #fff", boxShadow: "var(--shadow-float)", transform: "translateZ(0)" }} />
              </div>
            </div>
          </div>

          {/* Served in N restaurants */}
          {rests.length > 0 && (
            <div style={{ borderTop: "1px solid var(--border)", padding: "18px 46px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", background: "#FCFBF8" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ display: "flex" }}>
                  {rests.slice(0, 5).map((r, i) => (
                    <span key={r.id} style={{ width: "36px", height: "36px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--card)", marginLeft: i ? "-12px" : 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.image} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>{l("Served in")} {served} {l("restaurants")}</span>
              </div>
              <button onClick={() => document.getElementById("serving")?.scrollIntoView({ behavior: "smooth" })} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 600, color: "var(--red)" }}>
                {l("View Restaurants")} <Icon name="arrow-right" size={15} color="var(--red)" />
              </button>
            </div>
          )}
        </div>
      </Container>

      {/* Fun facts */}
      <Section label="Did you know?" title="Fun facts">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
          {dishFunFacts(dish).map((f, i) => (
            <div key={i} style={{ display: "flex", gap: "14px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px 22px" }}>
              <span style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#FCEFD6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="sparkles" size={16} color="var(--star)" />
              </span>
              <p style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.6, paddingTop: "5px" }}>{f}</p>
            </div>
          ))}
        </div>
      </Section>

      <div id="serving" />
      {rests.length > 0 && <Section label="Where to eat" title="Restaurants serving it" action={<Btn variant="outline" size="sm" onClick={() => go("restaurants")}>{l("All restaurants")}</Btn>}><Grid>{rests.map((r) => <RestaurantCard key={r.id} r={r} />)}</Grid></Section>}
      {related.length > 0 && <Section label="Discover" title="Related dishes"><Grid>{related.map((d) => <DishCard key={d.id} d={d} />)}</Grid></Section>}
      {vids.length > 0 && <Section label="Watch" title="Videos"><Grid>{vids.map((v) => <VideoCard key={v.id} v={v} />)}</Grid></Section>}
      {stories.length > 0 && <Section label="Story" title={`${l("Stories about")} ${dish.name}`}><Grid>{stories.map((s) => <StoryResultCard key={s.id} s={s} />)}</Grid></Section>}
    </div>
  );
}

/* ── Restaurant page ────────────────────────────────────────────── */
/* ── Restaurant menu — categorized, smoothly expanding ──────────── */
function MenuSection({ r }: { r: Restaurant }) {
  const { l } = useI18n();
  const { groups, drinks } = restaurantMenu(r);
  const [open, setOpen] = useState<string>(groups[0]?.label ?? "");
  const Accordion = ({ label, count, children }: { label: string; count: number; children: ReactNode }) => {
    const isOpen = open === label;
    return (
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "18px", overflow: "hidden" }}>
        <button onClick={() => setOpen(isOpen ? "" : label)} aria-expanded={isOpen}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", textAlign: "left" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "12px", fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text)" }}>
            {l(label)}<span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)" }}>{count}</span>
          </span>
          <span style={{ display: "inline-flex", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 240ms ease", color: "var(--text-2)" }}><Icon name="chevron-down" size={18} /></span>
        </button>
        {isOpen && <div style={{ padding: "0 24px 8px", animation: "acc-in 260ms cubic-bezier(.16,1,.3,1)" }}>{children}</div>}
      </div>
    );
  };
  return (
    <Section label="Menu" title="Our menu">
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {groups.map((g) => (
          <Accordion key={g.label} label={g.label} count={g.items.length}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "18px", padding: "10px 0 6px" }}>
              {g.items.map(({ dish, price, signature }) => (
                <DishCard key={dish.id} d={dish} price={price} signature={signature} />
              ))}
            </div>
          </Accordion>
        ))}
        {drinks.length > 0 && (
          <Accordion label="Drinks" count={drinks.length}>
            {drinks.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderTop: "1px solid var(--border)" }}>
                <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#FBE3E4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="wine" size={18} color="var(--red)" /></span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: "16px", fontWeight: 600, color: "var(--text)" }}>{d.name}</span>
                  <span style={{ display: "block", fontSize: "13px", color: "var(--text-2)" }}>{l(d.note)} {l("wine")}</span>
                </span>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>€{d.price}</span>
              </div>
            ))}
          </Accordion>
        )}
      </div>
    </Section>
  );
}

/* ── Restaurant location — stylized map + directions + nearby ───── */
function LocationSection({ r }: { r: Restaurant }) {
  const go = useGo();
  const { l } = useI18n();
  const city = cityById(r.cityId);
  const attractions = attractionsFor(r.cityId);
  return (
    <Section label="Location" title="How to find us">
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.65fr", gap: "24px" }}>
        {/* Stylized street map */}
        <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", border: "1px solid var(--border)", minHeight: "320px", background: "linear-gradient(160deg, #FCFBF8 0%, #F1EDE5 100%)" }}>
          <svg viewBox="0 0 600 340" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
            <g stroke="#E4DFD5" strokeWidth="10" strokeLinecap="round">
              <path d="M -20,90 L 640,120" /><path d="M -20,220 L 640,250" />
              <path d="M 130,-20 L 100,360" /><path d="M 330,-20 L 360,360" /><path d="M 480,-20 L 500,360" />
            </g>
            <g stroke="#EDE8DF" strokeWidth="4">
              <path d="M -20,160 L 640,185" /><path d="M 230,-20 L 215,360" /><path d="M 420,-20 L 435,360" />
            </g>
            <circle cx="300" cy="170" r="60" fill="rgba(179,38,46,0.06)" />
          </svg>
          <span className="map-pin-active" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-60%)", width: "44px", height: "44px", borderRadius: "50% 50% 50% 0", background: "var(--red)", rotate: "-45deg", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-lg)" }}>
            <span style={{ rotate: "45deg", display: "flex" }}><Icon name="utensils" size={18} color="#fff" /></span>
          </span>
          <div style={{ position: "absolute", left: "20px", right: "20px", bottom: "18px", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", borderRadius: "16px", boxShadow: "var(--shadow)", padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>{r.address}</div>
              <div style={{ fontSize: "13px", color: "var(--text-2)" }}>{l(city?.name)}, {l(city?.region)}</div>
            </div>
            <Btn variant="dark" size="sm" icon="navigation" onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(r.name + " " + (city?.name || ""))}`, "_blank", "noopener")}>{l("Get directions")}</Btn>
          </div>
        </div>
        {/* Nearby attractions */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px 26px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "16px" }}>{l("Nearby Attractions")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {attractions.map((a) => (
              <div key={a.name} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "38px", height: "38px", borderRadius: "11px", background: "#FCEFD6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="map-pin" size={17} color="var(--star)" /></span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>{a.name}</span>
                  <span style={{ display: "block", fontSize: "12px", color: "var(--text-2)" }}>{a.type} · {a.mins} {l("min walk")}</span>
                </span>
              </div>
            ))}
          </div>
          <button onClick={() => go("city", city?.name || "")} style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "14px", fontWeight: 600, color: "var(--red)", marginTop: "20px" }}>
            {l("Explore")} {l(city?.name)} <Icon name="arrow-right" size={15} />
          </button>
        </div>
      </div>
    </Section>
  );
}

export function RestaurantPage({ query }: { query: string }) {
  const go = useGo();
  const { l, blurb, restStory } = useI18n();
  const r = restaurantByName(query) || RESTAURANTS.find((x) => x.name.toLowerCase().includes(query.toLowerCase())) || RESTAURANTS[0];
  const city = cityById(r.cityId);
  const similar = similarRestaurants(r);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [reserved, setReserved] = useState(false);
  const [fav, setFav] = useState(false);

  return (
    <div>
      <section style={{ padding: "0 0 24px" }}>
        <div style={{ position: "relative", height: "380px", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={r.image} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(17,17,17,0.78), rgba(17,17,17,0.1) 60%)" }} />
          <div style={{ position: "absolute", top: "22px", right: "24px", display: "flex", gap: "10px", zIndex: 3 }}>
            <button onClick={() => setFav((f) => !f)} aria-pressed={fav} aria-label={fav ? l("Saved") : l("Add to favourites")} title={fav ? l("Saved") : l("Add to favourites")}
              style={{ width: "46px", height: "46px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", boxShadow: "var(--shadow-sm)", transition: "transform 180ms ease" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.06)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "none"; }}>
              <Icon name="heart" size={20} color={fav ? "var(--red)" : "var(--text)"} className={fav ? "fill-current" : ""} />
            </button>
            <Btn variant="primary" size="md" icon="calendar-check" onClick={() => { setReserved(false); setReserveOpen(true); }}>{l("Reserve")}</Btn>
          </div>
          <Container style={{ maxWidth: "1320px", position: "absolute", left: 0, right: 0, bottom: "32px" }}>
            {r.michelin > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#fff", background: "var(--red)", borderRadius: "999px", padding: "6px 13px", marginBottom: "14px" }}><Icon name="award" size={14} color="#fff" />{r.michelin} {l("Michelin Stars")}</span>}
            <h1 style={{ fontSize: "54px", fontWeight: 700, letterSpacing: "-0.035em", color: "#fff", lineHeight: 1.02, marginBottom: "12px" }}>{r.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", color: "#fff" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="star" size={16} color="var(--star)" className="rating-star" /><strong>{r.rating.toFixed(1)}</strong></span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", opacity: 0.9 }}><Icon name="map-pin" size={16} color="#fff" />{l(city?.name)}, {l(city?.region)}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", opacity: 0.9 }}><Icon name="utensils" size={16} color="#fff" />{l(r.cuisine)}</span>
              <span style={{ opacity: 0.9 }}>{"€".repeat(r.price)}</span>
              {r.openNow && <span style={{ fontSize: "12px", fontWeight: 600, background: "var(--success)", borderRadius: "999px", padding: "4px 11px" }}>{l("Open Now")}</span>}
            </div>
          </Container>
        </div>
      </section>

      <Section label="Overview" title="About" action={<Btn variant="primary" size="md" icon="calendar-check" onClick={() => { setReserved(false); setReserveOpen(true); }}>{l("Reserve a table")}</Btn>}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "34px 38px", maxWidth: "860px" }}>
          <p style={{ fontSize: "17px", color: "var(--text-2)", lineHeight: 1.7 }}>{blurb(r)} {restStory(r)}</p>
        </div>
      </Section>

      <Section label="Plan your visit" title="Hours, chef & location">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {/* Opening hours */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "26px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <span style={{ width: "38px", height: "38px", borderRadius: "11px", background: "#E3F0E4", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="clock" size={18} color="var(--success)" /></span>
              <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>{l("Opening hours")}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {r.hours.map((h) => (
                <div key={h.days} style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "14px" }}>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{l(h.days)}</span>
                  <span style={{ color: h.time === "Closed" ? "var(--red)" : "var(--text-2)", textAlign: "right" }}>{l(h.time)}</span>
                </div>
              ))}
            </div>
            {r.openNow && <div style={{ marginTop: "16px", display: "inline-flex", fontSize: "12px", fontWeight: 600, color: "#fff", background: "var(--success)", borderRadius: "999px", padding: "5px 12px" }}>{l("Open now")}</div>}
          </div>
          {/* Chef */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "26px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <span style={{ width: "38px", height: "38px", borderRadius: "11px", background: "#FBE3E4", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="chef-hat" size={18} color="var(--red)" /></span>
              <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>{l("In the kitchen")}</span>
            </div>
            <div style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text)" }}>{r.chef.name}</div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--red)", marginBottom: "10px" }}>{l(r.chef.title)}</div>
            <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6 }}>{l(r.chef.bio)}</p>
          </div>
          {/* Location */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "26px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <span style={{ width: "38px", height: "38px", borderRadius: "11px", background: "#FCEFD6", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="navigation" size={18} color="var(--star)" /></span>
              <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>{l("Location")}</span>
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>{r.address}</div>
            <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "16px" }}>{l(city?.name)}, {l(city?.region)} — {city?.name === "Venice" ? l("in the heart of the lagoon city") : l("in the heart of the historic centre")}.</p>
            <button onClick={() => go("city", city?.name || "")}
              style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "14px", fontWeight: 600, color: "var(--red)" }}>
              {l("Explore")} {l(city?.name)} <Icon name="arrow-right" size={15} />
            </button>
          </div>
        </div>
      </Section>

      <MenuSection r={r} />

      <Section label="Gallery" title="Inside">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {r.gallery.map((g, i) => (
            <div key={i} style={{ borderRadius: "16px", overflow: "hidden", height: "180px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </Section>

      <Section label="Reviews" title="What guests say">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {r.reviews.map((rev, i) => (
            <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "26px 28px", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div style={{ display: "flex", gap: "3px" }}>{Array.from({ length: rev.rating }).map((_, k) => <Icon key={k} name="star" size={16} color="var(--star)" className="rating-star" />)}</div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, color: "var(--success)" }}><Icon name="check-circle" size={13} color="var(--success)" />{l("Verified visit")}</span>
              </div>
              <p style={{ fontSize: "15px", color: "var(--text)", lineHeight: 1.6, marginBottom: "16px", flex: 1 }}>“{l(rev.text)}”</p>
              {i % 2 === 0 && (
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                  {[r.gallery[i % r.gallery.length], r.gallery[(i + 1) % r.gallery.length]].map((g, k) => (
                    <div key={k} style={{ width: "72px", height: "72px", borderRadius: "12px", overflow: "hidden" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-2)" }}>{rev.name}</div>
            </div>
          ))}
        </div>
      </Section>

      <LocationSection r={r} />

      {similar.length > 0 && (
        <Section label="You might also like" title="Related Restaurants">
          <Grid>{similar.map((s) => <RestaurantCard key={s.id} r={s} />)}</Grid>
        </Section>
      )}

      {/* Reservation modal */}
      {reserveOpen && (
        <div onClick={() => setReserveOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(17,17,17,0.45)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "panelIn 200ms ease" }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: "440px", background: "var(--card)", borderRadius: "24px", boxShadow: "var(--shadow-float)", padding: "34px 36px", animation: "cardIn 260ms cubic-bezier(.16,1,.3,1)" }}>
            {!reserved ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <h3 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)" }}>{l("Reserve a table")}</h3>
                  <button aria-label="Close" onClick={() => setReserveOpen(false)} style={{ display: "flex", color: "var(--text-2)" }}><Icon name="x" size={20} /></button>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-2)", marginBottom: "24px" }}>{r.name} · {l(city?.name)}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--bg)", borderRadius: "14px", border: "1px solid var(--border)", padding: "0 16px", height: "50px" }}>
                    <Icon name="calendar" size={17} color="var(--text-2)" />
                    <input type="date" aria-label="Date" style={{ flex: 1, fontSize: "15px", color: "var(--text)" }} />
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", background: "var(--bg)", borderRadius: "14px", border: "1px solid var(--border)", padding: "0 16px", height: "50px" }}>
                      <Icon name="clock" size={17} color="var(--text-2)" />
                      <input type="time" defaultValue="20:00" aria-label="Time" style={{ flex: 1, fontSize: "15px", color: "var(--text)" }} />
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", background: "var(--bg)", borderRadius: "14px", border: "1px solid var(--border)", padding: "0 16px", height: "50px" }}>
                      <Icon name="users" size={17} color="var(--text-2)" />
                      <input type="number" min={1} max={12} defaultValue={2} aria-label="Guests" style={{ flex: 1, fontSize: "15px", color: "var(--text)" }} />
                    </div>
                  </div>
                </div>
                <Btn variant="primary" size="lg" style={{ width: "100%" }} onClick={() => setReserved(true)}>{l("Confirm reservation")}</Btn>
                <p style={{ fontSize: "12px", color: "var(--text-2)", textAlign: "center", marginTop: "14px" }}>{l("Demo flow — no real booking is made.")}</p>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <span style={{ display: "inline-flex", width: "62px", height: "62px", borderRadius: "50%", background: "#E3F0E4", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                  <Icon name="check-circle" size={30} color="var(--success)" />
                </span>
                <h3 style={{ fontSize: "22px", fontWeight: 600, color: "var(--text)", marginBottom: "8px" }}>{l("Table reserved!")}</h3>
                <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "24px" }}>{r.name} · {l("A confirmation would arrive by email in the full product.")}</p>
                <Btn variant="dark" size="md" style={{ width: "100%" }} onClick={() => setReserveOpen(false)}>{l("Done")}</Btn>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── City page ──────────────────────────────────────────────────── */
export function CityPage({ query }: { query: string }) {
  const c = cityByName(query) || cityById(query) || cityByName(query.split(" ")[0]) || cityRestaurants("rome") && null;
  const city = c || cityByName("Rome")!;
  const rests = cityRestaurants(city.id), dishes = cityDishes(city.id), stories = cityStories(city.id), vids = cityVideos(city.id);
  const go = useGo();
  const { l, cityBlurb, cityCulture, extra: itExtraFn } = useI18n();
  const enExtra = cityExtra(city.id);
  const itExtra = itExtraFn(city.id);
  const festivals = enExtra.festivals.map((f, i) => ({ name: itExtra?.festivals[i]?.name ?? f.name, month: f.month, desc: itExtra?.festivals[i]?.desc ?? f.desc }));
  const gems = enExtra.hiddenGems.map((g, i) => ({ name: itExtra?.hiddenGems[i]?.name ?? g.name, desc: itExtra?.hiddenGems[i]?.desc ?? g.desc }));
  const markets = enExtra.markets.map((m, i) => ({ name: itExtra?.markets[i]?.name ?? m.name, desc: itExtra?.markets[i]?.desc ?? m.desc }));

  return (
    <div>
      <section style={{ padding: "0 0 24px" }}>
        <div style={{ position: "relative", height: "420px", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={city.image} alt={city.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(17,17,17,0.8), rgba(17,17,17,0.15) 60%)" }} />
          <Container style={{ maxWidth: "1320px", position: "absolute", left: 0, right: 0, bottom: "40px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#F0A8AC", marginBottom: "12px" }}>{l(city.region)}</div>
            <h1 style={{ fontSize: "64px", fontWeight: 700, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1, marginBottom: "14px" }}>{l(city.name)}</h1>
            <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.85)", maxWidth: "560px", lineHeight: 1.6 }}>{cityBlurb(city)}</p>
          </Container>
        </div>
      </section>

      {/* Stat pills */}
      <Container style={{ maxWidth: "1320px", paddingTop: "8px", paddingBottom: "8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
          {[
            { icon: "store", bg: "#FBE3E4", color: "var(--red)", value: rests.length, label: l("Restaurants") },
            { icon: "utensils", bg: "#FCEFD6", color: "var(--star)", value: dishes.length, label: l("Dishes") },
            { icon: "book-open", bg: "#E3F0E4", color: "var(--success)", value: stories.length, label: l("Stories") },
            { icon: "play", bg: "#FBE3E4", color: "var(--red)", value: vids.length, label: l("Videos") },
            { icon: "party-popper", bg: "#FCEFD6", color: "var(--star)", value: festivals.length, label: l("Festivals") },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "13px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", boxShadow: "var(--shadow-sm)", padding: "16px 18px" }}>
              <span style={{ width: "42px", height: "42px", borderRadius: "12px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={s.icon} size={20} color={s.color} /></span>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "3px" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* Top Experiences */}
      <Section label="Discover" title={`${l("Top Experiences")}`}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
          {([
            { title: l("Signature Dishes"), sub: city.famous.slice(0, 2).join(", "), img: dishes[0]?.image || city.image, on: () => go("dish", dishes[0]?.name || city.famous[0]) },
            { title: l("Explore Local Street Food"), sub: l(city.name), img: (dishes.find((d) => d.category === "Street Food") || dishes[1] || dishes[0])?.image || city.image, on: () => go("experience", "Street Food") },
            { title: l("Historic Restaurants to Visit"), sub: l(city.name), img: rests[0]?.image || city.image, on: () => go("restaurant", rests[0]?.name || "") },
            { title: l("Food Markets & Local Flavours"), sub: l(city.name), img: dishes[2]?.image || dishes[0]?.image || city.image, on: () => go("stories", "All") },
          ]).map((e, i) => <ExperienceTile key={i} {...e} />)}
        </div>
      </Section>

      <Section label="Restaurants" title={`${l("Top restaurants in")} ${l(city.name)}`} action={<Btn variant="outline" size="sm" onClick={() => go("restaurants")}>{l("View all")}</Btn>}><Grid>{rests.map((r) => <RestaurantCard key={r.id} r={r} />)}</Grid></Section>
      <Section label="Signature Dishes" title="What to eat"><Grid>{dishes.slice(0, 6).map((d) => <DishCard key={d.id} d={d} />)}</Grid></Section>

      <Section label="Food Culture" title="The local table">
        <div style={{ background: "var(--text)", borderRadius: "24px", padding: "44px 48px", maxWidth: "980px" }}>
          <p style={{ fontSize: "19px", color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>{cityCulture(city)}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "24px" }}>
            {city.famous.map((f) => <span key={f} style={{ fontSize: "13px", fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.12)", borderRadius: "999px", padding: "7px 15px" }}>{f}</span>)}
          </div>
        </div>
      </Section>

      <Section label="Festivals" title="When the city eats together">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {festivals.map((f) => (
            <div key={f.name} style={{ display: "flex", gap: "16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px 26px", boxShadow: "var(--shadow-sm)" }}>
              <span style={{ width: "46px", height: "46px", borderRadius: "13px", background: "#FBE3E4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="party-popper" size={21} color="var(--red)" />
              </span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text)" }}>{f.name}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--red)", background: "#FBE9EA", borderRadius: "999px", padding: "3px 10px" }}>{l(f.month)}</span>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Off the beaten path" title="Hidden gems & local markets">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {gems.map((g) => (
            <div key={g.name} style={{ display: "flex", gap: "16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px 26px", boxShadow: "var(--shadow-sm)" }}>
              <span style={{ width: "46px", height: "46px", borderRadius: "13px", background: "#FCEFD6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="gem" size={20} color="var(--star)" />
              </span>
              <div>
                <div style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text)", marginBottom: "4px" }}>{g.name}</div>
                <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            </div>
          ))}
          {markets.map((mk) => (
            <div key={mk.name} style={{ display: "flex", gap: "16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px 26px", boxShadow: "var(--shadow-sm)" }}>
              <span style={{ width: "46px", height: "46px", borderRadius: "13px", background: "#E3F0E4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="shopping-bag" size={20} color="var(--success)" />
              </span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text)" }}>{mk.name}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--success)", background: "#E3F0E4", borderRadius: "999px", padding: "3px 10px" }}>{l("Market")}</span>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6 }}>{mk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {stories.length > 0 && <Section label="Stories" title={`${l("Stories from")} ${l(city.name)}`}><Grid>{stories.map((s) => <StoryResultCard key={s.id} s={s} />)}</Grid></Section>}
      <Section label="Watch" title="Videos"><Grid>{vids.map((v) => <VideoCard key={v.id} v={v} />)}</Grid></Section>
      <Section label="Nearby Destinations" title="More cities to taste"><Grid>{nearbyCities(city).map((nc) => <CityCard key={nc.id} c={nc} />)}</Grid></Section>
    </div>
  );
}

/* ── Story / Video / News detail (editorial) ───────────────────── */
export function ArticleDetail({ query, kind }: { query: string; kind: "story" | "video" | "news" }) {
  const go = useGo();
  const { l, storyTitle, storyExcerpt, newsTitle, videoTitle, readTime, date } = useI18n();
  const pool = kind === "news" ? NEWS : kind === "video" ? VIDEOS : STORIES;
  const found =
    kind === "news" ? NEWS.find((n) => n.title.toLowerCase() === query.toLowerCase()) || NEWS.find((n) => n.title.toLowerCase().includes(query.toLowerCase()))
    : kind === "video" ? VIDEOS.find((v) => v.title.toLowerCase() === query.toLowerCase()) || VIDEOS.find((v) => v.title.toLowerCase().includes(query.toLowerCase()))
    : STORIES.find((s) => s.title.toLowerCase() === query.toLowerCase()) || STORIES.find((s) => s.title.toLowerCase().includes(query.toLowerCase()));

  const rawTitle = (found as { title?: string })?.title || query;
  const title = kind === "news" ? newsTitle(rawTitle) : kind === "video" ? videoTitle(rawTitle) : found ? storyTitle(found as (typeof STORIES)[number]) : rawTitle;
  const image = (found as { image?: string; thumb?: string })?.image || (found as { thumb?: string })?.thumb || "";
  const meta = kind === "news" ? date((found as { date?: string })?.date || "") : kind === "video" ? (found as { duration?: string })?.duration : readTime((found as { readTime?: string })?.readTime || "");
  const excerpt = kind === "story" && found ? storyExcerpt(found as (typeof STORIES)[number]) : l("An in-depth look from the CIBISWEB editorial desk.");

  const related = (pool as { id: string }[]).filter((x) => (x as { title?: string }).title !== rawTitle).slice(0, 3);

  return (
    <div>
      <Container style={{ maxWidth: "860px", paddingTop: "48px", paddingBottom: "24px" }}>
        <button onClick={() => go("stories", "All")} style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "14px", fontWeight: 600, color: "var(--text-2)", marginBottom: "22px" }}><Icon name="arrow-up-right" size={15} color="var(--text-2)" style={{ transform: "rotate(180deg)" }} />{l("Back to stories")}</button>
        <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "14px" }}>{l(kind)}</div>
        <h1 style={{ fontSize: "46px", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.08, color: "var(--text)", marginBottom: "18px" }}>{title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "14px", color: "var(--text-2)", marginBottom: "28px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="clock" size={14} color="var(--text-2)" />{meta}</span>
          <span>·</span><span>{l("CIBISWEB Editorial")}</span>
        </div>
      </Container>
      {image && (
        <Container style={{ maxWidth: "980px", paddingBottom: "8px" }}>
          <div style={{ borderRadius: "24px", overflow: "hidden", height: "460px", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {kind === "video" && (
              <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.94)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-lg)" }}>
                <Icon name="play" size={32} color="var(--red)" className="fill-current" />
              </span>
            )}
          </div>
        </Container>
      )}
      <Container style={{ maxWidth: "760px", paddingTop: "32px", paddingBottom: "40px" }}>
        <p style={{ fontSize: "20px", color: "var(--text)", lineHeight: 1.7, marginBottom: "24px", fontWeight: 500 }}>{excerpt}</p>
        <p style={{ fontSize: "17px", color: "var(--text-2)", lineHeight: 1.8, marginBottom: "20px" }}>
          {l("Across Italy, food is never just food — it is memory, region and rivalry on a plate. In this piece we trace the people, places and traditions behind it, speaking to the cooks who keep it alive and the eaters who can't imagine life without it.")}
        </p>
        <p style={{ fontSize: "17px", color: "var(--text-2)", lineHeight: 1.8 }}>
          {l("From bustling city markets to quiet family kitchens, the story is the same: respect the ingredients, honour the method, and share generously. That is the spirit CIBISWEB was built to celebrate.")}
        </p>
      </Container>
      <Section label="Keep reading" title="More stories"><Grid>{related.map((x, i) => {
        if (kind === "news") return <NewsCard key={i} n={x as (typeof NEWS)[number]} />;
        if (kind === "video") return <VideoCard key={i} v={x as (typeof VIDEOS)[number]} />;
        return <StoryResultCard key={i} s={x as (typeof STORIES)[number]} />;
      })}</Grid></Section>
    </div>
  );
}

/* Simple listing pages reused for nav (restaurants / stories) */
export function RestaurantListing() {
  return <Section label="Restaurants" title="All restaurants"><Grid>{RESTAURANTS.map((r) => <RestaurantCard key={r.id} r={r} />)}</Grid></Section>;
}
export function StoriesListing({ query }: { query: string }) {
  const tab = query || "All";
  if (tab === "Videos") {
    return <Section label="Watch" title="Videos"><Grid>{VIDEOS.map((v) => <VideoCard key={v.id} v={v} />)}</Grid></Section>;
  }
  if (tab === "News") {
    return <Section label="Newsroom" title="Food news"><Grid>{NEWS.map((n) => <NewsCard key={n.id} n={n} />)}</Grid></Section>;
  }
  const list = tab === "All" ? STORIES : STORIES.filter((s) => (tab === "Fun" ? s.category === "Fun" : s.category === "Article"));
  return <Section label="Food Stories" title={tab === "All" ? "All stories" : tab}><Grid>{list.map((s) => <StoryResultCard key={s.id} s={s} />)}</Grid></Section>;
}

/* ── Experience page (reusable layout for every Hero chip) ─────── */
export function ExperiencePage({ query }: { query: string }) {
  const go = useGo();
  const { l, expTagline, expIntro } = useI18n();
  const { meta, restaurants, dishes, stories, videos } = experienceContent(query);
  if (meta?.match.cityId) return <CityPage query={cityById(meta.match.cityId)?.name || query} />;
  if (!meta) {
    return (
      <Section label="Explore" title={l(query)}>
        <Grid>{DISHES.slice(0, 6).map((d) => <DishCard key={d.id} d={d} />)}</Grid>
      </Section>
    );
  }
  const tagline = expTagline(meta.label) || meta.tagline;
  const intro = expIntro(meta.label, meta.intro);
  return (
    <div>
      {/* Experience hero */}
      <section style={{ padding: "0 0 8px" }}>
        <div style={{ position: "relative", height: "340px", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={meta.image} alt={meta.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(17,17,17,0.78), rgba(17,17,17,0.12) 60%)" }} />
          <Container style={{ maxWidth: "1320px", position: "absolute", left: 0, right: 0, bottom: "36px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#F0A8AC", marginBottom: "12px" }}>
              <Icon name={meta.icon} size={15} color="#F0A8AC" />{l("Experience")}
            </div>
            <h1 style={{ fontSize: "54px", fontWeight: 700, letterSpacing: "-0.035em", color: "#fff", lineHeight: 1.02, marginBottom: "10px" }}>{l(meta.label)}</h1>
            <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.85)", maxWidth: "540px" }}>{tagline}</p>
          </Container>
        </div>
      </section>

      {/* Introduction */}
      <Section label="The experience" title={`${l("Why")} ${l(meta.label)}?`}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "34px 38px", maxWidth: "860px" }}>
          <p style={{ fontSize: "17px", color: "var(--text-2)", lineHeight: 1.7 }}>{intro}</p>
        </div>
      </Section>

      {restaurants.length > 0 && (
        <Section label="Where to go" title="Featured restaurants" action={<Btn variant="outline" size="sm" onClick={() => go("restaurants")}>{l("All restaurants")}</Btn>}>
          <Grid>{restaurants.slice(0, 3).map((r) => <RestaurantCard key={r.id} r={r} />)}</Grid>
        </Section>
      )}
      {dishes.length > 0 && (
        <Section label="What to order" title="Recommended dishes">
          <Grid>{dishes.slice(0, 3).map((d) => <DishCard key={d.id} d={d} />)}</Grid>
        </Section>
      )}
      {dishes.length > 0 && (
        <Section label="Cook it yourself" title="Recipes to try at home">
          <Grid>{dishes.slice(3, 6).length >= 3 ? dishes.slice(3, 6).map((d) => <RecipeCard key={d.id} d={d} />) : dishes.slice(0, 3).map((d) => <RecipeCard key={d.id} d={d} />)}</Grid>
        </Section>
      )}
      {stories.length > 0 && (
        <Section label="Read" title="Stories"><Grid>{stories.map((s) => <StoryResultCard key={s.id} s={s} />)}</Grid></Section>
      )}
      {videos.length > 0 && (
        <Section label="Watch" title="Videos"><Grid>{videos.map((v) => <VideoCard key={v.id} v={v} />)}</Grid></Section>
      )}

      {/* Related experiences */}
      <Section label="Keep exploring" title="Related experiences">
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {meta.related.map((rel) => (
            <button key={rel} onClick={() => go("experience", rel)}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "46px", padding: "0 22px", borderRadius: "999px", fontSize: "15px", fontWeight: 600, color: "var(--text)", background: "var(--card)", boxShadow: "inset 0 0 0 1px var(--border)", transition: "all 200ms ease" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "inset 0 0 0 1.5px var(--red)"; (e.currentTarget as HTMLElement).style.color = "var(--red)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "inset 0 0 0 1px var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}>
              {l(rel)}<Icon name="arrow-right" size={16} />
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ── About page ─────────────────────────────────────────────────── */
const TEAM = [
  { name: "Alessia Bruno", role: "Editor-in-Chief", note: "Former food-desk editor who has eaten her way through all twenty regions." },
  { name: "Marco Deluca", role: "Head of Video", note: "Documents Italy's kitchens one slow pan of simmering ragù at a time." },
  { name: "Chiara Fontana", role: "Restaurant Editor", note: "Keeps the reviews honest and the reservations impossible to get." },
  { name: "Tommaso Ricci", role: "Recipe Editor", note: "Tests every recipe three times — once with his nonna watching." },
];
export function AboutPage() {
  const go = useGo();
  const { l } = useI18n();
  return (
    <div>
      <Container style={{ maxWidth: "860px", paddingTop: "72px", paddingBottom: "8px", textAlign: "center" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "14px" }}>{l("About CIBISWEB")}</div>
        <h1 style={{ fontSize: "54px", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.05, color: "var(--text)", marginBottom: "20px" }}>
          {l("Italy, explained through")} <span style={{ color: "var(--red)" }}>{l("food")}</span>
        </h1>
        <p style={{ fontSize: "19px", color: "var(--text-2)", lineHeight: 1.65, maxWidth: "620px", margin: "0 auto" }}>
          {l("CIBISWEB is a digital food ecosystem — a place where restaurants, dishes, recipes, stories and cities connect into one map of Italian culinary culture.")}
        </p>
      </Container>
      <Section label="Mission" title="What drives us">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {[
            { icon: "utensils", title: "Mission", text: "Make Italy's food culture discoverable — every dish, every story, every table — with the depth it deserves." },
            { icon: "sparkles", title: "Vision", text: "Become the way the world explores Italian food: not a directory, but a living atlas of taste." },
            { icon: "heart", title: "Values", text: "Authenticity over hype, regions over clichés, and respect for the people who cook." },
          ].map((b) => (
            <div key={b.title} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "30px 32px", boxShadow: "var(--shadow-sm)" }}>
              <span style={{ width: "46px", height: "46px", borderRadius: "13px", background: "#FBE3E4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                <Icon name={b.icon} size={21} color="var(--red)" />
              </span>
              <div style={{ fontSize: "19px", fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text)", marginBottom: "8px" }}>{l(b.title)}</div>
              <p style={{ fontSize: "15px", color: "var(--text-2)", lineHeight: 1.65 }}>{l(b.text)}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section label="Editorial team" title="The people behind the plates">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
          {TEAM.map((t, i) => (
            <div key={t.name} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "26px 28px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: ["#FBE9EA", "#FCEFD6", "#E3F0E4", "#F5F3EE"][i % 4], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 700, color: "var(--text)", marginBottom: "16px" }}>
                {t.name.split(" ").map((w) => w[0]).join("")}
              </div>
              <div style={{ fontSize: "17px", fontWeight: 600, color: "var(--text)" }}>{t.name}</div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--red)", marginBottom: "10px" }}>{l(t.role)}</div>
              <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6 }}>{l(t.note)}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section label="Join the journey" title="Start exploring">
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Btn variant="primary" size="lg" iconRight="arrow-right" onClick={() => go("restaurants")}>{l("Browse restaurants")}</Btn>
          <Btn variant="outline" size="lg" onClick={() => go("stories", "All")}>{l("Read our stories")}</Btn>
        </div>
      </Section>
    </div>
  );
}

/* ── Contact page ───────────────────────────────────────────────── */
export function ContactPage() {
  const { l } = useI18n();
  const [sent, setSent] = useState(false);
  return (
    <div>
      <Container style={{ maxWidth: "860px", paddingTop: "72px", paddingBottom: "8px", textAlign: "center" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "14px" }}>{l("Contact")}</div>
        <h1 style={{ fontSize: "54px", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.05, color: "var(--text)", marginBottom: "20px" }}>{l("Say")} <span style={{ color: "var(--red)" }}>{l("ciao")}</span></h1>
        <p style={{ fontSize: "19px", color: "var(--text-2)", lineHeight: 1.65, maxWidth: "560px", margin: "0 auto" }}>
          {l("A restaurant to suggest, a story to pitch, or a correction from a proud nonna — we read everything.")}
        </p>
      </Container>
      <Section label="Write to us" title="Get in touch">
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px", alignItems: "start" }}>
          {/* Form */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "32px 34px", boxShadow: "var(--shadow-sm)" }}>
            {!sent ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "200px", display: "flex", alignItems: "center", gap: "10px", background: "var(--bg)", borderRadius: "14px", border: "1px solid var(--border)", padding: "0 16px", height: "52px" }}>
                    <Icon name="user" size={17} color="var(--text-2)" />
                    <input placeholder={l("Your name")} aria-label="Your name" style={{ flex: 1, fontSize: "15px", color: "var(--text)" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: "200px", display: "flex", alignItems: "center", gap: "10px", background: "var(--bg)", borderRadius: "14px", border: "1px solid var(--border)", padding: "0 16px", height: "52px" }}>
                    <Icon name="mail" size={17} color="var(--text-2)" />
                    <input type="email" placeholder={l("Email address")} aria-label="Email address" style={{ flex: 1, fontSize: "15px", color: "var(--text)" }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", background: "var(--bg)", borderRadius: "14px", border: "1px solid var(--border)", padding: "14px 16px" }}>
                  <Icon name="book-open" size={17} color="var(--text-2)" style={{ marginTop: "2px" }} />
                  <textarea placeholder={l("Your message…")} aria-label="Your message" rows={5} style={{ flex: 1, fontSize: "15px", color: "var(--text)", background: "none", border: "none", outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }} />
                </div>
                <div><Btn variant="primary" size="lg" iconRight="arrow-right" onClick={() => setSent(true)}>{l("Send message")}</Btn></div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "26px 10px" }}>
                <span style={{ display: "inline-flex", width: "62px", height: "62px", borderRadius: "50%", background: "#E3F0E4", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                  <Icon name="check-circle" size={30} color="var(--success)" />
                </span>
                <h3 style={{ fontSize: "22px", fontWeight: 600, color: "var(--text)", marginBottom: "8px" }}>{l("Message sent!")}</h3>
                <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6 }}>{l("Grazie — the editorial desk will get back to you within two working days.")}</p>
              </div>
            )}
          </div>
          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { icon: "map-pin", title: "Location", lines: ["Via del Gusto 12", "20121 Milano, Italy"] },
              { icon: "mail", title: "Email", lines: ["ciao@cibisweb.it", "press@cibisweb.it"] },
              { icon: "phone", title: "Phone", lines: ["+39 02 0000 0000", "Mon–Fri, 9:00–18:00 CET"] },
            ].map((c) => (
              <div key={c.title} style={{ display: "flex", gap: "16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "20px 22px" }}>
                <span style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#FBE3E4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={c.icon} size={19} color="var(--red)" />
                </span>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "3px" }}>{l(c.title)}</div>
                  {c.lines.map((ln) => <div key={ln} style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.55 }}>{l(ln)}</div>)}
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: "10px" }}>
              {["instagram", "facebook", "twitter", "youtube"].map((s) => (
                <a key={s} href="#" aria-label={s}
                  style={{ width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--card)", color: "var(--text)", border: "1px solid var(--border)", transition: "all 200ms ease" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--red)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--card)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}>
                  <Icon name={s} size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
