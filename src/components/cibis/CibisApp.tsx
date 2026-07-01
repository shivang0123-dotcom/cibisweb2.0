"use client";

import { useEffect, useState } from "react";
import { LangProvider, NavContext, Container, Btn } from "./ui";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { FeaturedPartner, TopRestaurants, FeaturedStory, FoodStories, Newsletter } from "./Sections";
import { Footer } from "./Footer";

type Route = { view: string; query: string };

function Placeholder({ view, go }: { view: string; go: (v: string, q?: string) => void }) {
  const title = view.charAt(0).toUpperCase() + view.slice(1);
  return (
    <section style={{ padding: "120px 0", minHeight: "60vh", display: "flex", alignItems: "center" }}>
      <Container style={{ maxWidth: "1320px", textAlign: "center" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "14px" }}>Coming next</div>
        <h1 style={{ fontSize: "48px", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: "16px" }}>{title}</h1>
        <p style={{ fontSize: "18px", color: "var(--text-2)", maxWidth: "520px", margin: "0 auto 32px" }}>
          This screen is part of the full CIBISWEB design and will be built out next. The homepage is complete and pixel-faithful to the handoff.
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Btn variant="primary" size="lg" icon="arrow-right" onClick={() => go("home")}>Back to homepage</Btn>
        </div>
      </Container>
    </section>
  );
}

export function CibisApp() {
  const [route, setRoute] = useState<Route>({ view: "home", query: "" });
  const go = (view: string, query = "") => {
    setRoute({ view, query });
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  useEffect(() => {
    const els = document.querySelectorAll(".reveal:not(.in)");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [route.view]);

  return (
    <LangProvider>
      <NavContext.Provider value={{ go }}>
        <Navbar current={route.view} />
        {route.view === "home" ? (
          <>
            <Hero />
            <FeaturedPartner />
            <TopRestaurants />
            <FeaturedStory />
            <FoodStories />
            <Newsletter />
          </>
        ) : (
          <Placeholder view={route.view} go={go} />
        )}
        <Footer />
      </NavContext.Provider>
    </LangProvider>
  );
}
