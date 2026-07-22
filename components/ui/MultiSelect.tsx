"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

interface MultiSelectProps {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function toggle(opt: string) {
    if (selected.includes(opt)) onChange(selected.filter((o) => o !== opt));
    else onChange([...selected, opt]);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-lg border border-border bg-panel px-3 text-sm text-fg-muted hover:text-fg transition-colors",
          selected.length > 0 && "border-accent/50 text-fg"
        )}
      >
        {label}
        {selected.length > 0 && (
          <span className="rounded-full bg-accent/15 text-accent px-1.5 text-xs">{selected.length}</span>
        )}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1.5 max-h-64 w-56 overflow-y-auto rounded-lg border border-border bg-panel py-1.5 shadow-lg">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-fg hover:bg-card"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="h-3.5 w-3.5 rounded border-border accent-[var(--color-accent)]"
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
