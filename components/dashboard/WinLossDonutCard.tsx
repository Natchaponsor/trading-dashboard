"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { computeMetrics } from "@/lib/metrics";
import { formatCurrency } from "@/lib/format";

export function WinLossDonutCard() {
  const trades = useFilteredTrades();
  const metrics = useMemo(() => computeMetrics(trades), [trades]);

  const pieData = [
    { name: "Wins", value: metrics.wins, color: "var(--color-gain)" },
    { name: "Losses", value: metrics.losses, color: "var(--color-loss)" },
    { name: "Breakeven", value: metrics.breakevens, color: "var(--color-fg-subtle)" },
  ].filter((d) => d.value > 0);

  const maxBar = Math.max(metrics.avgWin, metrics.avgLoss, 1);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Win / Loss</CardTitle>
          <CardSubtitle>Outcome mix and payoff</CardSubtitle>
        </div>
      </CardHeader>
      {trades.length === 0 ? (
        <EmptyState title="No data" />
      ) : (
        <div className="flex items-center gap-6">
          <div className="h-40 w-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  isAnimationActive={false}
                >
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={d.color} stroke="var(--color-card)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0];
                    return (
                      <div className="rounded-lg border border-border bg-panel px-2.5 py-1.5 text-xs shadow-lg">
                        {p.name}: {p.value}
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-fg-muted">
                <span className="h-2 w-2 rounded-full bg-gain" /> Win rate
              </span>
              <span className="font-medium tabular-nums text-fg">{(metrics.winRate * 100).toFixed(1)}%</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-fg-muted">
                <span>Avg win</span>
                <span className="tabular-nums text-gain">{formatCurrency(metrics.avgWin)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-panel overflow-hidden">
                <div className="h-full bg-gain rounded-full" style={{ width: `${(metrics.avgWin / maxBar) * 100}%` }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-fg-muted">
                <span>Avg loss</span>
                <span className="tabular-nums text-loss">{formatCurrency(metrics.avgLoss)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-panel overflow-hidden">
                <div className="h-full bg-loss rounded-full" style={{ width: `${(metrics.avgLoss / maxBar) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
