"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ContributionHeatmap } from "@/components/charts/ContributionHeatmap";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { useTradeStore } from "@/store/useTradeStore";
import { dailyPnlMap } from "@/lib/aggregations";
import { contributionWeeks } from "@/lib/calendarGrid";

export function CalendarHeatmapCard() {
  const trades = useFilteredTrades();
  const setFilters = useTradeStore((s) => s.setFilters);
  const weekStart = useTradeStore((s) => s.weekStart);

  const weeks = useMemo(() => {
    const map = dailyPnlMap(trades);
    return contributionWeeks(map, 168, new Date(), weekStart);
  }, [trades, weekStart]);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Daily P&L</CardTitle>
          <CardSubtitle>Last 24 weeks — click a day to filter</CardSubtitle>
        </div>
      </CardHeader>
      {trades.length === 0 ? (
        <EmptyState title="No trades in range" />
      ) : (
        <ContributionHeatmap
          weeks={weeks}
          onDayClick={(date) => setFilters({ datePreset: "Custom", customStart: date, customEnd: date })}
        />
      )}
    </Card>
  );
}
