"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { useTradeStore } from "@/store/useTradeStore";
import { computeEquityCurve, computeDrawdownSeries } from "@/lib/metrics";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";

interface ChartPoint {
  date: string;
  equity: number;
  drawdown: number;
}

function EquityTooltip({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as ChartPoint;
  return (
    <div className="rounded-lg border border-border bg-panel px-3 py-2 text-xs shadow-lg">
      <p className="text-fg-muted">{format(new Date(String(label)), "MMM d, yyyy")}</p>
      <p className="font-medium text-fg tabular-nums">{formatCurrency(point.equity)}</p>
      {point.drawdown < 0 && (
        <p className="text-loss tabular-nums">{formatCurrency(point.drawdown)} drawdown</p>
      )}
    </div>
  );
}

export function EquityCurveCard() {
  const trades = useFilteredTrades();
  const grossNet = useTradeStore((s) => s.grossNet);

  const data = useMemo<ChartPoint[]>(() => {
    const equity = computeEquityCurve(trades);
    const drawdown = computeDrawdownSeries(equity);
    return equity.map((p, i) => ({
      date: p.date,
      equity: grossNet === "gross" ? p.cumulativeGross : p.cumulativeNet,
      drawdown: drawdown[i]?.drawdown ?? 0,
    }));
  }, [trades, grossNet]);

  const isPositive = data.length > 0 && data[data.length - 1].equity >= 0;
  const lineColor = isPositive ? "var(--color-gain)" : "var(--color-loss)";

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div>
          <CardTitle>Equity Curve</CardTitle>
          <CardSubtitle>Cumulative {grossNet} P&L with drawdown beneath</CardSubtitle>
        </div>
      </CardHeader>

      {data.length === 0 ? (
        <EmptyState title="No trades in range" description="Adjust filters to see the equity curve." />
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                <defs>
                  <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={lineColor} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  tickFormatter={(v) => formatCurrency(v)}
                  stroke="var(--color-fg-subtle)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                />
                <Tooltip content={<EquityTooltip />} cursor={{ stroke: "var(--color-accent)", strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke={lineColor}
                  strokeWidth={2}
                  fill="url(#equityFill)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 0, right: 8, bottom: 0, left: 8 }}>
                <Area
                  type="monotone"
                  dataKey="drawdown"
                  stroke="var(--color-loss)"
                  strokeWidth={1}
                  fill="var(--color-loss)"
                  fillOpacity={0.2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Card>
  );
}
