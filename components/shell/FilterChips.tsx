"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useTradeStore } from "@/store/useTradeStore";

interface Chip {
  id: string;
  label: string;
  onRemove: () => void;
}

export function FilterChips() {
  const filters = useTradeStore((s) => s.filters);
  const setFilters = useTradeStore((s) => s.setFilters);
  const clearFilters = useTradeStore((s) => s.clearFilters);

  const chips: Chip[] = [];

  if (filters.datePreset !== "All") {
    chips.push({
      id: "date",
      label: filters.datePreset,
      onRemove: () => setFilters({ datePreset: "All" }),
    });
  }
  for (const symbol of filters.symbols) {
    chips.push({
      id: `symbol-${symbol}`,
      label: symbol,
      onRemove: () => setFilters({ symbols: filters.symbols.filter((s) => s !== symbol) }),
    });
  }
  for (const setup of filters.setups) {
    chips.push({
      id: `setup-${setup}`,
      label: setup,
      onRemove: () => setFilters({ setups: filters.setups.filter((s) => s !== setup) }),
    });
  }
  for (const tag of filters.tags) {
    chips.push({
      id: `tag-${tag}`,
      label: `#${tag}`,
      onRemove: () => setFilters({ tags: filters.tags.filter((t) => t !== tag) }),
    });
  }
  if (filters.side !== "all") {
    chips.push({
      id: "side",
      label: filters.side === "long" ? "Long only" : "Short only",
      onRemove: () => setFilters({ side: "all" }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <AnimatePresence initial={false}>
        {chips.map((chip) => (
          <motion.button
            key={chip.id}
            type="button"
            onClick={chip.onRemove}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/20"
          >
            {chip.label}
            <X className="h-3 w-3" />
          </motion.button>
        ))}
      </AnimatePresence>
      {chips.length > 1 && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-xs font-medium text-fg-subtle hover:text-fg-muted underline underline-offset-2"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
