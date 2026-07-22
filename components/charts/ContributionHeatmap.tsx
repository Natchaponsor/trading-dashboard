"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  netPnl: number | null; // null = no trades
}

interface ContributionHeatmapProps {
  weeks: HeatmapDay[][]; // each week: 7 entries, Sun..Sat (or Mon..Sun if weekStart Mon)
  onDayClick?: (date: string) => void;
  cellSize?: number;
}

function intensityClass(netPnl: number | null, maxAbs: number): string {
  if (netPnl === null || netPnl === 0) return "bg-panel";
  const ratio = Math.min(1, Math.abs(netPnl) / Math.max(maxAbs, 1));
  const level = ratio > 0.75 ? 4 : ratio > 0.5 ? 3 : ratio > 0.25 ? 2 : 1;
  if (netPnl > 0) {
    return ["", "bg-gain/20", "bg-gain/40", "bg-gain/65", "bg-gain/90"][level];
  }
  return ["", "bg-loss/20", "bg-loss/40", "bg-loss/65", "bg-loss/90"][level];
}

export function ContributionHeatmap({ weeks, onDayClick, cellSize = 13 }: ContributionHeatmapProps) {
  const [hovered, setHovered] = useState<HeatmapDay | null>(null);

  const maxAbs = useMemo(() => {
    let max = 0;
    for (const week of weeks) {
      for (const day of week) {
        if (day.netPnl !== null) max = Math.max(max, Math.abs(day.netPnl));
      }
    }
    return max;
  }, [weeks]);

  return (
    <div className="relative">
      <div className="flex gap-[3px] overflow-x-auto no-scrollbar pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <button
                key={di}
                type="button"
                onClick={() => day.netPnl !== null && onDayClick?.(day.date)}
                onMouseEnter={() => setHovered(day)}
                onMouseLeave={() => setHovered(null)}
                style={{ width: cellSize, height: cellSize }}
                className={cn(
                  "rounded-[3px] border border-border/50 transition-transform hover:scale-110 hover:z-10 relative",
                  intensityClass(day.netPnl, maxAbs),
                  day.netPnl === null && "cursor-default"
                )}
                aria-label={`${day.date}: ${day.netPnl !== null ? formatCurrency(day.netPnl) : "no trades"}`}
              />
            ))}
          </div>
        ))}
      </div>
      {hovered && (
        <div className="pointer-events-none absolute -top-9 left-0 rounded-lg border border-border bg-panel px-2.5 py-1.5 text-xs shadow-lg z-20">
          <span className="text-fg-muted">{format(new Date(hovered.date), "MMM d, yyyy")}</span>{" "}
          <span
            className={cn(
              "font-medium tabular-nums",
              hovered.netPnl === null
                ? "text-fg-subtle"
                : hovered.netPnl > 0
                  ? "text-gain"
                  : hovered.netPnl < 0
                    ? "text-loss"
                    : "text-fg-muted"
            )}
          >
            {hovered.netPnl !== null ? formatCurrency(hovered.netPnl) : "No trades"}
          </span>
        </div>
      )}
    </div>
  );
}
