import type { DatePreset } from "./constants";
import type { DerivedTrade, Side } from "./types";

export interface Filters {
  datePreset: DatePreset;
  customStart: string | null; // ISO date
  customEnd: string | null;
  symbols: string[]; // empty = all
  setups: string[];
  tags: string[];
  side: Side | "all";
}

export const DEFAULT_FILTERS: Filters = {
  datePreset: "All",
  customStart: null,
  customEnd: null,
  symbols: [],
  setups: [],
  tags: [],
  side: "all",
};

function presetRange(preset: DatePreset, now: Date): { start: Date | null; end: Date | null } {
  const end = new Date(now);
  const start = new Date(now);
  switch (preset) {
    case "7D":
      start.setDate(start.getDate() - 7);
      return { start, end };
    case "30D":
      start.setDate(start.getDate() - 30);
      return { start, end };
    case "90D":
      start.setDate(start.getDate() - 90);
      return { start, end };
    case "YTD":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    case "1Y":
      start.setFullYear(start.getFullYear() - 1);
      return { start, end };
    case "All":
    case "Custom":
    default:
      return { start: null, end: null };
  }
}

export function applyFilters(
  trades: DerivedTrade[],
  filters: Filters,
  now: Date = new Date()
): DerivedTrade[] {
  let start: Date | null = null;
  let end: Date | null = null;

  if (filters.datePreset === "Custom") {
    start = filters.customStart ? new Date(filters.customStart) : null;
    end = filters.customEnd ? new Date(filters.customEnd) : null;
  } else {
    const range = presetRange(filters.datePreset, now);
    start = range.start;
    end = range.end;
  }

  return trades.filter((t) => {
    const entry = new Date(t.entryTime);
    if (start && entry < start) return false;
    if (end && entry > end) return false;
    if (filters.symbols.length > 0 && !filters.symbols.includes(t.symbol)) return false;
    if (filters.setups.length > 0 && !filters.setups.includes(t.setup)) return false;
    if (filters.tags.length > 0 && !filters.tags.some((tag) => t.tags.includes(tag))) return false;
    if (filters.side !== "all" && t.side !== filters.side) return false;
    return true;
  });
}

export function distinctSymbols(trades: DerivedTrade[]): string[] {
  return Array.from(new Set(trades.map((t) => t.symbol))).sort();
}
