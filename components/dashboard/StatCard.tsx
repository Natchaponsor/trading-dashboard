"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import { useTradeStore } from "@/store/useTradeStore";
import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: number;
  format: (n: number) => string;
  tone?: "neutral" | "auto";
  sparkline?: ReactNode;
  subtext?: string;
}

export function StatCard({ label, value, format, tone = "neutral", sparkline, subtext }: StatCardProps) {
  const hidePnl = useTradeStore((s) => s.hidePnl);
  const toneClass =
    tone === "auto"
      ? value > 0
        ? "text-gain"
        : value < 0
          ? "text-loss"
          : "text-fg"
      : "text-fg";

  return (
    <Card className="flex flex-col gap-2 hover:border-fg-subtle/50 transition-colors duration-150">
      <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">{label}</p>
      <div className={cn("font-serif text-2xl font-medium tabular-nums", toneClass)}>
        {hidePnl ? "••••" : <CountUp value={value} format={format} />}
      </div>
      {subtext && <p className="text-xs text-fg-muted">{subtext}</p>}
      {sparkline && <div className="mt-1 h-10">{sparkline}</div>}
    </Card>
  );
}
