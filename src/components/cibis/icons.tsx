"use client";

import type { CSSProperties } from "react";
import {
  ArrowRight, Star, Search, User, Globe, Utensils, Pizza, Heart, MapPin,
  Coffee, Award, Leaf, Store, BookOpen, Play, Clock, TrendingUp, ArrowUpRight,
  X, SearchX, CalendarCheck, Calendar, Mail, Apple,
  Mic, Wine, ChefHat, ChevronDown, Phone, Users, Flame, Timer, Info,
  Sparkles, Lightbulb, PartyPopper, Gem, ShoppingBag, Navigation,
  AlertTriangle, CheckCircle2, ArrowLeft,
  type LucideIcon,
} from "lucide-react";

// Inline brand glyphs (removed from lucide-react v1)
function Instagram(p: { size?: number; color?: string }) {
  const s = p.size ?? 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={p.color ?? "currentColor"} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function Facebook(p: { size?: number; color?: string }) {
  const s = p.size ?? 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={p.color ?? "currentColor"} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function Twitter(p: { size?: number; color?: string }) {
  const s = p.size ?? 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={p.color ?? "currentColor"} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  );
}
function Youtube(p: { size?: number; color?: string }) {
  const s = p.size ?? 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={p.color ?? "currentColor"} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

const MAP: Record<string, LucideIcon | ((p: { size?: number; color?: string }) => React.ReactElement)> = {
  "arrow-right": ArrowRight, star: Star, search: Search, user: User, globe: Globe,
  utensils: Utensils, pizza: Pizza, heart: Heart, "map-pin": MapPin, coffee: Coffee,
  award: Award, leaf: Leaf, store: Store, "book-open": BookOpen, play: Play, clock: Clock,
  "trending-up": TrendingUp, "arrow-up-right": ArrowUpRight, x: X, "search-x": SearchX,
  "calendar-check": CalendarCheck, calendar: Calendar, mail: Mail, apple: Apple,
  instagram: Instagram, facebook: Facebook, twitter: Twitter, youtube: Youtube,
  mic: Mic, wine: Wine, "chef-hat": ChefHat, "chevron-down": ChevronDown,
  phone: Phone, users: Users, flame: Flame, timer: Timer, info: Info,
  sparkles: Sparkles, lightbulb: Lightbulb, "party-popper": PartyPopper,
  gem: Gem, "shopping-bag": ShoppingBag, navigation: Navigation,
  "alert-triangle": AlertTriangle, "check-circle": CheckCircle2, "arrow-left": ArrowLeft,
};

export function Icon({
  name, size = 20, color, style, className,
}: {
  name: string; size?: number; color?: string; style?: CSSProperties; className?: string;
}) {
  const Cmp = MAP[name];
  let fill = "none";
  if (className?.includes("rating-star")) fill = color || "var(--star)";
  else if (className?.includes("fill-current")) fill = "currentColor";
  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size, color: color || "inherit", lineHeight: 0, ...style }}
    >
      {Cmp ? <Cmp size={size} color={color || "currentColor"} strokeWidth={1.75} fill={fill} /> : null}
    </span>
  );
}
