"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PnlText } from "@/components/ui/PnlText";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { tagLeaderboard } from "@/lib/aggregations";
import { formatCurrency } from "@/lib/format";

export function TagLeaderboardCard() {
  const trades = useFilteredTrades();
  const rows = useMemo(() => tagLeaderboard(trades), [trades]);

  const profitable = rows.filter((r) => r.netPnl > 0).slice(0, 5);
  const costly = [...rows].filter((r) => r.netPnl < 0).sort((a, b) => a.netPnl - b.netPnl).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Tag Leaderboard</CardTitle>
          <CardSubtitle>Most profitable vs most costly behaviors</CardSubtitle>
        </div>
      </CardHeader>
      {rows.length === 0 ? (
        <EmptyState title="No tagged trades yet" />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-fg-subtle">Most profitable</p>
            <ul className="space-y-2">
              {profitable.map((row) => (
                <li key={row.tag} className="flex items-center justify-between text-sm">
                  <span className="text-fg-muted">#{row.tag} <span className="text-fg-subtle">({row.count})</span></span>
                  <PnlText value={row.netPnl} formatted={formatCurrency(row.netPnl, { signed: true })} />
                </li>
              ))}
              {profitable.length === 0 && <p className="text-sm text-fg-subtle">None</p>}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-fg-subtle">Most costly</p>
            <ul className="space-y-2">
              {costly.map((row) => (
                <li key={row.tag} className="flex items-center justify-between text-sm">
                  <span className="text-fg-muted">#{row.tag} <span className="text-fg-subtle">({row.count})</span></span>
                  <PnlText value={row.netPnl} formatted={formatCurrency(row.netPnl, { signed: true })} />
                </li>
              ))}
              {costly.length === 0 && <p className="text-sm text-fg-subtle">None</p>}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
