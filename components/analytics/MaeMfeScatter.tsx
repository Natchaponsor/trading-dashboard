"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { CartesianGrid, Cell, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis, ReferenceLine } from "recharts";
import type { TooltipContentProps } from "recharts";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { formatR } from "@/lib/format";
import type { DerivedTrade } from "@/lib/types";

function ScatterTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;
  const trade = payload[0].payload as DerivedTrade;
  return (
    <div className="rounded-lg border border-border bg-panel px-2.5 py-1.5 text-xs shadow-lg">
      <p className="font-medium text-fg">{trade.symbol}</p>
      <p className="text-fg-muted">MAE {trade.maeR.toFixed(2)}R · Result {formatR(trade.rMultiple, { signed: true })}</p>
    </div>
  );
}

export function MaeMfeScatterCard() {
  const trades = useFilteredTrades();
  const router = useRouter();

  const data = useMemo(() => trades.filter((t) => Number.isFinite(t.maeR) && Number.isFinite(t.rMultiple)), [trades]);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>MAE vs Realized R</CardTitle>
          <CardSubtitle>How much heat you take vs the outcome — click a point for detail</CardSubtitle>
        </div>
      </CardHeader>
      {data.length === 0 ? (
        <EmptyState title="No data" />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 5" />
              <XAxis
                type="number"
                dataKey="maeR"
                name="MAE"
                unit="R"
                stroke="var(--color-fg-subtle)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="number"
                dataKey="rMultiple"
                name="Realized R"
                stroke="var(--color-fg-subtle)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <ZAxis range={[40, 40]} />
              <ReferenceLine y={0} stroke="var(--color-fg-subtle)" strokeDasharray="2 3" />
              <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: "3 3" }} />
              <Scatter
                data={data}
                onClick={(point?: { payload?: DerivedTrade }) => {
                  const id = point?.payload?.id;
                  if (id) router.push(`/trades/${id}`);
                }}
                cursor="pointer"
                isAnimationActive={false}
              >
                {data.map((t) => (
                  <Cell key={t.id} fill={t.rMultiple >= 0 ? "var(--color-gain)" : "var(--color-loss)"} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
