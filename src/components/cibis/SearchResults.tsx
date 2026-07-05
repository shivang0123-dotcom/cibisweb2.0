"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./icons";
import { Container, Btn, useGo } from "./ui";
import { ResultCard, QuickSummaryCard, RestaurantCard, CityCard, DishCard } from "./ResultCards";
import { POPULAR_CATEGORIES } from "./data";
import { useI18n } from "./i18n";
import {
  searchAll, browseByCategory, primaryEntity, didYouMean, surprise,
  sortResults, SORT_OPTIONS, type SortKey,
  relatedSearches, popularDishes, popularRestaurants, popularCities,
  SMART_FILTERS, passesSmart, type Result, type ResultKind, type SmartFilter,
} from "./search-utils";

const KIND_FILTERS: { key: ResultKind | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "restaurant", label: "Restaurants" },
  { key: "dish", label: "Dishes" },
  { key: "recipe", label: "Recipes" },
  { key: "story", label: "Stories" },
  { key: "video", label: "Videos" },
  { key: "news", label: "News" },
  { key: "city", label: "Cities" },
];

function SortDropdown({ value, onChange }: { value: SortKey; onChange: (k: SortKey) => void }) {
  const { l } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const current = SORT_OPTIONS.find((o) => o.key === value)!;
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={open}
        style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "40px", padding: "0 16px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: "var(--text)", background: "var(--card)", boxShadow: open ? "inset 0 0 0 1.5px var(--red)" : "inset 0 0 0 1px var(--border)", transition: "box-shadow 180ms ease" }}>
        {l("Sort")}: {l(current.label)}
        <span style={{ display: "inline-flex", transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms ease" }}><Icon name="chevron-down" size={16} color="var(--text-2)" /></span>
      </button>
      {open && (
        <div role="listbox" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 30, minWidth: "190px", background: "var(--card)", borderRadius: "14px", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)", padding: "6px", animation: "panelIn 200ms cubic-bezier(.16,1,.3,1)" }}>
          {SORT_OPTIONS.map((o) => {
            const on = o.key === value;
            return (
              <button key={o.key} role="option" aria-selected={on} onClick={() => { onChange(o.key); setOpen(false); }}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "10px 12px", borderRadius: "10px", fontSize: "14px", fontWeight: on ? 600 : 500, color: on ? "var(--red)" : "var(--text)", background: on ? "#FBE9EA" : "transparent", textAlign: "left" }}>
                {l(o.label)}
                {on && <Icon name="check-circle" size={15} color="var(--red)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "var(--card)", borderRadius: "20px", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
      <div className="skeleton" style={{ height: "200px", borderRadius: 0 }} />
      <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div className="skeleton" style={{ height: "20px", width: "70%" }} />
        <div className="skeleton" style={{ height: "14px", width: "50%" }} />
        <div className="skeleton" style={{ height: "26px", width: "38%", borderRadius: "999px" }} />
      </div>
    </div>
  );
}

export function SearchResults({ query }: { query: string }) {
  const go = useGo();
  const { l } = useI18n();
  const [kind, setKind] = useState<ResultKind | "all">("all");
  const [smart, setSmart] = useState<Set<SmartFilter>>(new Set());
  const [sort, setSort] = useState<SortKey>("relevance");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setKind("all"); setSmart(new Set()); setSort("relevance");
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, [query]);

  const isCategory = (POPULAR_CATEGORIES as string[]).includes(query);
  const base = useMemo<Result[]>(() => (isCategory ? browseByCategory(query) : searchAll(query)), [query, isCategory]);
  const entity = useMemo(() => (isCategory ? null : primaryEntity(query)), [query, isCategory]);
  const correction = useMemo(() => (base.length === 0 ? didYouMean(query) : null), [base, query]);

  const filtered = useMemo(() => {
    let list = base;
    if (kind === "all") list = list.filter((r) => r.kind !== "recipe");
    else list = list.filter((r) => r.kind === kind);
    list = list.filter((r) => passesSmart(r, smart));
    return sortResults(list, sort);
  }, [base, kind, smart, sort]);

  const countFor = (k: ResultKind | "all") =>
    (k === "all" ? base.filter((r) => r.kind !== "recipe") : base.filter((r) => r.kind === k)).filter((r) => passesSmart(r, smart)).length;

  const toggleSmart = (f: SmartFilter) => {
    setSmart((prev) => { const next = new Set(prev); if (next.has(f)) next.delete(f); else next.add(f); return next; });
  };

  const empty = !loading && filtered.length === 0;

  return (
    <div style={{ minHeight: "70vh" }}>
      <Container style={{ maxWidth: "1320px", paddingTop: "48px", paddingBottom: "72px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "20px", flexWrap: "wrap", marginBottom: "24px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "10px" }}>
              {isCategory ? l("Category") : l("Search results")}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "14px", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "44px", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1.05 }}>
                {isCategory ? l(query) : `“${query}”`}
              </h1>
              {!loading && <span style={{ fontSize: "16px", color: "var(--text-2)" }}>{filtered.length} {filtered.length === 1 ? l("result") : l("results")}</span>}
            </div>
          </div>
          <SortDropdown value={sort} onChange={setSort} />
        </div>

        {/* Did you mean */}
        {correction && (
          <button onClick={() => go("search", correction)}
            style={{ display: "inline-flex", alignItems: "center", gap: "9px", marginBottom: "24px", padding: "10px 16px", borderRadius: "12px", background: "#FBE9EA", fontSize: "15px", color: "var(--text)" }}>
            <Icon name="search" size={16} color="var(--red)" />{l("Did you mean")} <strong style={{ color: "var(--red)" }}>{correction}</strong>?
          </button>
        )}

        {/* Kind filter chips */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
          {KIND_FILTERS.map((f) => {
            const n = countFor(f.key);
            const on = kind === f.key;
            if (f.key !== "all" && n === 0) return null;
            return (
              <button key={f.key} onClick={() => setKind(f.key)}
                style={{ height: "40px", padding: "0 18px", borderRadius: "999px", fontSize: "14px", fontWeight: 600, color: on ? "#fff" : "var(--text)", background: on ? "var(--red)" : "var(--card)", boxShadow: on ? "none" : "inset 0 0 0 1px var(--border)", transition: "all 200ms ease" }}>
                {l(f.label)}{f.key !== "all" ? ` · ${n}` : ""}
              </button>
            );
          })}
        </div>

        {/* Smart filters */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "36px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ display: "inline-flex", fontSize: "13px", fontWeight: 600, color: "var(--text-2)", marginRight: "2px" }}><Icon name="award" size={14} color="var(--text-2)" /></span>
          {SMART_FILTERS.map((f) => {
            const on = smart.has(f);
            return (
              <button key={f} onClick={() => toggleSmart(f)}
                style={{ height: "36px", padding: "0 15px", borderRadius: "999px", fontSize: "13px", fontWeight: 600, color: on ? "var(--red)" : "var(--text-2)", background: on ? "#FBE9EA" : "var(--card)", boxShadow: on ? "inset 0 0 0 1.5px var(--red)" : "inset 0 0 0 1px var(--border)", transition: "all 180ms ease" }}>
                {l(f)}
              </button>
            );
          })}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* AI Quick Summary */}
        {!loading && entity && kind === "all" && smart.size === 0 && <QuickSummaryCard entity={entity} />}

        {/* Results grid */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {filtered.map((r, i) => (
              <div key={r.kind + ("id" in r.item ? r.item.id : i)} className="card-in" style={{ animationDelay: `${Math.min(i, 9) * 55}ms` }}>
                <ResultCard r={r} />
              </div>
            ))}
          </div>
        )}

        {/* No results — discovery, never a dead end */}
        {empty && (
          <div>
            <div style={{ textAlign: "center", padding: "36px 20px 44px" }}>
              <div style={{ display: "inline-flex", width: "60px", height: "60px", borderRadius: "18px", background: "#F5F3EE", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                <Icon name="search-x" size={28} color="var(--text-2)" />
              </div>
              <h3 style={{ fontSize: "24px", fontWeight: 600, color: "var(--text)", marginBottom: "8px" }}>{l("No exact results found")}</h3>
              <p style={{ fontSize: "16px", color: "var(--text-2)", maxWidth: "440px", margin: "0 auto 20px" }}>
                {l("Nothing matched that search or filter combination — but the table is still full. You may like these.")}
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                {relatedSearches(query).map((s) => (
                  <button key={s} onClick={() => go("search", s)}
                    style={{ height: "36px", padding: "0 15px", borderRadius: "999px", fontSize: "13px", fontWeight: 600, color: "var(--text)", background: "var(--card)", boxShadow: "inset 0 0 0 1px var(--border)" }}>
                    {l(s)}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
                <Btn variant="outline" size="md" onClick={() => { setKind("all"); setSmart(new Set()); }}>{l("Clear filters")}</Btn>
                <Btn variant="primary" size="md" icon="sparkles" onClick={() => { const s = surprise(); go(s.view, s.query); }}>{l("Surprise Me")}</Btn>
              </div>
            </div>

            <div style={{ marginBottom: "36px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "16px" }}>{l("Trending dishes")}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
                {popularDishes(3).map((d) => <DishCard key={d.id} d={d} />)}
              </div>
            </div>
            <div style={{ marginBottom: "36px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "16px" }}>{l("Popular restaurants")}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
                {popularRestaurants(3).map((r) => <RestaurantCard key={r.id} r={r} />)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "16px" }}>{l("Cities to explore")}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
                {popularCities(3).map((c) => <CityCard key={c.id} c={c} />)}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
