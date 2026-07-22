"use client";

import { useMemo } from "react";
import { StatCard } from "./StatCard";
import { Sparkline } from "@/components/charts/Sparkline";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { useTradeStore } from "@/store/useTradeStore";
import { computeMetrics, computeEquityCurve } from "@/lib/metrics";
import { formatCurrency, formatPct, formatR, formatDuration } from "@/lib/format";
import { formatValue } from "@/lib/viewValue";

export function KpiScorecard() {
  const trades = useFilteredTrades();
  const viewMode = useTradeStore((s) => s.viewMode);
  const grossNet = useTradeStore((s) => s.grossNet);

  const metrics = useMemo(() => computeMetrics(trades), [trades]);
  const equity = useMemo(() => computeEquityCurve(trades), [trades]);
  const sparklineData = useMemo(
    () => equity.map((p) => ({ value: grossNet === "gross" ? p.cumulativeGross : p.cumulativeNet })),
    [equity, grossNet]
  );

  const netPnlValue =
    viewMode === "R"
      ? trades.reduce((a, t) => a + t.rMultiple, 0)
      : viewMode === "%"
        ? trades.reduce((a, t) => a + t.returnPct, 0)
        : grossNet === "gross"
          ? metrics.grossPnl
          : metrics.netPnl;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <StatCard
        label="Net P&L"
        value={netPnlValue}
        format={(n) => formatValue(n, viewMode, { signed: true })}
        tone="auto"
        sparkline={<Sparkline data={sparklineData} color={netPnlValue >= 0 ? "var(--color-gain)" : "var(--color-loss)"} />}
      />
      <StatCard
        label="Win Rate"
        value={metrics.winRate * 100}
        format={(n) => `${n.toFixed(1)}%`}
        subtext={`${metrics.wins}W / ${metrics.losses}L / ${metrics.breakevens}BE`}
      />
      <StatCard
        label="Profit Factor"
        value={Number.isFinite(metrics.profitFactor) ? metrics.profitFactor : 0}
        format={(n) => (Number.isFinite(metrics.profitFactor) ? n.toFixed(2) : "∞")}
        subtext={metrics.profitFactor > 2 ? "Excellent" : metrics.profitFactor > 1.5 ? "Solid" : metrics.profitFactor < 1 ? "Losing" : "Marginal"}
      />
      <StatCard
        label="Expectancy"
        value={metrics.expectancy}
        format={(n) => formatR(n, { signed: true })}
        tone="auto"
      />
      <StatCard
        label="Avg Win / Loss"
        value={metrics.payoffRatio}
        format={(n) => (Number.isFinite(n) ? `${n.toFixed(2)}x` : "∞")}
        subtext={`${formatCurrency(metrics.avgWin)} / ${formatCurrency(metrics.avgLoss)}`}
      />
      <StatCard
        label="Max Drawdown"
        value={metrics.maxDrawdown}
        format={(n) => formatCurrency(n)}
        tone="auto"
        subtext={formatPct(metrics.maxDrawdownPct)}
      />
      <StatCard
        label="Sharpe (ann.)"
        value={metrics.sharpe}
        format={(n) => n.toFixed(2)}
        tone="auto"
      />
      <StatCard
        label="Discipline Score"
        value={metrics.disciplineScore}
        format={(n) => Math.round(n).toString()}
        subtext={`${formatPct(metrics.adherenceRate)} adherence · avg hold ${formatDuration(metrics.avgHoldMin)}`}
      />
    </div>
  );
}
