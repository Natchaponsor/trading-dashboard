"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PnlText } from "@/components/ui/PnlText";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { formatCurrency } from "@/lib/format";

interface DayDrawerProps {
  date: string | null;
  onClose: () => void;
}

export function DayDrawer({ date, onClose }: DayDrawerProps) {
  const trades = useFilteredTrades();

  const dayTrades = useMemo(() => {
    if (!date) return [];
    return trades
      .filter((t) => t.exitTime.slice(0, 10) === date)
      .sort((a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime());
  }, [trades, date]);

  const net = dayTrades.reduce((a, t) => a + t.netPnl, 0);

  return (
    <AnimatePresence>
      {date && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-border bg-card p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-medium text-fg">
                  {format(new Date(date), "EEEE, MMM d")}
                </h2>
                <PnlText value={net} formatted={formatCurrency(net, { signed: true })} className="text-sm" />
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-fg-muted hover:bg-panel hover:text-fg">
                <X className="h-4 w-4" />
              </button>
            </div>

            <ul className="divide-y divide-border">
              {dayTrades.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/trades/${t.id}`}
                    className="flex items-center justify-between gap-3 py-2.5 hover:bg-panel/50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Badge tone={t.side === "long" ? "gain" : "loss"} className="uppercase">{t.side}</Badge>
                      <div>
                        <p className="font-medium text-fg">{t.symbol}</p>
                        <p className="text-xs text-fg-muted">{t.setup}</p>
                      </div>
                    </div>
                    <PnlText value={t.netPnl} formatted={formatCurrency(t.netPnl, { signed: true })} />
                  </Link>
                </li>
              ))}
              {dayTrades.length === 0 && <p className="py-4 text-sm text-fg-subtle">No trades this day.</p>}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
