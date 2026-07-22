"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { Skeleton } from "@/components/ui/Skeleton";
import { WeekdayHourHeatmapCard } from "@/components/analytics/WeekdayHourHeatmap";
import { MaeMfeScatterCard } from "@/components/analytics/MaeMfeScatter";
import { ProcessVsProfitChartCard } from "@/components/analytics/ProcessVsProfitChart";
import { RollingMetricsChartCard } from "@/components/analytics/RollingMetricsChart";
import { TagLeaderboardCard } from "@/components/analytics/TagLeaderboard";

export default function AnalyticsPage() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-medium text-fg">Analytics</h1>

      <WeekdayHourHeatmapCard />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MaeMfeScatterCard />
        <RollingMetricsChartCard />
      </div>

      <ProcessVsProfitChartCard />

      <TagLeaderboardCard />
    </div>
  );
}
