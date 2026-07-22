"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { generateSeedTrades } from "@/lib/seed";
import { DEFAULT_FILTERS, type Filters } from "@/lib/filters";
import type { ViewMode } from "@/lib/constants";
import type { Trade } from "@/lib/types";

export type GrossNet = "gross" | "net";

interface TradeState {
  trades: Trade[];
  filters: Filters;
  viewMode: ViewMode;
  grossNet: GrossNet;
  hidePnl: boolean;
  weekStart: "Mon" | "Sun";
  hideWeekends: boolean;
  hasHydrated: boolean;

  setHasHydrated: (v: boolean) => void;
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  updateTrade: (id: string, patch: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  resetDemo: () => void;
  setFilters: (patch: Partial<Filters>) => void;
  clearFilters: () => void;
  setViewMode: (mode: ViewMode) => void;
  setGrossNet: (mode: GrossNet) => void;
  toggleHidePnl: () => void;
  setWeekStart: (v: "Mon" | "Sun") => void;
  toggleHideWeekends: () => void;
}

export const useTradeStore = create<TradeState>()(
  persist(
    (set, get) => ({
      trades: [],
      filters: DEFAULT_FILTERS,
      viewMode: "$",
      grossNet: "net",
      hidePnl: false,
      weekStart: "Mon",
      hideWeekends: false,
      hasHydrated: false,

      setHasHydrated: (v) => set({ hasHydrated: v }),
      setTrades: (trades) => set({ trades }),

      addTrade: (trade) =>
        set((state) => ({ trades: [...state.trades, trade] })),

      updateTrade: (id, patch) =>
        set((state) => ({
          trades: state.trades.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
          ),
        })),

      deleteTrade: (id) =>
        set((state) => ({ trades: state.trades.filter((t) => t.id !== id) })),

      resetDemo: () => set({ trades: generateSeedTrades() }),

      setFilters: (patch) =>
        set((state) => ({ filters: { ...state.filters, ...patch } })),

      clearFilters: () => set({ filters: DEFAULT_FILTERS }),

      setViewMode: (mode) => set({ viewMode: mode }),
      setGrossNet: (mode) => set({ grossNet: mode }),
      toggleHidePnl: () => set({ hidePnl: !get().hidePnl }),
      setWeekStart: (v) => set({ weekStart: v }),
      toggleHideWeekends: () => set({ hideWeekends: !get().hideWeekends }),
    }),
    {
      name: "trading-dashboard-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        trades: state.trades,
        filters: state.filters,
        viewMode: state.viewMode,
        grossNet: state.grossNet,
        hidePnl: state.hidePnl,
        weekStart: state.weekStart,
        hideWeekends: state.hideWeekends,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.trades.length === 0) {
          state.setTrades(generateSeedTrades());
        }
        state.setHasHydrated(true);
      },
    }
  )
);
