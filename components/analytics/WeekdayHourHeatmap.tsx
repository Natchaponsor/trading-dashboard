"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { weekdayHourHeatmap, WEEKDAY_LABELS } from "@/lib/aggregations";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

const HOURS = [9, 10, 11, 12, 13, 14, 15];
const WEEKDAYS = [1, 2, 3, 4, 5]; // Mon..Fri

function cellClass(expectancy: number | null): string {
  if (expectancy === null) return "bg-panel/40";
  const intensity = Math.min(1, Math.abs(expectancy) / 1);
  const level = intensity > 0.66 ? 3 : intensity > 0.33 ? 2 : 1;
  if (expectancy > 0.02) return ["", "bg-gain/25", "bg-gain/50", "bg-gain/80"][level];
  if (expectancy < -0.02) return ["", "bg-loss/25", "bg-loss/50", "bg-loss/80"][level];
  return "bg-panel";
}

export function WeekdayHourHeatmapCard() {
  const trades = useFilteredTrades();
  const [hovered, setHovered] = useState<string | null>(null);

  const cellMap = useMemo(() => {
    const cells = weekdayHourHeatmap(trades);
    const map = new Map<string, { count: number; netPnl: number; expectancy: number }>();
    for (const c of cells) map.set(`${c.weekday}-${c.hour}`, c);
    return map;
  }, [trades]);

  if (trades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekday × Hour</CardTitle>
        </CardHeader>
        <EmptyState title="No data" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Weekday × Hour Performance</CardTitle>
          <CardSubtitle>Expectancy by entry time</CardSubtitle>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-12" />
              {HOURS.map((h) => (
                <th key={h} className="pb-1 text-xs font-medium text-fg-subtle">{h}:00</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WEEKDAYS.map((wd) => (
              <tr key={wd}>
                <td className="pr-2 text-right text-xs font-medium text-fg-subtle">{WEEKDAY_LABELS[wd]}</td>
                {HOURS.map((h) => {
                  const cell = cellMap.get(`${wd}-${h}`);
                  const key = `${wd}-${h}`;
                  return (
                    <td key={h} className="relative p-0">
                      <div
                        onMouseEnter={() => setHovered(key)}
                        onMouseLeave={() => setHovered((k) => (k === key ? null : k))}
                        className={cn("h-9 w-full rounded-md border border-border/40 transition-transform hover:scale-105", cellClass(cell?.expectancy ?? null))}
                      />
                      {hovered === key && cell && (
                        <div className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-panel px-2 py-1 text-xs shadow-lg">
                          {cell.count} trades · {formatCurrency(cell.netPnl)} · {cell.expectancy.toFixed(2)}R
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
