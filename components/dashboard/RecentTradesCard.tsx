"use client";

import Link from "next/link";
import { useMemo } from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { PnlText } from "@/components/ui/PnlText";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { useTradeStore } from "@/store/useTradeStore";
import { tradeValue, formatValue } from "@/lib/viewValue";

export function RecentTradesCard() {
  const trades = useFilteredTrades();
  const viewMode = useTradeStore((s) => s.viewMode);
  const grossNet = useTradeStore((s) => s.grossNet);

  const recent = useMemo(
    () =>
      [...trades]
        .sort((a, b) => new Date(b.exitTime).getTime() - new Date(a.exitTime).getTime())
        .slice(0, 8),
    [trades]
  );

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Recent Trades</CardTitle>
          <CardSubtitle>Latest closed positions</CardSubtitle>
        </div>
        <Link href="/log" className="text-sm font-medium text-accent hover:text-accent-strong">
          View all
        </Link>
      </CardHeader>
      {recent.length === 0 ? (
        <EmptyState title="No trades yet" />
      ) : (
        <ul className="divide-y divide-border">
          {recent.map((t) => {
            const value = tradeValue(t, viewMode, grossNet);
            return (
              <li key={t.id}>
                <Link
                  href={`/trades/${t.id}`}
                  className="flex items-center justify-between gap-3 py-2.5 hover:bg-panel/50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge tone={t.side === "long" ? "gain" : "loss"} className="uppercase">
                      {t.side}
                    </Badge>
                    <div className="min-w-0">
                      <p className="font-medium text-fg truncate">{t.symbol}</p>
                      <p className="text-xs text-fg-muted truncate">{t.setup} · {format(new Date(t.exitTime), "MMM d")}</p>
                    </div>
                  </div>
                  <PnlText value={value} formatted={formatValue(value, viewMode, { signed: true })} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
