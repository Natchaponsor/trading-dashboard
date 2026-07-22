"use client";

import { useMemo } from "react";
import {
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { generateSyntheticPath } from "@/lib/syntheticPath";
import type { DerivedTrade } from "@/lib/types";

interface PriceChartProps {
  trade: DerivedTrade;
}

function ChartTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length || payload[0].value === undefined) return null;
  return (
    <div className="rounded-lg border border-border bg-panel px-2.5 py-1.5 text-xs shadow-lg">
      ${Number(payload[0].value).toFixed(2)}
    </div>
  );
}

export function PriceChart({ trade }: PriceChartProps) {
  const data = useMemo(() => generateSyntheticPath(trade), [trade]);
  const sign = trade.side === "long" ? 1 : -1;
  const favorableExtreme = trade.entryPrice + sign * trade.mfe;
  const adverseExtreme = trade.entryPrice - sign * trade.mae;

  const lineColor = trade.netPnl >= 0 ? "var(--color-gain)" : "var(--color-loss)";

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Price Action</CardTitle>
          <CardSubtitle>Synthetic path with entry/exit/stop/target and MFE/MAE band</CardSubtitle>
        </div>
      </CardHeader>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
            <XAxis
              dataKey="t"
              tickFormatter={(t) => `${t}m`}
              stroke="var(--color-fg-subtle)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={["dataMin - 0.5", "dataMax + 0.5"]}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              stroke="var(--color-fg-subtle)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <Tooltip content={<ChartTooltip />} />

            <ReferenceArea
              y1={Math.min(favorableExtreme, adverseExtreme)}
              y2={Math.max(favorableExtreme, adverseExtreme)}
              fill="var(--color-accent)"
              fillOpacity={0.06}
            />

            <ReferenceLine y={trade.stop} stroke="var(--color-loss)" strokeDasharray="4 4" label={{ value: "Stop", fill: "var(--color-loss)", fontSize: 11, position: "insideBottomLeft" }} />
            <ReferenceLine y={trade.target} stroke="var(--color-gain)" strokeDasharray="4 4" label={{ value: "Target", fill: "var(--color-gain)", fontSize: 11, position: "insideTopLeft" }} />
            <ReferenceLine y={trade.entryPrice} stroke="var(--color-fg-subtle)" label={{ value: "Entry", fill: "var(--color-fg-subtle)", fontSize: 11, position: "insideLeft" }} />

            <Line type="monotone" dataKey="price" stroke={lineColor} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
