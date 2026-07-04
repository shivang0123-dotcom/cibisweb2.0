"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Icon } from "./icons";
import { Container, Btn, Stars, useGo } from "./ui";
import { DishCard, RestaurantCard, StoryResultCard, VideoCard, NewsCard, RecipeCard } from "./ResultCards";
import {
  DISHES, RESTAURANTS, STORIES, VIDEOS, NEWS,
  cityById, dishByName, restaurantByName, cityByName, cityExtra,
} from "./data";
import {
  servedCount, restaurantsServing, relatedDishes, dishStories, dishVideos,
  cityRestaurants, cityDishes, cityStories, cityVideos,
  similarRestaurants, experienceContent,
} from "./search-utils";

/* Shared section shell */
function Section({ label, title, children, action }: { label?: string; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section style={{ padding: "40px 0" }}>
      <Container style={{ maxWidth: "1320px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", gap: "20px", flexWrap: "wrap" }}>
          <div>
            {label && <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "10px" }}>{label}</div>}
            <h2 style={{ fontSize: "32px", fontWeight: 600, letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1.1 }}>{title}</h2>
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

/* ── Dish page ──────────────────────────────────────────────────── */
export function DishPage({ query }: { query: string }) {
  const go = useGo();
  const dish = dishByName(query) || DISHES.find((d) => d.name.toLowerCase().includes(query.toLowerCase())) || DISHES[0];
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, active: false });
  const city = cityById(dish.cityId);
  const rests = restaurantsServing(dish), stories = dishStories(dish), vids = dishVideos(dish), related = relatedDishes(dish);

  const onMove = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTilt({ rx: -((e.clientY - r.top) / r.height - 0.5) * 12, ry: ((e.clientX - r.left) / r.width - 0.5) * 16, active: true });
  };

  return (
    <div>
      <section style={{ padding: "40px 0 24px" }}>
        <Container style={{ maxWidth: "1320px" }}>
          <Breadcrumb trail={[{ label: "Home", go: () => go("home") }, { label: city?.name || "Italy", go: () => go("city", city?.name) }, { label: dish.name }]} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "56px", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "14px" }}>{dish.category}</div>
              <h1 style={{ fontSize: "58px", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.02, color: "var(--text)", marginBottom: "18px" }}>{dish.name}</h1>
              <p style={{ fontSize: "18px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "26px", maxWidth: "460px" }}>{dish.description}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "22px", flexWrap: "wrap", marginBottom: "18px" }}>
                <Stars rating={dish.rating} />
                <Meta icon="store" text={`${servedCount(dish)} restaurants`} />
                <Meta icon="map-pin" text={city?.name || ""} />
                {dish.vegetarian && <Meta icon="leaf" text="Vegetarian" />}
              </div>
              {/* Quick information strip */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "30px" }}>
                {[
                  { icon: "flame", label: "Difficulty", value: dish.difficulty },
                  { icon: "timer", label: "Prep", value: `${dish.prepMinutes} min` },
                  { icon: "clock", label: "Cook", value: `${dish.cookMinutes} min` },
                  { icon: "users", label: "Serves", value: String(dish.servings) },
                ].map((q) => (
                  <div key={q.label} style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "10px 16px" }}>
                    <Icon name={q.icon} size={17} color="var(--red)" />
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-2)" }}>{q.label}</div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>{q.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Btn variant="primary" size="lg" iconRight="arrow-right" onClick={() => document.getElementById("recipe")?.scrollIntoView({ behavior: "smooth" })}>View Recipe</Btn>
                <Btn variant="outline" size="lg" onClick={() => document.getElementById("serving")?.scrollIntoView({ behavior: "smooth" })}>Where to eat</Btn>
              </div>
            </div>
            <div onMouseMove={onMove} onMouseLeave={() => setTilt({ rx: 0, ry: 0, active: false })}
              style={{ perspective: "1100px", display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", width: "440px", height: "440px", transformStyle: "preserve-3d", transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, transition: tilt.active ? "transform 120ms ease-out" : "transform 500ms cubic-bezier(.2,.8,.2,1)", animation: "floaty 6s ease-in-out infinite" }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 50% 46%, #F3ECE0 0%, rgba(243,236,224,0) 68%)", transform: "translateZ(-80px) scale(1.05)" }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dish.image} alt={dish.name} style={{ position: "absolute", inset: "6%", width: "88%", height: "88%", objectFit: "cover", borderRadius: "50%", boxShadow: "var(--shadow-float)", transform: "translateZ(0)" }} />
                <div style={{ position: "absolute", top: "0", right: "0", background: "var(--card)", borderRadius: "16px", boxShadow: "var(--shadow-lg)", padding: "12px 16px", transform: "translateZ(80px)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#FCEFD6", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="star" size={17} color="var(--star)" className="rating-star" /></span>
                  <div><div style={{ fontSize: "15px", fontWeight: 600 }}>{dish.rating.toFixed(1)}</div><div style={{ fontSize: "12px", color: "var(--text-2)" }}>rating</div></div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {stories.length > 0 && <Section label="Story" title={`Stories about ${dish.name}`}><Grid>{stories.map((s) => <StoryResultCard key={s.id} s={s} />)}</Grid></Section>}

      <Section label="History" title="Where it comes from">
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "36px 40px", maxWidth: "820px" }}>
          <p style={{ fontSize: "17px", color: "var(--text-2)", lineHeight: 1.7 }}>{dish.history}</p>
        </div>
      </Section>

      <div id="recipe" />
      <Section label="Recipe" title="How it's made">
        <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.2fr", gap: "24px" }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "28px 30px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "16px" }}>Ingredients</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {dish.ingredients.map((ing) => (
                <div key={ing} style={{ display: "flex", alignItems: "center", gap: "11px", fontSize: "15px", color: "var(--text)" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--red)", flexShrink: 0 }} />{ing}
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "28px 30px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "16px" }}>Method</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {dish.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "14px" }}>
                  <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#FBE9EA", color: "var(--red)", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: "15px", color: "var(--text)", lineHeight: 1.55, paddingTop: "3px" }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section label="Good to know" title="Nutrition & allergens">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "28px 30px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "18px" }}>Per serving (approx.)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {[
                ["Calories", `${dish.nutrition.calories}`, "kcal"],
                ["Protein", `${dish.nutrition.protein}`, "g"],
                ["Carbs", `${dish.nutrition.carbs}`, "g"],
                ["Fat", `${dish.nutrition.fat}`, "g"],
                ["Fiber", `${dish.nutrition.fiber}`, "g"],
                ["Sugar", `${dish.nutrition.sugar}`, "g"],
              ].map(([label, val, unit]) => (
                <div key={label}>
                  <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)" }}>{val}<span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)" }}> {unit}</span></div>
                  <div style={{ fontSize: "12px", color: "var(--text-2)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "28px 30px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "18px" }}>Allergens</div>
            {dish.allergens.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {dish.allergens.map((a) => (
                  <span key={a} style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "13px", fontWeight: 600, color: "var(--text)", background: "#FCEFD6", borderRadius: "999px", padding: "8px 14px" }}>
                    <Icon name="alert-triangle" size={14} color="var(--star)" />{a}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "15px", color: "var(--text-2)" }}>No major allergens in the traditional recipe.</div>
            )}
            <div style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "16px", lineHeight: 1.5 }}>Always confirm with the kitchen — regional variations can change ingredients.</div>
          </div>
        </div>
      </Section>

      <Section label="Pairing" title="What to drink">
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "30px 34px", display: "flex", alignItems: "center", gap: "22px", maxWidth: "720px", flexWrap: "wrap" }}>
          <span style={{ width: "58px", height: "58px", borderRadius: "16px", background: "#FBE3E4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="wine" size={26} color="var(--red)" />
          </span>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--red)", marginBottom: "4px" }}>{dish.wine.type === "None" ? "No pairing" : `${dish.wine.type} wine`}</div>
            <div style={{ fontSize: "21px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)", marginBottom: "6px" }}>{dish.wine.name}</div>
            <div style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.55 }}>{dish.wine.note}</div>
          </div>
        </div>
      </Section>

      <Section label="Did you know?" title="Fun facts">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
          {dish.funFacts.map((f, i) => (
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
      {rests.length > 0 && <Section label="Where to eat" title="Restaurants serving it" action={<Btn variant="outline" size="sm" onClick={() => go("restaurants")}>All restaurants</Btn>}><Grid>{rests.map((r) => <RestaurantCard key={r.id} r={r} />)}</Grid></Section>}
      {vids.length > 0 && <Section label="Watch" title="Videos"><Grid>{vids.map((v) => <VideoCard key={v.id} v={v} />)}</Grid></Section>}
      {related.length > 0 && <Section label="Discover" title="Related dishes"><Grid>{related.map((d) => <DishCard key={d.id} d={d} />)}</Grid></Section>}
    </div>
  );
}
function Meta({ icon, text }: { icon: string; text: string }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "15px", fontWeight: 600, color: "var(--text)" }}><Icon name={icon} size={16} color="var(--text-2)" />{text}</span>;
}

/* ── Restaurant page ────────────────────────────────────────────── */
export function RestaurantPage({ query }: { query: string }) {
  const go = useGo();
  const r = restaurantByName(query) || RESTAURANTS.find((x) => x.name.toLowerCase().includes(query.toLowerCase())) || RESTAURANTS[0];
  const city = cityById(r.cityId);
  const menu = r.signatureDishes.map((n) => dishByName(n)).filter(Boolean) as NonNullable<ReturnType<typeof dishByName>>[];
  const similar = similarRestaurants(r);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [reserved, setReserved] = useState(false);

  return (
    <div>
      <section style={{ padding: "0 0 24px" }}>
        <div style={{ position: "relative", height: "380px", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={r.image} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(17,17,17,0.78), rgba(17,17,17,0.1) 60%)" }} />
          <Container style={{ maxWidth: "1320px", position: "absolute", left: 0, right: 0, bottom: "32px" }}>
            {r.michelin > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#fff", background: "var(--red)", borderRadius: "999px", padding: "6px 13px", marginBottom: "14px" }}><Icon name="award" size={14} color="#fff" />{r.michelin} Michelin Stars</span>}
            <h1 style={{ fontSize: "54px", fontWeight: 700, letterSpacing: "-0.035em", color: "#fff", lineHeight: 1.02, marginBottom: "12px" }}>{r.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", color: "#fff" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="star" size={16} color="var(--star)" className="rating-star" /><strong>{r.rating.toFixed(1)}</strong></span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", opacity: 0.9 }}><Icon name="map-pin" size={16} color="#fff" />{city?.name}, {city?.region}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", opacity: 0.9 }}><Icon name="utensils" size={16} color="#fff" />{r.cuisine}</span>
              <span style={{ opacity: 0.9 }}>{"€".repeat(r.price)}</span>
              {r.openNow && <span style={{ fontSize: "12px", fontWeight: 600, background: "var(--success)", borderRadius: "999px", padding: "4px 11px" }}>Open Now</span>}
            </div>
          </Container>
        </div>
      </section>

      <Section label="Overview" title="About" action={<Btn variant="primary" size="md" icon="calendar-check" onClick={() => { setReserved(false); setReserveOpen(true); }}>Reserve a table</Btn>}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "34px 38px", maxWidth: "860px" }}>
          <p style={{ fontSize: "17px", color: "var(--text-2)", lineHeight: 1.7 }}>{r.blurb} {r.story}</p>
        </div>
      </Section>

      <Section label="Plan your visit" title="Hours, chef & location">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {/* Opening hours */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "26px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <span style={{ width: "38px", height: "38px", borderRadius: "11px", background: "#E3F0E4", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="clock" size={18} color="var(--success)" /></span>
              <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>Opening hours</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {r.hours.map((h) => (
                <div key={h.days} style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "14px" }}>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{h.days}</span>
                  <span style={{ color: h.time === "Closed" ? "var(--red)" : "var(--text-2)", textAlign: "right" }}>{h.time}</span>
                </div>
              ))}
            </div>
            {r.openNow && <div style={{ marginTop: "16px", display: "inline-flex", fontSize: "12px", fontWeight: 600, color: "#fff", background: "var(--success)", borderRadius: "999px", padding: "5px 12px" }}>Open now</div>}
          </div>
          {/* Chef */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "26px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <span style={{ width: "38px", height: "38px", borderRadius: "11px", background: "#FBE3E4", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="chef-hat" size={18} color="var(--red)" /></span>
              <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>In the kitchen</span>
            </div>
            <div style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text)" }}>{r.chef.name}</div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--red)", marginBottom: "10px" }}>{r.chef.title}</div>
            <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6 }}>{r.chef.bio}</p>
          </div>
          {/* Location */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "26px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <span style={{ width: "38px", height: "38px", borderRadius: "11px", background: "#FCEFD6", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="navigation" size={18} color="var(--star)" /></span>
              <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>Location</span>
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>{r.address}</div>
            <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "16px" }}>{city?.name}, {city?.region} — in the heart of the {city?.name === "Venice" ? "lagoon city" : "historic centre"}.</p>
            <button onClick={() => go("city", city?.name || "")}
              style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "14px", fontWeight: 600, color: "var(--red)" }}>
              Explore {city?.name} <Icon name="arrow-right" size={15} />
            </button>
          </div>
        </div>
      </Section>

      {menu.length > 0 && <Section label="Menu" title="Signature dishes"><Grid>{menu.map((d) => <DishCard key={d.id} d={d} />)}</Grid></Section>}

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
            <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "26px 28px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", gap: "3px", marginBottom: "14px" }}>{Array.from({ length: rev.rating }).map((_, k) => <Icon key={k} name="star" size={16} color="var(--star)" className="rating-star" />)}</div>
              <p style={{ fontSize: "15px", color: "var(--text)", lineHeight: 1.6, marginBottom: "18px" }}>“{rev.text}”</p>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-2)" }}>{rev.name}</div>
            </div>
          ))}
        </div>
      </Section>

      {similar.length > 0 && (
        <Section label="Keep exploring" title="Similar restaurants">
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
                  <h3 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)" }}>Reserve a table</h3>
                  <button aria-label="Close" onClick={() => setReserveOpen(false)} style={{ display: "flex", color: "var(--text-2)" }}><Icon name="x" size={20} /></button>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-2)", marginBottom: "24px" }}>{r.name} · {city?.name}</p>
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
                <Btn variant="primary" size="lg" style={{ width: "100%" }} onClick={() => setReserved(true)}>Confirm reservation</Btn>
                <p style={{ fontSize: "12px", color: "var(--text-2)", textAlign: "center", marginTop: "14px" }}>Demo flow — no real booking is made.</p>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <span style={{ display: "inline-flex", width: "62px", height: "62px", borderRadius: "50%", background: "#E3F0E4", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                  <Icon name="check-circle" size={30} color="var(--success)" />
                </span>
                <h3 style={{ fontSize: "22px", fontWeight: 600, color: "var(--text)", marginBottom: "8px" }}>Table reserved!</h3>
                <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "24px" }}>{r.name} is expecting you. A confirmation would arrive by email in the full product.</p>
                <Btn variant="dark" size="md" style={{ width: "100%" }} onClick={() => setReserveOpen(false)}>Done</Btn>
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
  const extra = cityExtra(city.id);
  const go = useGo();

  return (
    <div>
      <section style={{ padding: "0 0 24px" }}>
        <div style={{ position: "relative", height: "420px", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={city.image} alt={city.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(17,17,17,0.8), rgba(17,17,17,0.15) 60%)" }} />
          <Container style={{ maxWidth: "1320px", position: "absolute", left: 0, right: 0, bottom: "40px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#F0A8AC", marginBottom: "12px" }}>{city.region}</div>
            <h1 style={{ fontSize: "64px", fontWeight: 700, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1, marginBottom: "14px" }}>{city.name}</h1>
            <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.85)", maxWidth: "560px", lineHeight: 1.6 }}>{city.blurb}</p>
          </Container>
        </div>
      </section>

      <Section label="Restaurants" title={`Top restaurants in ${city.name}`} action={<Btn variant="outline" size="sm" onClick={() => go("restaurants")}>View all</Btn>}><Grid>{rests.map((r) => <RestaurantCard key={r.id} r={r} />)}</Grid></Section>
      <Section label="Signature Dishes" title="What to eat"><Grid>{dishes.slice(0, 6).map((d) => <DishCard key={d.id} d={d} />)}</Grid></Section>

      <Section label="Food Culture" title="The local table">
        <div style={{ background: "var(--text)", borderRadius: "24px", padding: "44px 48px", maxWidth: "980px" }}>
          <p style={{ fontSize: "19px", color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>{city.culture}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "24px" }}>
            {city.famous.map((f) => <span key={f} style={{ fontSize: "13px", fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.12)", borderRadius: "999px", padding: "7px 15px" }}>{f}</span>)}
          </div>
        </div>
      </Section>

      <Section label="Festivals" title="When the city eats together">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {extra.festivals.map((f) => (
            <div key={f.name} style={{ display: "flex", gap: "16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px 26px", boxShadow: "var(--shadow-sm)" }}>
              <span style={{ width: "46px", height: "46px", borderRadius: "13px", background: "#FBE3E4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="party-popper" size={21} color="var(--red)" />
              </span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text)" }}>{f.name}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--red)", background: "#FBE9EA", borderRadius: "999px", padding: "3px 10px" }}>{f.month}</span>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Off the beaten path" title="Hidden gems & local markets">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {extra.hiddenGems.map((g) => (
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
          {extra.markets.map((mk) => (
            <div key={mk.name} style={{ display: "flex", gap: "16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px 26px", boxShadow: "var(--shadow-sm)" }}>
              <span style={{ width: "46px", height: "46px", borderRadius: "13px", background: "#E3F0E4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="shopping-bag" size={20} color="var(--success)" />
              </span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text)" }}>{mk.name}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--success)", background: "#E3F0E4", borderRadius: "999px", padding: "3px 10px" }}>Market</span>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6 }}>{mk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {stories.length > 0 && <Section label="Stories" title={`Stories from ${city.name}`}><Grid>{stories.map((s) => <StoryResultCard key={s.id} s={s} />)}</Grid></Section>}
      <Section label="Watch" title="Videos"><Grid>{vids.map((v) => <VideoCard key={v.id} v={v} />)}</Grid></Section>
    </div>
  );
}

/* ── Story / Video / News detail (editorial) ───────────────────── */
export function ArticleDetail({ query, kind }: { query: string; kind: "story" | "video" | "news" }) {
  const go = useGo();
  const pool = kind === "news" ? NEWS : kind === "video" ? VIDEOS : STORIES;
  const found =
    kind === "news" ? NEWS.find((n) => n.title.toLowerCase() === query.toLowerCase()) || NEWS.find((n) => n.title.toLowerCase().includes(query.toLowerCase()))
    : kind === "video" ? VIDEOS.find((v) => v.title.toLowerCase() === query.toLowerCase()) || VIDEOS.find((v) => v.title.toLowerCase().includes(query.toLowerCase()))
    : STORIES.find((s) => s.title.toLowerCase() === query.toLowerCase()) || STORIES.find((s) => s.title.toLowerCase().includes(query.toLowerCase()));

  const title = (found as { title?: string })?.title || query;
  const image = (found as { image?: string; thumb?: string })?.image || (found as { thumb?: string })?.thumb || "";
  const meta = kind === "news" ? (found as { date?: string })?.date : kind === "video" ? (found as { duration?: string })?.duration : (found as { readTime?: string })?.readTime;
  const excerpt = (found as { excerpt?: string })?.excerpt || "An in-depth look from the CIBISWEB editorial desk.";

  const related = (pool as { id: string }[]).filter((x) => (x as { title?: string }).title !== title).slice(0, 3);

  return (
    <div>
      <Container style={{ maxWidth: "860px", paddingTop: "48px", paddingBottom: "24px" }}>
        <button onClick={() => go("stories", "All")} style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "14px", fontWeight: 600, color: "var(--text-2)", marginBottom: "22px" }}><Icon name="arrow-up-right" size={15} color="var(--text-2)" style={{ transform: "rotate(180deg)" }} />Back to stories</button>
        <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "14px" }}>{kind}</div>
        <h1 style={{ fontSize: "46px", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.08, color: "var(--text)", marginBottom: "18px" }}>{title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "14px", color: "var(--text-2)", marginBottom: "28px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="clock" size={14} color="var(--text-2)" />{meta}</span>
          <span>·</span><span>CIBISWEB Editorial</span>
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
          Across Italy, food is never just food — it is memory, region and rivalry on a plate. In this piece we trace the people, places and traditions behind it, speaking to the cooks who keep it alive and the eaters who can&apos;t imagine life without it.
        </p>
        <p style={{ fontSize: "17px", color: "var(--text-2)", lineHeight: 1.8 }}>
          From bustling city markets to quiet family kitchens, the story is the same: respect the ingredients, honour the method, and share generously. That is the spirit CIBISWEB was built to celebrate.
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
  const { meta, restaurants, dishes, stories, videos } = experienceContent(query);
  if (meta?.match.cityId) return <CityPage query={cityById(meta.match.cityId)?.name || query} />;
  if (!meta) {
    return (
      <Section label="Explore" title={query}>
        <Grid>{DISHES.slice(0, 6).map((d) => <DishCard key={d.id} d={d} />)}</Grid>
      </Section>
    );
  }
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
              <Icon name={meta.icon} size={15} color="#F0A8AC" />Experience
            </div>
            <h1 style={{ fontSize: "54px", fontWeight: 700, letterSpacing: "-0.035em", color: "#fff", lineHeight: 1.02, marginBottom: "10px" }}>{meta.label}</h1>
            <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.85)", maxWidth: "540px" }}>{meta.tagline}</p>
          </Container>
        </div>
      </section>

      {/* Introduction */}
      <Section label="The experience" title={`Why ${meta.label.toLowerCase()}?`}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "34px 38px", maxWidth: "860px" }}>
          <p style={{ fontSize: "17px", color: "var(--text-2)", lineHeight: 1.7 }}>{meta.intro}</p>
        </div>
      </Section>

      {restaurants.length > 0 && (
        <Section label="Where to go" title="Featured restaurants" action={<Btn variant="outline" size="sm" onClick={() => go("restaurants")}>All restaurants</Btn>}>
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
              {rel}<Icon name="arrow-right" size={16} />
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
  return (
    <div>
      <Container style={{ maxWidth: "860px", paddingTop: "72px", paddingBottom: "8px", textAlign: "center" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "14px" }}>About CIBISWEB</div>
        <h1 style={{ fontSize: "54px", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.05, color: "var(--text)", marginBottom: "20px" }}>
          Italy, explained through <span style={{ color: "var(--red)" }}>food</span>
        </h1>
        <p style={{ fontSize: "19px", color: "var(--text-2)", lineHeight: 1.65, maxWidth: "620px", margin: "0 auto" }}>
          CIBISWEB is a digital food ecosystem — a place where restaurants, dishes, recipes, stories and cities connect into one map of Italian culinary culture.
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
              <div style={{ fontSize: "19px", fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text)", marginBottom: "8px" }}>{b.title}</div>
              <p style={{ fontSize: "15px", color: "var(--text-2)", lineHeight: 1.65 }}>{b.text}</p>
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
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--red)", marginBottom: "10px" }}>{t.role}</div>
              <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6 }}>{t.note}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section label="Join the journey" title="Start exploring">
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Btn variant="primary" size="lg" iconRight="arrow-right" onClick={() => go("restaurants")}>Browse restaurants</Btn>
          <Btn variant="outline" size="lg" onClick={() => go("stories", "All")}>Read our stories</Btn>
        </div>
      </Section>
    </div>
  );
}

/* ── Contact page ───────────────────────────────────────────────── */
export function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div>
      <Container style={{ maxWidth: "860px", paddingTop: "72px", paddingBottom: "8px", textAlign: "center" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "14px" }}>Contact</div>
        <h1 style={{ fontSize: "54px", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.05, color: "var(--text)", marginBottom: "20px" }}>Say <span style={{ color: "var(--red)" }}>ciao</span></h1>
        <p style={{ fontSize: "19px", color: "var(--text-2)", lineHeight: 1.65, maxWidth: "560px", margin: "0 auto" }}>
          A restaurant to suggest, a story to pitch, or a correction from a proud nonna — we read everything.
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
                    <input placeholder="Your name" aria-label="Your name" style={{ flex: 1, fontSize: "15px", color: "var(--text)" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: "200px", display: "flex", alignItems: "center", gap: "10px", background: "var(--bg)", borderRadius: "14px", border: "1px solid var(--border)", padding: "0 16px", height: "52px" }}>
                    <Icon name="mail" size={17} color="var(--text-2)" />
                    <input type="email" placeholder="Email address" aria-label="Email address" style={{ flex: 1, fontSize: "15px", color: "var(--text)" }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", background: "var(--bg)", borderRadius: "14px", border: "1px solid var(--border)", padding: "14px 16px" }}>
                  <Icon name="book-open" size={17} color="var(--text-2)" style={{ marginTop: "2px" }} />
                  <textarea placeholder="Your message…" aria-label="Your message" rows={5} style={{ flex: 1, fontSize: "15px", color: "var(--text)", background: "none", border: "none", outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }} />
                </div>
                <div><Btn variant="primary" size="lg" iconRight="arrow-right" onClick={() => setSent(true)}>Send message</Btn></div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "26px 10px" }}>
                <span style={{ display: "inline-flex", width: "62px", height: "62px", borderRadius: "50%", background: "#E3F0E4", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                  <Icon name="check-circle" size={30} color="var(--success)" />
                </span>
                <h3 style={{ fontSize: "22px", fontWeight: 600, color: "var(--text)", marginBottom: "8px" }}>Message sent!</h3>
                <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6 }}>Grazie — the editorial desk will get back to you within two working days.</p>
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
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "3px" }}>{c.title}</div>
                  {c.lines.map((l) => <div key={l} style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.55 }}>{l}</div>)}
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
