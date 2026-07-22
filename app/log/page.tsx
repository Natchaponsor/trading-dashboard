"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { Skeleton } from "@/components/ui/Skeleton";
import { TradeLogTable } from "@/components/log/TradeLogTable";

export default function TradeLogPage() {
  const hydrated = useHydrated();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-medium text-fg">Trade Log</h1>
      {hydrated ? <TradeLogTable /> : <Skeleton className="h-96" />}
    </div>
  );
}
