// CIBISWEB — Search engine: fuzzy match, did-you-mean, relationships, surprise.
import {
  CITIES, DISHES, RESTAURANTS, STORIES, VIDEOS, NEWS,
  type Dish, type Restaurant, type Story, type Video, type News, type City,
  cityById, dishByName,
} from "./data";

export type ResultKind = "restaurant" | "dish" | "story" | "video" | "city" | "news";
export type Result =
  | { kind: "restaurant"; item: Restaurant }
  | { kind: "dish"; item: Dish }
  | { kind: "story"; item: Story }
  | { kind: "video"; item: Video }
  | { kind: "city"; item: City }
  | { kind: "news"; item: News };

/* ── Relationship derivation ────────────────────────────────────── */
export function restaurantsServing(dish: Dish): Restaurant[] {
  const byName = RESTAURANTS.filter((r) => r.signatureDishes.includes(dish.name));
  const byCity = RESTAURANTS.filter((r) => r.cityId === dish.cityId && !byName.includes(r));
  return [...byName, ...byCity].slice(0, 6);
}
export function servedCount(dish: Dish): number {
  // deterministic, realistic-looking count
  return 40 + ((dish.name.length * 7 + dish.rating * 10) % 60);
}
export function relatedDishes(dish: Dish): Dish[] {
  return DISHES.filter((d) => d.id !== dish.id && (d.category === dish.category || d.cityId === dish.cityId)).slice(0, 6);
}
export function dishStories(dish: Dish): Story[] {
  const direct = STORIES.filter((s) => s.dishId === dish.id);
  const byWord = STORIES.filter((s) => !direct.includes(s) && s.title.toLowerCase().includes(dish.name.toLowerCase().split(" ")[0]));
  return [...direct, ...byWord].slice(0, 4);
}
export function dishVideos(dish: Dish): Video[] {
  const direct = VIDEOS.filter((v) => v.dishId === dish.id);
  const byWord = VIDEOS.filter((v) => !direct.includes(v) && v.title.toLowerCase().includes(dish.name.toLowerCase().split(" ")[0]));
  return [...direct, ...byWord].slice(0, 4);
}
export const cityRestaurants = (cityId: string) => RESTAURANTS.filter((r) => r.cityId === cityId);
export const cityDishes = (cityId: string) => DISHES.filter((d) => d.cityId === cityId);
export const cityStories = (cityId: string) => STORIES.filter((s) => s.cityId === cityId).slice(0, 4);
export const cityVideos = (cityId: string) => VIDEOS.slice(0, 3);

/* ── Fuzzy matching ─────────────────────────────────────────────── */
function keywords(name: string, extra: string[] = []) {
  return [name, ...name.toLowerCase().split(/[^a-z]+/).filter(Boolean), ...extra.map((e) => e.toLowerCase())];
}
function matches(query: string, name: string, extra: string[] = []): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  if (name.toLowerCase().includes(q)) return true;
  return keywords(name, extra).some((k) => k.includes(q) || q.includes(k));
}

/* Levenshtein distance for did-you-mean */
function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[m][n];
}
const ALL_TERMS = [
  ...DISHES.map((d) => d.name), ...RESTAURANTS.map((r) => r.name), ...CITIES.map((c) => c.name),
];
export function didYouMean(query: string): string | null {
  const q = query.trim().toLowerCase();
  if (q.length < 3) return null;
  // exact substring hit somewhere → no correction needed
  if (ALL_TERMS.some((t) => t.toLowerCase().includes(q))) return null;
  let best: string | null = null;
  let bestD = Infinity;
  for (const t of ALL_TERMS) {
    const tl = t.toLowerCase();
    // compare against whole term and against each word
    for (const cand of [tl, ...tl.split(/[^a-z]+/).filter(Boolean)]) {
      const d = lev(q, cand);
      if (d < bestD) { bestD = d; best = t; }
    }
  }
  return bestD <= 2 ? best : null;
}

/* ── Suggestions (grouped, for the dropdown) ────────────────────── */
export type Suggestion = { kind: ResultKind; label: string; icon: string; sub?: string };
export function suggestions(query: string): Record<string, Suggestion[]> {
  const out: Record<string, Suggestion[]> = {};
  const push = (group: string, s: Suggestion) => { (out[group] ||= []).push(s); };
  RESTAURANTS.filter((r) => matches(query, r.name, [r.cuisine, cityById(r.cityId)?.name || ""])).slice(0, 4)
    .forEach((r) => push("Restaurants", { kind: "restaurant", label: r.name, icon: "store", sub: cityById(r.cityId)?.name }));
  DISHES.filter((d) => matches(query, d.name, [d.category, cityById(d.cityId)?.name || ""])).slice(0, 5)
    .forEach((d) => push("Dishes", { kind: "dish", label: d.name, icon: "utensils", sub: d.category }));
  STORIES.filter((s) => matches(query, s.title)).slice(0, 3)
    .forEach((s) => push("Stories", { kind: "story", label: s.title, icon: "book-open", sub: s.category }));
  CITIES.filter((c) => matches(query, c.name, [c.region])).slice(0, 3)
    .forEach((c) => push("Cities", { kind: "city", label: c.name, icon: "map-pin", sub: c.region }));
  VIDEOS.filter((v) => matches(query, v.title)).slice(0, 3)
    .forEach((v) => push("Videos", { kind: "video", label: v.title, icon: "play", sub: v.duration }));
  return out;
}

/* ── Full results (for results page) ────────────────────────────── */
export function searchAll(query: string): Result[] {
  const res: Result[] = [];
  RESTAURANTS.filter((r) => matches(query, r.name, [r.cuisine, cityById(r.cityId)?.name || ""])).forEach((item) => res.push({ kind: "restaurant", item }));
  DISHES.filter((d) => matches(query, d.name, [d.category, cityById(d.cityId)?.name || ""])).forEach((item) => res.push({ kind: "dish", item }));
  STORIES.filter((s) => matches(query, s.title) && s.category !== "News").forEach((item) => res.push({ kind: "story", item }));
  VIDEOS.filter((v) => matches(query, v.title)).forEach((item) => res.push({ kind: "video", item }));
  CITIES.filter((c) => matches(query, c.name, [c.region])).forEach((item) => res.push({ kind: "city", item }));
  NEWS.filter((n) => matches(query, n.title, [n.tag])).forEach((item) => res.push({ kind: "news", item }));
  return res;
}

/* If a query is empty (e.g. a category browse) return a broad mix */
export function browseByCategory(category: string): Result[] {
  const res: Result[] = [];
  DISHES.filter((d) => d.category === category).forEach((item) => res.push({ kind: "dish", item }));
  RESTAURANTS.filter((r) => r.cuisine.includes(category) || (category === "Fine Dining" && r.fineDining)).forEach((item) => res.push({ kind: "restaurant", item }));
  return res;
}

/* ── Smart filters ──────────────────────────────────────────────── */
export type SmartFilter = "Vegetarian" | "Michelin" | "Fine Dining" | "Open Now" | "Rating 4.5+";
export const SMART_FILTERS: SmartFilter[] = ["Vegetarian", "Michelin", "Fine Dining", "Open Now", "Rating 4.5+"];
export function passesSmart(r: Result, active: Set<SmartFilter>): boolean {
  if (active.size === 0) return true;
  for (const f of active) {
    if (f === "Rating 4.5+") {
      const rating = "rating" in r.item ? (r.item as { rating?: number }).rating : undefined;
      if (rating == null || rating < 4.5) return false;
    } else if (f === "Vegetarian") {
      if (r.kind === "dish" && !r.item.vegetarian) return false;
      if (r.kind === "restaurant" && !r.item.vegetarian) return false;
      if (r.kind !== "dish" && r.kind !== "restaurant") return false;
    } else if (f === "Michelin") {
      if (r.kind !== "restaurant" || r.item.michelin === 0) return false;
    } else if (f === "Fine Dining") {
      if (r.kind !== "restaurant" || !r.item.fineDining) return false;
    } else if (f === "Open Now") {
      if (r.kind !== "restaurant" || !r.item.openNow) return false;
    }
  }
  return true;
}

/* ── Surprise Me ────────────────────────────────────────────────── */
export function surprise(): { view: string; query: string } {
  const options: { view: string; query: string }[] = [
    { view: "dish", query: DISHES[Math.floor(Math.random() * DISHES.length)].name },
    { view: "restaurant", query: RESTAURANTS[Math.floor(Math.random() * RESTAURANTS.length)].name },
    { view: "story", query: STORIES[Math.floor(Math.random() * STORIES.length)].title },
    { view: "video", query: VIDEOS[Math.floor(Math.random() * VIDEOS.length)].title },
    { view: "city", query: CITIES[Math.floor(Math.random() * CITIES.length)].name },
  ];
  return options[Math.floor(Math.random() * options.length)];
}

/* Resolve what the user searched into a primary entity for the summary card */
export function primaryEntity(query: string): Result | null {
  const d = dishByName(query);
  if (d) return { kind: "dish", item: d };
  const r = RESTAURANTS.find((x) => x.name.toLowerCase() === query.toLowerCase());
  if (r) return { kind: "restaurant", item: r };
  const c = CITIES.find((x) => x.name.toLowerCase() === query.toLowerCase());
  if (c) return { kind: "city", item: c };
  // otherwise best fuzzy dish match
  const all = searchAll(query);
  return all.find((x) => x.kind === "dish") || all.find((x) => x.kind === "restaurant") || all.find((x) => x.kind === "city") || null;
}
