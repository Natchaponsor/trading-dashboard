"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHydrated } from "@/hooks/useHydrated";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { useTradeStore } from "@/store/useTradeStore";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { WeeklySummarySidebar } from "@/components/calendar/WeeklySummarySidebar";
import { DayDrawer } from "@/components/calendar/DayDrawer";
import { ContributionHeatmap } from "@/components/charts/ContributionHeatmap";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { dailyPnlMap } from "@/lib/aggregations";
import { contributionWeeks } from "@/lib/calendarGrid";

const VIEWS = ["Month", "Year"] as const;

export default function CalendarPage() {
  const hydrated = useHydrated();
  const trades = useFilteredTrades();
  const weekStart = useTradeStore((s) => s.weekStart);
  const setWeekStart = useTradeStore((s) => s.setWeekStart);
  const hideWeekends = useTradeStore((s) => s.hideWeekends);
  const toggleHideWeekends = useTradeStore((s) => s.toggleHideWeekends);

  const [view, setView] = useState<(typeof VIEWS)[number]>("Month");
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const dailyMap = useMemo(() => dailyPnlMap(trades), [trades]);
  const yearWeeks = useMemo(() => contributionWeeks(dailyMap, 371, new Date(), weekStart), [dailyMap, weekStart]);

  if (!hydrated) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-medium text-fg">Calendar</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented options={VIEWS} value={view} onChange={setView} size="sm" />
          <Segmented options={["Mon", "Sun"] as const} value={weekStart} onChange={setWeekStart} size="sm" />
          <Button variant={hideWeekends ? "primary" : "secondary"} size="sm" onClick={toggleHideWeekends}>
            Hide weekends
          </Button>
        </div>
      </div>

      {view === "Month" ? (
        <>
          <div className="flex items-center justify-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="w-40 text-center font-serif text-lg text-fg">
              {cursor.toLocaleString("en-US", { month: "long", year: "numeric" })}
            </p>
            <Button variant="ghost" size="sm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
            <MonthCalendar year={cursor.getFullYear()} month={cursor.getMonth()} onDayClick={setSelectedDay} />
            <WeeklySummarySidebar year={cursor.getFullYear()} month={cursor.getMonth()} />
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Past Year</CardTitle>
          </CardHeader>
          <ContributionHeatmap weeks={yearWeeks} onDayClick={setSelectedDay} cellSize={12} />
        </Card>
      )}

      <DayDrawer date={selectedDay} onClose={() => setSelectedDay(null)} />
    </div>
  );
}
