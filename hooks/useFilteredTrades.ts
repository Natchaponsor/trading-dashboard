"use client";

import { useMemo } from "react";
import { useTradeStore } from "@/store/useTradeStore";
import { deriveTrades } from "@/lib/derive";
import { applyFilters } from "@/lib/filters";
import { computeMetrics } from "@/lib/metrics";

export function useAllDerivedTrades() {
  const trades = useTradeStore((s) => s.trades);
  return useMemo(() => deriveTrades(trades), [trades]);
}

export function useFilteredTrades() {
  const all = useAllDerivedTrades();
  const filters = useTradeStore((s) => s.filters);
  return useMemo(() => applyFilters(all, filters), [all, filters]);
}

export function useFilteredMetrics() {
  const filtered = useFilteredTrades();
  return useMemo(() => computeMetrics(filtered), [filtered]);
}
