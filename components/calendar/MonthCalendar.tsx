"use client";

import { useMemo } from "react";
import { isSameMonth, isToday } from "date-fns";
import { Card } from "@/components/ui/Card";
import { useTradeStore } from "@/store/useTradeStore";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { dailyPnlMap } from "@/lib/aggregations";
import { monthGrid } from "@/lib/calendarGrid";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

interface MonthCalendarProps {
  year: number;
  month: number;
  onDayClick: (date: string) => void;
}

export function MonthCalendar({ year, month, onDayClick }: MonthCalendarProps) {
  const trades = useFilteredTrades();
  const weekStart = useTradeStore((s) => s.weekStart);
  const hideWeekends = useTradeStore((s) => s.hideWeekends);
  const grossNet = useTradeStore((s) => s.grossNet);
  const hidePnl = useTradeStore((s) => s.hidePnl);

  const dailyMap = useMemo(() => dailyPnlMap(trades), [trades]);
  const weeks = useMemo(() => monthGrid(year, month, weekStart), [year, month, weekStart]);

  const weekdayLabels =
    weekStart === "Mon" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const visibleIndices = hideWeekends
    ? weekdayLabels.map((_, i) => i).filter((i) => (weekStart === "Mon" ? i < 5 : i > 0 && i < 6))
    : weekdayLabels.map((_, i) => i);

  return (
    <Card>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${visibleIndices.length}, minmax(0, 1fr))` }}>
        {visibleIndices.map((i) => (
          <div key={i} className="pb-1 text-center text-xs font-medium text-fg-subtle">
            {weekdayLabels[i]}
          </div>
        ))}
        {weeks.map((week, wi) =>
          visibleIndices.map((di) => {
            const cell = week[di];
            const key = cell.date.toISOString().slice(0, 10);
            const entry = dailyMap.get(key);
            const value = entry ? (grossNet === "gross" ? entry.grossPnl : entry.netPnl) : null;
            const inMonth = isSameMonth(cell.date, new Date(year, month, 1));

            return (
              <button
                key={`${wi}-${di}`}
                type="button"
                disabled={!entry}
                onClick={() => onDayClick(key)}
                className={cn(
                  "flex aspect-square flex-col items-start justify-between rounded-lg border border-border/60 p-1.5 text-left transition-colors",
                  inMonth ? "bg-panel" : "bg-transparent opacity-40",
                  entry && "hover:border-accent/40 cursor-pointer",
                  isToday(cell.date) && "ring-1 ring-accent"
                )}
              >
                <span className="text-[10px] text-fg-subtle">{cell.date.getDate()}</span>
                {value !== null && (
                  <span
                    className={cn(
                      "w-full truncate text-[10px] font-medium tabular-nums",
                      value > 0 ? "text-gain" : value < 0 ? "text-loss" : "text-fg-muted"
                    )}
                  >
                    {hidePnl ? "•••" : formatCurrency(value)}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </Card>
  );
}
