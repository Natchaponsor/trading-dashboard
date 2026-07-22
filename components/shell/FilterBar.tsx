"use client";

import { useState } from "react";
import { Eye, EyeOff, RotateCcw } from "lucide-react";
import { useTradeStore } from "@/store/useTradeStore";
import { useAllDerivedTrades } from "@/hooks/useFilteredTrades";
import { DATE_PRESETS, VIEW_MODES, SETUPS, ALL_TAGS, type DatePreset } from "@/lib/constants";
import { distinctSymbols } from "@/lib/filters";
import { Segmented } from "@/components/ui/Segmented";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Button } from "@/components/ui/Button";
import { FilterChips } from "./FilterChips";

const SIDE_OPTIONS = ["all", "long", "short"] as const;

export function FilterBar() {
  const filters = useTradeStore((s) => s.filters);
  const setFilters = useTradeStore((s) => s.setFilters);
  const viewMode = useTradeStore((s) => s.viewMode);
  const setViewMode = useTradeStore((s) => s.setViewMode);
  const grossNet = useTradeStore((s) => s.grossNet);
  const setGrossNet = useTradeStore((s) => s.setGrossNet);
  const hidePnl = useTradeStore((s) => s.hidePnl);
  const toggleHidePnl = useTradeStore((s) => s.toggleHidePnl);
  const resetDemo = useTradeStore((s) => s.resetDemo);

  const allTrades = useAllDerivedTrades();
  const symbols = distinctSymbols(allTrades);

  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <div className="sticky top-14 z-30 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={DATE_PRESETS.filter((p) => p !== "Custom") as readonly DatePreset[]}
            value={filters.datePreset === "Custom" ? "All" : filters.datePreset}
            onChange={(v) => setFilters({ datePreset: v })}
            size="sm"
          />

          <MultiSelect
            label="Symbol"
            options={symbols}
            selected={filters.symbols}
            onChange={(v) => setFilters({ symbols: v })}
          />
          <MultiSelect
            label="Setup"
            options={SETUPS}
            selected={filters.setups}
            onChange={(v) => setFilters({ setups: v })}
          />
          <MultiSelect
            label="Tag"
            options={ALL_TAGS}
            selected={filters.tags}
            onChange={(v) => setFilters({ tags: v })}
          />

          <Segmented
            options={SIDE_OPTIONS}
            value={filters.side}
            onChange={(v) => setFilters({ side: v })}
            size="sm"
          />

          <div className="ml-auto flex items-center gap-2">
            <Segmented options={VIEW_MODES} value={viewMode} onChange={setViewMode} size="sm" />
            <Segmented
              options={["gross", "net"] as const}
              value={grossNet}
              onChange={setGrossNet}
              size="sm"
            />
            <button
              type="button"
              onClick={toggleHidePnl}
              aria-pressed={hidePnl}
              title="Hide P&L (privacy mode)"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-panel text-fg-muted hover:text-fg transition-colors"
            >
              {hidePnl ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <Button
              variant={confirmingReset ? "danger" : "ghost"}
              size="sm"
              onClick={() => {
                if (confirmingReset) {
                  resetDemo();
                  setConfirmingReset(false);
                } else {
                  setConfirmingReset(true);
                  setTimeout(() => setConfirmingReset(false), 3000);
                }
              }}
              title="Reset demo data"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {confirmingReset ? "Confirm reset?" : "Reset demo"}
            </Button>
          </div>
        </div>

        <FilterChips />
      </div>
    </div>
  );
}
