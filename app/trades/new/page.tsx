"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { Skeleton } from "@/components/ui/Skeleton";
import { TradeForm } from "@/components/form/TradeForm";

export default function NewTradePage() {
  const hydrated = useHydrated();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-medium text-fg">Log Trade</h1>
      {hydrated ? <TradeForm /> : <Skeleton className="h-96" />}
    </div>
  );
}
