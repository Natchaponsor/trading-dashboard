import { formatCurrency, formatPct, formatR } from "./format";
import type { ViewMode } from "./constants";
import type { GrossNet } from "@/store/useTradeStore";
import type { DerivedTrade } from "./types";

export function tradeValue(trade: DerivedTrade, mode: ViewMode, grossNet: GrossNet): number {
  if (mode === "R") return trade.rMultiple;
  const pnl = grossNet === "gross" ? trade.grossPnl : trade.netPnl;
  if (mode === "%") return trade.returnPct;
  return pnl;
}

export function formatValue(value: number, mode: ViewMode, opts: { signed?: boolean } = {}): string {
  if (mode === "R") return formatR(value, opts);
  if (mode === "%") return formatPct(value, opts);
  return formatCurrency(value, opts);
}
