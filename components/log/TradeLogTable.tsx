"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, Download, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PnlText } from "@/components/ui/PnlText";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { useTradeStore } from "@/store/useTradeStore";
import { formatDuration, formatR } from "@/lib/format";
import { tradeValue, formatValue } from "@/lib/viewValue";
import { tradesToCsv, downloadCsv } from "@/lib/csv";
import { cn } from "@/lib/cn";
import type { DerivedTrade } from "@/lib/types";

type SortKey = "date" | "symbol" | "side" | "netPnl" | "r" | "mfeR" | "maeR" | "hold" | "setup" | "grade";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "symbol", label: "Symbol" },
  { key: "side", label: "Side" },
  { key: "netPnl", label: "Net P&L" },
  { key: "r", label: "R" },
  { key: "mfeR", label: "MFE/R" },
  { key: "maeR", label: "MAE/R" },
  { key: "hold", label: "Hold" },
  { key: "setup", label: "Setup" },
  { key: "grade", label: "Grade" },
];

function sortValue(t: DerivedTrade, key: SortKey): number | string {
  switch (key) {
    case "date":
      return new Date(t.entryTime).getTime();
    case "symbol":
      return t.symbol;
    case "side":
      return t.side;
    case "netPnl":
      return t.netPnl;
    case "r":
      return t.rMultiple;
    case "mfeR":
      return t.mfeR;
    case "maeR":
      return t.maeR;
    case "hold":
      return t.durationMin;
    case "setup":
      return t.setup;
    case "grade":
      return t.grade;
  }
}

export function TradeLogTable() {
  const trades = useFilteredTrades();
  const viewMode = useTradeStore((s) => s.viewMode);
  const grossNet = useTradeStore((s) => s.grossNet);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trades;
    return trades.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.setup.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [trades, search]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : av - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const totalNet = sorted.reduce((a, t) => a + t.netPnl, 0);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol, setup, tag…"
            className="h-9 w-full rounded-lg border border-border bg-panel pl-9 pr-3 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => downloadCsv(`trades-${Date.now()}.csv`, tradesToCsv(sorted))}
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="No trades found" description="Try adjusting your search or filters." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-fg-subtle">
                {COLUMNS.map((col) => (
                  <th key={col.key} className="px-4 py-2.5 font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="flex items-center gap-1 hover:text-fg-muted"
                    >
                      {col.label}
                      {sortKey === col.key &&
                        (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((t) => {
                const value = tradeValue(t, viewMode, grossNet);
                return (
                  <tr key={t.id} className="hover:bg-panel/50 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Link href={`/trades/${t.id}`} className="block text-fg-muted hover:text-accent">
                        {format(new Date(t.entryTime), "MMM d, yyyy")}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-fg">
                      <Link href={`/trades/${t.id}`}>{t.symbol}</Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={t.side === "long" ? "gain" : "loss"} className="uppercase">
                        {t.side}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">
                      <PnlText value={value} formatted={formatValue(value, viewMode, { signed: true })} />
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-fg-muted">{formatR(t.rMultiple, { signed: true })}</td>
                    <td className="px-4 py-2.5 tabular-nums text-fg-muted">{t.mfeR.toFixed(2)}</td>
                    <td className="px-4 py-2.5 tabular-nums text-fg-muted">{t.maeR.toFixed(2)}</td>
                    <td className="px-4 py-2.5 tabular-nums text-fg-muted">{formatDuration(t.durationMin)}</td>
                    <td className="px-4 py-2.5 text-fg-muted whitespace-nowrap">{t.setup}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "font-medium",
                          t.grade === "A+" || t.grade === "A" ? "text-gain" : t.grade === "B" ? "text-fg-muted" : "text-loss"
                        )}
                      >
                        {t.grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-fg-muted">
        <span>{sorted.length} trades</span>
        <PnlText value={totalNet} formatted={formatValue(totalNet, "$", { signed: true })} />
      </div>
    </Card>
  );
}
