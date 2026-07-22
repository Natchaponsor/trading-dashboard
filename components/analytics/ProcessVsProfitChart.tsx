"use client";

import { useMemo } from "react";
import { ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { processVsProfit } from "@/lib/aggregations";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";

export function ProcessVsProfitChartCard() {
  const trades = useFilteredTrades();
  const data = useMemo(() => processVsProfit(trades), [trades]);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Process vs Profit</CardTitle>
          <CardSubtitle>Cumulative net P&L alongside your running execution grade</CardSubtitle>
        </div>
      </CardHeader>
      {data.length === 0 ? (
        <EmptyState title="No data" />
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
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
                yAxisId="money"
                tickFormatter={(v) => formatCurrency(v)}
                stroke="var(--color-fg-subtle)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={64}
              />
              <YAxis
                yAxisId="score"
                orientation="right"
                domain={[0, 100]}
                stroke="var(--color-fg-subtle)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                labelFormatter={(d) => format(new Date(String(d)), "MMM d, yyyy")}
                formatter={(value, name) =>
                  name === "cumulativeNet"
                    ? [formatCurrency(Number(value)), "Net P&L"]
                    : [Math.round(Number(value)), "Discipline"]
                }
              />
              <Line yAxisId="money" type="monotone" dataKey="cumulativeNet" stroke="var(--color-accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line yAxisId="score" type="monotone" dataKey="disciplineScore" stroke="var(--color-fg-muted)" strokeWidth={1.5} dot={false} strokeDasharray="4 3" isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
