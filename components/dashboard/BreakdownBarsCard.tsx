"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import type { TooltipContentProps } from "recharts";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Segmented } from "@/components/ui/Segmented";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { useTradeStore } from "@/store/useTradeStore";
import { breakdownBySymbol, breakdownBySetup, breakdownByWeekday, WEEKDAY_LABELS, type BreakdownRow } from "@/lib/aggregations";
import { formatCurrency } from "@/lib/format";

const TABS = ["Symbol", "Setup", "Weekday"] as const;
type Tab = (typeof TABS)[number];

function BarTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as BreakdownRow;
  return (
    <div className="rounded-lg border border-border bg-panel px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-fg">{row.key}</p>
      <p className="tabular-nums text-fg-muted">
        {formatCurrency(row.netPnl)} · {(row.winRate * 100).toFixed(0)}% win · {row.count} trades
      </p>
    </div>
  );
}

export function BreakdownBarsCard() {
  const [tab, setTab] = useState<Tab>("Symbol");
  const trades = useFilteredTrades();
  const filters = useTradeStore((s) => s.filters);
  const setFilters = useTradeStore((s) => s.setFilters);

  const rows = useMemo(() => {
    if (tab === "Symbol") return breakdownBySymbol(trades);
    if (tab === "Setup") return breakdownBySetup(trades);
    return breakdownByWeekday(trades).map((r) => ({ ...r, key: WEEKDAY_LABELS[Number(r.key)] }));
  }, [tab, trades]);

  function handleBarClick(data?: { payload?: BreakdownRow }) {
    const row = data?.payload;
    if (!row) return;
    if (tab === "Symbol") {
      const set = new Set(filters.symbols);
      if (set.has(row.key)) set.delete(row.key);
      else set.add(row.key);
      setFilters({ symbols: Array.from(set) });
    } else if (tab === "Setup") {
      const set = new Set(filters.setups);
      if (set.has(row.key)) set.delete(row.key);
      else set.add(row.key);
      setFilters({ setups: Array.from(set) });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Performance Breakdown</CardTitle>
          <CardSubtitle>Click a bar to filter</CardSubtitle>
        </div>
        <Segmented options={TABS} value={tab} onChange={setTab} size="sm" />
      </CardHeader>
      {rows.length === 0 ? (
        <EmptyState title="No data" />
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="key" stroke="var(--color-fg-subtle)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={(v) => formatCurrency(v)}
                stroke="var(--color-fg-subtle)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={64}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: "var(--color-panel)" }} />
              <Bar dataKey="netPnl" radius={[4, 4, 0, 0]} onClick={handleBarClick} cursor="pointer" isAnimationActive={false}>
                {rows.map((row) => (
                  <Cell key={row.key} fill={row.netPnl >= 0 ? "var(--color-gain)" : "var(--color-loss)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
