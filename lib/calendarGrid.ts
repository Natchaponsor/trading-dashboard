import type { HeatmapDay } from "@/components/charts/ContributionHeatmap";

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Builds trailing-N-day GitHub-style contribution weeks ending today. */
export function contributionWeeks(
  dailyMap: Map<string, { netPnl: number }>,
  days: number,
  now: Date,
  weekStart: "Mon" | "Sun" = "Mon"
): HeatmapDay[][] {
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);

  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));

  // Align start back to the beginning of its week.
  const startDow = start.getDay(); // 0=Sun
  const offset = weekStart === "Mon" ? (startDow === 0 ? 6 : startDow - 1) : startDow;
  start.setDate(start.getDate() - offset);

  const allDays: HeatmapDay[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = toKey(cursor);
    const entry = dailyMap.get(key);
    allDays.push({ date: key, netPnl: cursor > end ? null : entry ? entry.netPnl : cursor <= now ? 0 : null });
    cursor.setDate(cursor.getDate() + 1);
  }

  // Trim future days beyond `now` to null (no trades possible yet) but keep grid rectangular.
  for (const day of allDays) {
    if (new Date(day.date) > end) day.netPnl = null;
  }

  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }
  return weeks;
}

export interface MonthCell {
  date: Date;
  inMonth: boolean;
}

/** Standard month calendar grid, weeks of 7, padded with adjacent-month days. */
export function monthGrid(year: number, month: number, weekStart: "Mon" | "Sun" = "Mon"): MonthCell[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const firstDow = first.getDay();
  const leadOffset = weekStart === "Mon" ? (firstDow === 0 ? 6 : firstDow - 1) : firstDow;

  const gridStart = new Date(first);
  gridStart.setDate(gridStart.getDate() - leadOffset);

  const lastDow = last.getDay();
  const trailOffset = weekStart === "Mon" ? (lastDow === 0 ? 0 : 7 - lastDow) : 6 - lastDow;
  const gridEnd = new Date(last);
  gridEnd.setDate(gridEnd.getDate() + trailOffset);

  const cells: MonthCell[] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    cells.push({ date: new Date(cursor), inMonth: cursor.getMonth() === month });
    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks: MonthCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}
