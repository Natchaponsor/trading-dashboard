"use client";

import { useTradeStore } from "@/store/useTradeStore";

export function useHydrated() {
  return useTradeStore((s) => s.hasHydrated);
}
