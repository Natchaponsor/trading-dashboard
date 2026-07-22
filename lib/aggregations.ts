import { computeMetrics } from "./metrics";
import type { DerivedTrade } from "./types";

export interface BreakdownRow {
  key: string;
  count: number;
  netPnl: number;
  winRate: number;
  expectancy: number;
}

function groupBy(trades: DerivedTrade[], keyFn: (t: DerivedTrade) => string) {
  const map = new Map<string, DerivedTrade[]>();
  for (const t of trades) {
    const key = keyFn(t);
    const arr = map.get(key) ?? [];
    arr.push(t);
    map.set(key, arr);
  }
  return map;
}

function toBreakdownRows(map: Map<string, DerivedTrade[]>): BreakdownRow[] {
  return Array.from(map.entries())
    .map(([key, group]) => {
      const m = computeMetrics(group);
      return { key, count: m.count, netPnl: m.netPnl, winRate: m.winRate, expectancy: m.expectancy };
    })
    .sort((a, b) => b.netPnl - a.netPnl);
}

export function breakdownBySymbol(trades: DerivedTrade[]): BreakdownRow[] {
  return toBreakdownRows(groupBy(trades, (t) => t.symbol));
}

export function breakdownBySetup(trades: DerivedTrade[]): BreakdownRow[] {
  return toBreakdownRows(groupBy(trades, (t) => t.setup));
}

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function breakdownByWeekday(trades: DerivedTrade[]): BreakdownRow[] {
  const map = groupBy(trades, (t) => String(new Date(t.entryTime).getDay()));
  const rows = toBreakdownRows(map);
  return rows.sort((a, b) => Number(a.key) - Number(b.key));
}

export interface HeatmapCell {
  weekday: number;
  hour: number;
  count: number;
  netPnl: number;
  expectancy: number;
}

export function weekdayHourHeatmap(trades: DerivedTrade[]): HeatmapCell[] {
  const map = new Map<string, DerivedTrade[]>();
  for (const t of trades) {
    const d = new Date(t.entryTime);
    const key = `${d.getDay()}-${d.getHours()}`;
    const arr = map.get(key) ?? [];
    arr.push(t);
    map.set(key, arr);
  }
  const cells: HeatmapCell[] = [];
  for (const [key, group] of map.entries()) {
    const [weekday, hour] = key.split("-").map(Number);
    const m = computeMetrics(group);
    cells.push({ weekday, hour, count: m.count, netPnl: m.netPnl, expectancy: m.expectancy });
  }
  return cells;
}

export interface HistogramBucket {
  label: string;
  min: number;
  max: number;
  count: number;
}

export function rMultipleHistogram(trades: DerivedTrade[], bucketSize = 0.5): HistogramBucket[] {
  if (trades.length === 0) return [];
  const rValues = trades.map((t) => t.rMultiple);
  const min = Math.floor(Math.min(...rValues) / bucketSize) * bucketSize;
  const max = Math.ceil(Math.max(...rValues) / bucketSize) * bucketSize;

  const buckets: HistogramBucket[] = [];
  for (let start = min; start < max; start += bucketSize) {
    buckets.push({
      label: `${start.toFixed(1)}R`,
      min: start,
      max: start + bucketSize,
      count: 0,
    });
  }
  for (const r of rValues) {
    const idx = Math.min(
      buckets.length - 1,
      Math.max(0, Math.floor((r - min) / bucketSize))
    );
    if (buckets[idx]) buckets[idx].count += 1;
  }
  return buckets;
}

export interface DailyPnl {
  date: string; // YYYY-MM-DD
  netPnl: number;
  grossPnl: number;
  count: number;
}

export function dailyPnlMap(trades: DerivedTrade[]): Map<string, DailyPnl> {
  const map = new Map<string, DailyPnl>();
  for (const t of trades) {
    const date = t.exitTime.slice(0, 10);
    const existing = map.get(date) ?? { date, netPnl: 0, grossPnl: 0, count: 0 };
    existing.netPnl += t.netPnl;
    existing.grossPnl += t.grossPnl;
    existing.count += 1;
    map.set(date, existing);
  }
  return map;
}

export interface TagStat {
  tag: string;
  count: number;
  netPnl: number;
  winRate: number;
}

export function tagLeaderboard(trades: DerivedTrade[]): TagStat[] {
  const map = new Map<string, DerivedTrade[]>();
  for (const t of trades) {
    for (const tag of t.tags) {
      const arr = map.get(tag) ?? [];
      arr.push(t);
      map.set(tag, arr);
    }
  }
  return Array.from(map.entries())
    .map(([tag, group]) => {
      const m = computeMetrics(group);
      return { tag, count: m.count, netPnl: m.netPnl, winRate: m.winRate };
    })
    .sort((a, b) => b.netPnl - a.netPnl);
}

export interface RollingPoint {
  date: string;
  winRate: number;
  expectancy: number;
  sharpe: number;
  disciplineScore: number;
}

export function rollingMetrics(trades: DerivedTrade[], windowSize = 20): RollingPoint[] {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime()
  );
  const points: RollingPoint[] = [];
  for (let i = windowSize - 1; i < sorted.length; i++) {
    const window = sorted.slice(i - windowSize + 1, i + 1);
    const m = computeMetrics(window);
    points.push({
      date: sorted[i].exitTime,
      winRate: m.winRate,
      expectancy: m.expectancy,
      sharpe: m.sharpe,
      disciplineScore: m.disciplineScore,
    });
  }
  return points;
}

export interface ProcessVsProfitPoint {
  date: string;
  cumulativeNet: number;
  disciplineScore: number;
}

export function processVsProfit(trades: DerivedTrade[]): ProcessVsProfitPoint[] {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime()
  );
  let cumulativeNet = 0;
  const gradeScore: Record<string, number> = { "A+": 100, A: 85, B: 65, C: 35 };
  let cumulativeScore = 0;
  return sorted.map((t, idx) => {
    cumulativeNet += t.netPnl;
    cumulativeScore += gradeScore[t.grade] ?? 50;
    return {
      date: t.exitTime,
      cumulativeNet,
      disciplineScore: Math.round(cumulativeScore / (idx + 1)),
    };
  });
}
