"use client";

import { useState } from "react";
import { Icon } from "./icons";
import { Container, SectionLabel, SectionHead, ActionLink, Btn, Stars, useGo } from "./ui";

/* ── Featured Partner ───────────────────────────────────────────── */
export function FeaturedPartner() {
  const go = useGo();
  return (
    <section style={{ padding: "40px 0" }}>
      <Container style={{ maxWidth: "1320px" }}>
        <div className="reveal" style={{ background: "var(--card)", borderRadius: "24px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1.05fr 0.85fr" }}>
          <div style={{ padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <SectionLabel>Featured Partner</SectionLabel>
            <h3 style={{ fontSize: "34px", fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--text)", marginBottom: "16px" }}>Osteria Francescana</h3>
            <p style={{ fontSize: "16px", color: "var(--text-2)", lineHeight: 1.65, marginBottom: "30px" }}>
              Massimo Bottura&apos;s three-Michelin-star temple in Modena, where tradition and avant-garde meet on every plate. A defining address of modern Italian cuisine.
            </p>
            <div><Btn variant="primary" size="md" iconRight="arrow-right" onClick={() => go("restaurant", "Osteria Francescana")}>View Restaurant</Btn></div>
          </div>
          <div style={{ position: "relative", minHeight: "380px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=900&fit=crop&auto=format" alt="Osteria Francescana"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ padding: "40px 36px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "14px", background: "#FCFBF8", borderLeft: "1px solid var(--border)" }}>
            <InfoBlock icon="award" iconBg="#FCEFD6" iconColor="var(--star)" label="Michelin" value="Three Stars" />
            <InfoBlock icon="map-pin" iconBg="#FBE3E4" iconColor="var(--red)" label="Location" value="Modena, Emilia-Romagna" />
            <InfoBlock icon="calendar-check" iconBg="#E3F0E4" iconColor="var(--success)" label="Reservations" value="Open · Booking advised" />
          </div>
        </div>
      </Container>
    </section>
  );
}

function InfoBlock({ icon, iconBg, iconColor, label, value }: { icon: string; iconBg: string; iconColor: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "var(--card)", borderRadius: "16px", border: "1px solid var(--border)", padding: "16px 18px" }}>
      <span style={{ width: "44px", height: "44px", borderRadius: "12px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={21} color={iconColor} />
      </span>
      <div>
        <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "2px" }}>{label}</div>
        <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>{value}</div>
      </div>
    </div>
  );
}

/* ── Top Restaurants ────────────────────────────────────────────── */
const RESTAURANTS = [
  { name: "Trattoria Mario", location: "Florence, Tuscany", cuisine: "Tuscan", rating: 4.8, image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&auto=format" },
  { name: "La Pergola", location: "Rome, Lazio", cuisine: "Fine Dining", rating: 4.9, image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&auto=format" },
  { name: "L'Antica Pizzeria", location: "Naples, Campania", cuisine: "Pizza", rating: 4.7, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop&auto=format" },
];

function RestaurantCard({ name, location, cuisine, rating, image }: { name: string; location: string; cuisine: string; rating: number; image: string }) {
  const go = useGo();
  const [h, setH] = useState(false);
  const [fav, setFav] = useState(false);
  return (
    <div onClick={() => go("restaurant", name)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ cursor: "pointer", background: "var(--card)", borderRadius: "20px", border: "1px solid var(--border)", overflow: "hidden", boxShadow: h ? "var(--shadow-lg)" : "var(--shadow-sm)", transform: h ? "translateY(-4px)" : "none", transition: "transform 240ms ease, box-shadow 240ms ease" }}>
      <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 400ms ease", transform: h ? "scale(1.04)" : "scale(1)" }} />
        <button onClick={(e) => { e.stopPropagation(); setFav(!fav); }}
          style={{ position: "absolute", top: "14px", right: "14px", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>
          <Icon name="heart" size={19} color={fav ? "var(--red)" : "var(--text-2)"} className={fav ? "fill-current" : ""} />
        </button>
      </div>
      <div style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.2 }}>{name}</h3>
          <Stars rating={rating} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--text-2)", fontSize: "14px", marginBottom: "14px" }}>
          <Icon name="map-pin" size={15} color="var(--text-2)" />{location}
        </div>
        <span style={{ display: "inline-block", fontSize: "12px", fontWeight: 600, color: "var(--red)", background: "#FBE9EA", borderRadius: "999px", padding: "5px 13px" }}>{cuisine}</span>
      </div>
    </div>
  );
}

export function TopRestaurants() {
  const go = useGo();
  return (
    <section style={{ padding: "56px 0" }}>
      <Container style={{ maxWidth: "1320px" }}>
        <div className="reveal">
          <SectionHead label="Top Restaurants" title="Top Restaurants" action={<ActionLink onClick={() => go("restaurants")}>View all restaurants</ActionLink>} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {RESTAURANTS.map((r) => <RestaurantCard key={r.name} {...r} />)}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── Featured Story ─────────────────────────────────────────────── */
export function FeaturedStory() {
  const go = useGo();
  return (
    <section style={{ padding: "56px 0" }}>
      <Container style={{ maxWidth: "1320px" }}>
        <div className="reveal" style={{ background: "var(--text)", borderRadius: "24px", overflow: "hidden", display: "grid", gridTemplateColumns: "1.1fr 1fr", minHeight: "420px" }}>
          <div style={{ padding: "56px 52px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#F0A8AC" }}>Featured Story</span>
              <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text)", background: "var(--star)", borderRadius: "999px", padding: "4px 11px" }}>Sponsored</span>
            </div>
            <h2 style={{ fontSize: "42px", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.08, color: "#fff", marginBottom: "20px" }}>The Art of Handmade Pasta</h2>
            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.66)", lineHeight: 1.65, marginBottom: "34px", maxWidth: "460px" }}>
              Inside the workshops of Bologna&apos;s last sfogline, where flour, eggs and decades of muscle memory become tortellini folded entirely by hand.
            </p>
            <div><Btn variant="primary" size="lg" iconRight="arrow-right" onClick={() => go("story", "The Art of Handmade Pasta")}>Read the Story</Btn></div>
          </div>
          <div style={{ position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1556760544-74068565f05c?w=900&h=900&fit=crop&auto=format" alt="Handmade pasta"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── Food Stories ───────────────────────────────────────────────── */
const STORY_TABS = ["All", "Articles", "Videos", "News", "Fun"];
const STORIES = [
  { type: "Article", badge: "#B3262E", image: "https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=800&h=600&fit=crop&auto=format", title: "Why Carbonara Has No Cream", description: "The Roman classic that sparks endless debate — and the four ingredients that are truly non-negotiable.", date: "Jun 18, 2026", read: "6 min read", icon: null as string | null },
  { type: "Video", badge: "#2E7D32", image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop&auto=format", title: "A Day at the Truffle Market", description: "We follow a third-generation hunter and his dog through the misty hills of Alba at dawn.", date: "Jun 14, 2026", read: "8 min watch", icon: "play" as string | null },
  { type: "News", badge: "#F5A623", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&auto=format", title: "Italy's 2026 Michelin Stars Revealed", description: "Eleven new restaurants enter the guide this year, with two fresh three-star addresses in the north.", date: "Jun 10, 2026", read: "4 min read", icon: null as string | null },
];

function StoryCard({ type, badge, image, title, description, date, read, icon }: (typeof STORIES)[number]) {
  const go = useGo();
  const [h, setH] = useState(false);
  const view = type === "Video" ? "video" : type === "News" ? "news" : "story";
  return (
    <div onClick={() => go(view, title)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ cursor: "pointer", background: "var(--card)", borderRadius: "20px", border: "1px solid var(--border)", overflow: "hidden", boxShadow: h ? "var(--shadow-lg)" : "var(--shadow-sm)", transform: h ? "translateY(-4px)" : "none", transition: "transform 240ms ease, box-shadow 240ms ease" }}>
      <div style={{ position: "relative", height: "210px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 400ms ease", transform: h ? "scale(1.04)" : "scale(1)" }} />
        <span style={{ position: "absolute", top: "14px", left: "14px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff", background: badge, borderRadius: "999px", padding: "6px 13px" }}>{type}</span>
        {icon && (
          <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "58px", height: "58px", borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow)" }}>
            <Icon name={icon} size={22} color="var(--red)" className="fill-current" />
          </span>
        )}
      </div>
      <div style={{ padding: "22px 24px 24px" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.25, marginBottom: "10px" }}>{title}</h3>
        <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "18px" }}>{description}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "13px", color: "var(--text-2)", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="calendar" size={14} color="var(--text-2)" />{date}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="clock" size={14} color="var(--text-2)" />{read}</span>
        </div>
      </div>
    </div>
  );
}

export function FoodStories() {
  const [tab, setTab] = useState("All");
  return (
    <section style={{ padding: "56px 0" }}>
      <Container style={{ maxWidth: "1320px" }}>
        <div className="reveal">
          <div style={{ marginBottom: "28px" }}>
            <SectionLabel>Food Stories</SectionLabel>
            <h2 style={{ fontSize: "40px", fontWeight: 600, letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1.1 }}>Food Stories</h2>
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "36px", flexWrap: "wrap" }}>
            {STORY_TABS.map((tabName) => {
              const on = tab === tabName;
              return (
                <button key={tabName} onClick={() => setTab(tabName)}
                  style={{ height: "40px", padding: "0 20px", borderRadius: "999px", fontSize: "14px", fontWeight: 600, color: on ? "#fff" : "var(--text)", background: on ? "var(--red)" : "var(--card)", boxShadow: on ? "none" : "inset 0 0 0 1px var(--border)", transition: "all 200ms ease" }}>
                  {tabName}
                </button>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {STORIES.map((s) => <StoryCard key={s.title} {...s} />)}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── Newsletter ─────────────────────────────────────────────────── */
export function Newsletter() {
  const go = useGo();
  return (
    <section style={{ padding: "56px 0" }}>
      <Container style={{ maxWidth: "1320px" }}>
        <div className="reveal" style={{ background: "var(--card)", borderRadius: "24px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", overflow: "hidden", display: "grid", gridTemplateColumns: "0.85fr 1.15fr" }}>
          <div style={{ position: "relative", minHeight: "300px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&h=800&fit=crop&auto=format" alt="Italian ingredients"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ padding: "52px 56px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#FBE3E4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "22px" }}>
              <Icon name="mail" size={24} color="var(--red)" />
            </span>
            <h2 style={{ fontSize: "34px", fontWeight: 600, letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1.1, marginBottom: "12px" }}>Love Italian food?</h2>
            <p style={{ fontSize: "16px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "28px", maxWidth: "440px" }}>
              Get the best restaurant openings, food stories and hidden gems delivered to your inbox every week.
            </p>
            <div style={{ display: "flex", gap: "12px", maxWidth: "480px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", gap: "10px", background: "#FCFBF8", borderRadius: "14px", border: "1px solid var(--border)", padding: "0 18px", height: "52px" }}>
                <Icon name="mail" size={18} color="var(--text-2)" />
                <input placeholder="Your email address" style={{ flex: 1, fontSize: "15px", color: "var(--text)" }} />
              </div>
              <Btn variant="primary" size="lg" onClick={() => go("newsletter-success")}>Subscribe</Btn>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
