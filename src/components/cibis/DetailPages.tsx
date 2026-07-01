"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Icon } from "./icons";
import { Container, Btn, Stars, useGo } from "./ui";
import { DishCard, RestaurantCard, StoryResultCard, VideoCard, NewsCard } from "./ResultCards";
import {
  DISHES, RESTAURANTS, STORIES, VIDEOS, NEWS,
  cityById, dishByName, restaurantByName, cityByName,
} from "./data";
import {
  servedCount, restaurantsServing, relatedDishes, dishStories, dishVideos,
  cityRestaurants, cityDishes, cityStories, cityVideos, primaryEntity,
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
              <div style={{ display: "flex", alignItems: "center", gap: "22px", flexWrap: "wrap", marginBottom: "30px" }}>
                <Stars rating={dish.rating} />
                <Meta icon="store" text={`${servedCount(dish)} restaurants`} />
                <Meta icon="map-pin" text={city?.name || ""} />
                {dish.vegetarian && <Meta icon="leaf" text="Vegetarian" />}
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

      <Section label="Overview" title="About" action={<Btn variant="primary" size="md" icon="calendar-check" onClick={() => alert("Reservation flow — demo")}>Reserve a table</Btn>}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "34px 38px", maxWidth: "860px" }}>
          <p style={{ fontSize: "17px", color: "var(--text-2)", lineHeight: 1.7 }}>{r.blurb} {r.story}</p>
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
    </div>
  );
}

/* ── City page ──────────────────────────────────────────────────── */
export function CityPage({ query }: { query: string }) {
  const c = cityByName(query) || cityById(query) || cityByName(query.split(" ")[0]) || cityRestaurants("rome") && null;
  const city = c || cityByName("Rome")!;
  const rests = cityRestaurants(city.id), dishes = cityDishes(city.id), stories = cityStories(city.id), vids = cityVideos(city.id);
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
  const list = tab === "All" ? STORIES : STORIES.filter((s) => (tab === "Videos" ? s.category === "Video" : tab === "News" ? s.category === "News" : tab === "Fun" ? s.category === "Fun" : s.category === "Article"));
  return <Section label="Food Stories" title={tab === "All" ? "All stories" : tab}><Grid>{list.map((s) => <StoryResultCard key={s.id} s={s} />)}</Grid></Section>;
}
export function ExperiencePage({ query }: { query: string }) {
  // reuse search results semantics via primaryEntity fallback — simple listing
  const entity = primaryEntity(query);
  if (entity?.kind === "city") return <CityPage query={query} />;
  return <Section label="Explore" title={query}><Grid>{DISHES.slice(0, 6).map((d) => <DishCard key={d.id} d={d} />)}</Grid></Section>;
}
