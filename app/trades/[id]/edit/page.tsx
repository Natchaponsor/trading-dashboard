"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useHydrated } from "@/hooks/useHydrated";
import { useAllDerivedTrades } from "@/hooks/useFilteredTrades";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { TradeForm } from "@/components/form/TradeForm";

export default function EditTradePage() {
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const trades = useAllDerivedTrades();

  if (!hydrated) return <Skeleton className="h-96" />;

  const trade = trades.find((t) => t.id === params.id);
  if (!trade) {
    return (
      <EmptyState
        title="Trade not found"
        action={
          <Link href="/log">
            <Button>Back to log</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-medium text-fg">Edit Trade — {trade.symbol}</h1>
      <TradeForm existingTrade={trade} />
    </div>
  );
}
