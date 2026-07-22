"use client";

import { useMemo } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import type { TooltipContentProps } from "recharts";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { rMultipleHistogram, type HistogramBucket } from "@/lib/aggregations";

function HistTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;
  const bucket = payload[0].payload as HistogramBucket;
  return (
    <div className="rounded-lg border border-border bg-panel px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-fg">{bucket.label} to {(bucket.max).toFixed(1)}R</p>
      <p className="tabular-nums text-fg-muted">{bucket.count} trades</p>
    </div>
  );
}

export function RHistogramCard() {
  const trades = useFilteredTrades();
  const buckets = useMemo(() => rMultipleHistogram(trades), [trades]);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>R-Multiple Distribution</CardTitle>
          <CardSubtitle>Realized R per trade</CardSubtitle>
        </div>
      </CardHeader>
      {buckets.length === 0 ? (
        <EmptyState title="No data" />
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="label" stroke="var(--color-fg-subtle)" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis stroke="var(--color-fg-subtle)" fontSize={11} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
              <ReferenceLine x="0.0R" stroke="var(--color-fg-subtle)" strokeDasharray="2 3" />
              <Tooltip content={<HistTooltip />} cursor={{ fill: "var(--color-panel)" }} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                {buckets.map((b) => (
                  <Cell key={b.label} fill={b.min >= 0 ? "var(--color-gain)" : "var(--color-loss)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
