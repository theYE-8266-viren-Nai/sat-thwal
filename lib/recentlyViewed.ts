import type { ServiceCategory } from "@/types/domain";

const KEY = "unimate:recently-viewed";
const MAX_ITEMS = 10;

export interface RecentlyViewedEntry {
  category: ServiceCategory;
  id: string;
  viewedAt: number;
}

export function getRecentlyViewed(): RecentlyViewedEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecentlyViewedEntry[]) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(category: ServiceCategory, id: string) {
  if (typeof window === "undefined") return;
  const existing = getRecentlyViewed().filter(
    (entry) => !(entry.category === category && entry.id === id),
  );
  const next = [{ category, id, viewedAt: Date.now() }, ...existing].slice(0, MAX_ITEMS);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

const RECENT_SEARCHES_KEY = "unimate:recent-searches";
const MAX_SEARCHES = 6;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string) {
  if (typeof window === "undefined") return;
  const trimmed = query.trim();
  if (!trimmed) return;
  const existing = getRecentSearches().filter((q) => q !== trimmed);
  const next = [trimmed, ...existing].slice(0, MAX_SEARCHES);
  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
}
