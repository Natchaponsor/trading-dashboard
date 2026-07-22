"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { WatchlistStrip } from "@/components/dashboard/WatchlistStrip";
import { KpiScorecard } from "@/components/dashboard/KpiScorecard";
import { EquityCurveCard } from "@/components/dashboard/EquityCurveCard";
import { CalendarHeatmapCard } from "@/components/dashboard/CalendarHeatmapCard";
import { BreakdownBarsCard } from "@/components/dashboard/BreakdownBarsCard";
import { RHistogramCard } from "@/components/dashboard/RHistogramCard";
import { WinLossDonutCard } from "@/components/dashboard/WinLossDonutCard";
import { InsightsCard } from "@/components/dashboard/InsightsCard";
import { RecentTradesCard } from "@/components/dashboard/RecentTradesCard";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="flex gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-32 shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}

export default function DashboardPage() {
  const hydrated = useHydrated();

  if (!hydrated) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium text-fg">Dashboard</h1>
      </div>

      <Card>
        <WatchlistStrip />
      </Card>

      <KpiScorecard />

      <EquityCurveCard />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CalendarHeatmapCard />
        <BreakdownBarsCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RHistogramCard />
        <WinLossDonutCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InsightsCard />
        <RecentTradesCard />
      </div>
    </div>
  );
}
