"use client";

import { useMemo, useState } from "react";
import { Icon } from "./icons";
import { Container, Btn, useGo } from "./ui";
import { ResultCard, QuickSummaryCard } from "./ResultCards";
import { POPULAR_CATEGORIES } from "./data";
import {
  searchAll, browseByCategory, primaryEntity, didYouMean, surprise,
  SMART_FILTERS, passesSmart, type Result, type ResultKind, type SmartFilter,
} from "./search-utils";

const KIND_FILTERS: { key: ResultKind | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "restaurant", label: "Restaurants" },
  { key: "dish", label: "Dishes" },
  { key: "story", label: "Stories" },
  { key: "video", label: "Videos" },
  { key: "news", label: "News" },
  { key: "city", label: "Cities" },
];

export function SearchResults({ query }: { query: string }) {
  const go = useGo();
  const [kind, setKind] = useState<ResultKind | "all">("all");
  const [smart, setSmart] = useState<Set<SmartFilter>>(new Set());

  const isCategory = (POPULAR_CATEGORIES as string[]).includes(query);
  const base = useMemo<Result[]>(() => (isCategory ? browseByCategory(query) : searchAll(query)), [query, isCategory]);
  const entity = useMemo(() => (isCategory ? null : primaryEntity(query)), [query, isCategory]);
  const correction = useMemo(() => (base.length === 0 ? didYouMean(query) : null), [base, query]);

  const filtered = useMemo(() => {
    let list = base;
    if (kind !== "all") list = list.filter((r) => r.kind === kind);
    list = list.filter((r) => passesSmart(r, smart));
    return list;
  }, [base, kind, smart]);

  const countFor = (k: ResultKind | "all") =>
    (k === "all" ? base : base.filter((r) => r.kind === k)).filter((r) => passesSmart(r, smart)).length;

  const toggleSmart = (f: SmartFilter) => {
    setSmart((prev) => { const next = new Set(prev); if (next.has(f)) next.delete(f); else next.add(f); return next; });
  };

  return (
    <div style={{ minHeight: "70vh" }}>
      <Container style={{ maxWidth: "1320px", paddingTop: "48px", paddingBottom: "72px" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)", marginBottom: "10px" }}>
            {isCategory ? "Category" : "Search results"}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "14px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "44px", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1.05 }}>
              {isCategory ? query : `“${query}”`}
            </h1>
            <span style={{ fontSize: "16px", color: "var(--text-2)" }}>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
          </div>
        </div>

        {/* Did you mean */}
        {correction && (
          <button onClick={() => go("search", correction)}
            style={{ display: "inline-flex", alignItems: "center", gap: "9px", marginBottom: "24px", padding: "10px 16px", borderRadius: "12px", background: "#FBE9EA", fontSize: "15px", color: "var(--text)" }}>
            <Icon name="search" size={16} color="var(--red)" />Did you mean <strong style={{ color: "var(--red)" }}>{correction}</strong>?
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
                {f.label}{f.key !== "all" ? ` · ${n}` : ""}
              </button>
            );
          })}
        </div>

        {/* Smart filters */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "36px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)", marginRight: "2px" }}><Icon name="award" size={14} color="var(--text-2)" /></span>
          {SMART_FILTERS.map((f) => {
            const on = smart.has(f);
            return (
              <button key={f} onClick={() => toggleSmart(f)}
                style={{ height: "36px", padding: "0 15px", borderRadius: "999px", fontSize: "13px", fontWeight: 600, color: on ? "var(--red)" : "var(--text-2)", background: on ? "#FBE9EA" : "var(--card)", boxShadow: on ? "inset 0 0 0 1.5px var(--red)" : "inset 0 0 0 1px var(--border)", transition: "all 180ms ease" }}>
                {f}
              </button>
            );
          })}
        </div>

        {/* AI Quick Summary */}
        {entity && kind === "all" && smart.size === 0 && <QuickSummaryCard entity={entity} />}

        {/* Results grid */}
        {filtered.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {filtered.map((r, i) => (
              <div key={r.kind + ("id" in r.item ? r.item.id : i)} className="card-in" style={{ animationDelay: `${Math.min(i, 9) * 55}ms` }}>
                <ResultCard r={r} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ display: "inline-flex", width: "60px", height: "60px", borderRadius: "18px", background: "#F5F3EE", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
              <Icon name="search-x" size={28} color="var(--text-2)" />
            </div>
            <h3 style={{ fontSize: "24px", fontWeight: 600, color: "var(--text)", marginBottom: "8px" }}>No results found</h3>
            <p style={{ fontSize: "16px", color: "var(--text-2)", maxWidth: "440px", margin: "0 auto 24px" }}>
              We couldn&apos;t find anything for that search or filter combination. Try something else, or let us pick for you.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
              <Btn variant="outline" size="md" onClick={() => { setKind("all"); setSmart(new Set()); }}>Clear filters</Btn>
              <Btn variant="primary" size="md" icon="star" onClick={() => { const s = surprise(); go(s.view, s.query); }}>Surprise Me</Btn>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
