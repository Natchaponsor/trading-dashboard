"use client";

import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Segmented } from "@/components/ui/Segmented";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { rollingMetrics } from "@/lib/aggregations";
import { format } from "date-fns";

const METRICS = ["Win Rate", "Expectancy", "Sharpe"] as const;
type Metric = (typeof METRICS)[number];

const METRIC_KEY: Record<Metric, "winRate" | "expectancy" | "sharpe"> = {
  "Win Rate": "winRate",
  Expectancy: "expectancy",
  Sharpe: "sharpe",
};

export function RollingMetricsChartCard() {
  const trades = useFilteredTrades();
  const [metric, setMetric] = useState<Metric>("Win Rate");
  const windowSize = 20;

  const data = useMemo(() => rollingMetrics(trades, windowSize), [trades]);
  const key = METRIC_KEY[metric];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Rolling Metrics</CardTitle>
          <CardSubtitle>Trailing {windowSize}-trade window</CardSubtitle>
        </div>
        <Segmented options={METRICS} value={metric} onChange={setMetric} size="sm" />
      </CardHeader>
      {data.length === 0 ? (
        <EmptyState title="Not enough trades" description={`Need at least ${windowSize} trades in range.`} />
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 5" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => format(new Date(d), "MMM d")}
                stroke="var(--color-fg-subtle)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
              />
              <YAxis
                tickFormatter={(v) => (metric === "Win Rate" ? `${(v * 100).toFixed(0)}%` : v.toFixed(2))}
                stroke="var(--color-fg-subtle)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                contentStyle={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                labelFormatter={(d) => format(new Date(String(d)), "MMM d, yyyy")}
                formatter={(value) => {
                  const n = Number(value);
                  return [metric === "Win Rate" ? `${(n * 100).toFixed(1)}%` : n.toFixed(2), metric];
                }}
              />
              <Line type="monotone" dataKey={key} stroke="var(--color-accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
