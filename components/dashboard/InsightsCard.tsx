"use client";

import { useMemo } from "react";
import { Lightbulb } from "lucide-react";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { generateInsights } from "@/lib/insights";
import { cn } from "@/lib/cn";

export function InsightsCard() {
  const trades = useFilteredTrades();
  const insights = useMemo(() => generateInsights(trades), [trades]);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Insights</CardTitle>
          <CardSubtitle>Plain-English findings from your data</CardSubtitle>
        </div>
      </CardHeader>
      {insights.length === 0 ? (
        <EmptyState title="Not enough data yet" description="Log more trades to surface patterns." />
      ) : (
        <ul className="space-y-3">
          {insights.map((insight) => (
            <li key={insight.id} className="flex items-start gap-2.5 text-sm">
              <Lightbulb
                className={cn(
                  "h-4 w-4 mt-0.5 shrink-0",
                  insight.tone === "positive" && "text-gain",
                  insight.tone === "negative" && "text-loss",
                  insight.tone === "neutral" && "text-accent"
                )}
              />
              <span className="text-fg-muted">{insight.text}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
