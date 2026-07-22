"use client";

import { useMemo } from "react";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { useQuotes } from "@/hooks/useQuotes";
import { distinctSymbols } from "@/lib/filters";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { glyph } from "@/lib/format";
import { cn } from "@/lib/cn";

export function WatchlistStrip() {
  const trades = useFilteredTrades();
  const symbols = useMemo(() => distinctSymbols(trades), [trades]);
  const { quotes, isLoading, hasError } = useQuotes(symbols);

  if (symbols.length === 0) {
    return <EmptyState title="No symbols in view" description="Adjust filters to populate the watchlist." />;
  }

  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
      {symbols.map((symbol) => {
        const quote = quotes.get(symbol);
        const loading = isLoading && !quote;
        const unavailable = !loading && (!quote || quote.price === null);

        return (
          <div
            key={symbol}
            className="flex min-w-[132px] shrink-0 flex-col gap-1 rounded-xl border border-border bg-panel px-3.5 py-2.5"
          >
            <span className="text-xs font-medium text-fg-muted">{symbol}</span>
            {loading ? (
              <>
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-12" />
              </>
            ) : unavailable ? (
              <>
                <span className="font-serif text-lg text-fg-subtle">—</span>
                <span className="text-xs text-fg-subtle">{hasError ? "unavailable" : "no data"}</span>
              </>
            ) : (
              <>
                <span className="font-serif text-lg tabular-nums text-fg">${quote!.price!.toFixed(2)}</span>
                <span
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium tabular-nums",
                    quote!.changePct !== null && quote!.changePct! > 0
                      ? "text-gain"
                      : quote!.changePct !== null && quote!.changePct! < 0
                        ? "text-loss"
                        : "text-fg-muted"
                  )}
                >
                  {quote!.changePct !== null ? (
                    <>
                      {glyph(quote!.changePct!)} {Math.abs(quote!.changePct!).toFixed(2)}%
                    </>
                  ) : (
                    "—"
                  )}
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
