"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { PnlText } from "@/components/ui/PnlText";
import { useTradeStore } from "@/store/useTradeStore";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { dailyPnlMap } from "@/lib/aggregations";
import { monthGrid } from "@/lib/calendarGrid";
import { formatCurrency } from "@/lib/format";

interface WeeklySummarySidebarProps {
  year: number;
  month: number;
}

export function WeeklySummarySidebar({ year, month }: WeeklySummarySidebarProps) {
  const trades = useFilteredTrades();
  const weekStart = useTradeStore((s) => s.weekStart);
  const grossNet = useTradeStore((s) => s.grossNet);

  const dailyMap = useMemo(() => dailyPnlMap(trades), [trades]);
  const weeks = useMemo(() => monthGrid(year, month, weekStart), [year, month, weekStart]);

  const summaries = weeks.map((week) => {
    let net = 0;
    let count = 0;
    for (const cell of week) {
      const key = cell.date.toISOString().slice(0, 10);
      const entry = dailyMap.get(key);
      if (entry) {
        net += grossNet === "gross" ? entry.grossPnl : entry.netPnl;
        count += entry.count;
      }
    }
    return { start: week[0].date, end: week[week.length - 1].date, net, count };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Summary</CardTitle>
      </CardHeader>
      <ul className="space-y-3">
        {summaries.map((s, i) => (
          <li key={i} className="flex items-center justify-between text-sm">
            <div>
              <p className="text-fg-muted">
                {format(s.start, "MMM d")} – {format(s.end, "MMM d")}
              </p>
              <p className="text-xs text-fg-subtle">{s.count} trades</p>
            </div>
            <PnlText value={s.net} formatted={formatCurrency(s.net, { signed: true })} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
