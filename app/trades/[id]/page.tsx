"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useHydrated } from "@/hooks/useHydrated";
import { useAllDerivedTrades } from "@/hooks/useFilteredTrades";
import { useTradeStore } from "@/store/useTradeStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PnlText } from "@/components/ui/PnlText";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PriceChart } from "@/components/detail/PriceChart";
import { ExecutionPanel } from "@/components/detail/ExecutionPanel";
import { RiskExcursionPanel } from "@/components/detail/RiskExcursionPanel";
import { PlanVsActualPanel } from "@/components/detail/PlanVsActualPanel";
import { ReflectionPanel } from "@/components/detail/ReflectionPanel";
import { formatCurrency } from "@/lib/format";

export default function TradeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useHydrated();
  const allTrades = useAllDerivedTrades();
  const deleteTrade = useTradeStore((s) => s.deleteTrade);

  const sorted = useMemo(
    () => [...allTrades].sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime()),
    [allTrades]
  );

  const index = sorted.findIndex((t) => t.id === params.id);
  const trade = index >= 0 ? sorted[index] : undefined;
  const prev = index > 0 ? sorted[index - 1] : undefined;
  const next = index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : undefined;

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (!trade) {
    return <EmptyState title="Trade not found" description="It may have been deleted." action={<Link href="/log"><Button>Back to log</Button></Link>} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl font-medium text-fg">{trade.symbol}</h1>
          <Badge tone={trade.side === "long" ? "gain" : "loss"} className="uppercase">{trade.side}</Badge>
          <span className="text-sm text-fg-muted">{format(new Date(trade.entryTime), "MMM d, yyyy")}</span>
          <PnlText value={trade.netPnl} formatted={formatCurrency(trade.netPnl, { signed: true })} className="text-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={!prev}
            onClick={() => prev && router.push(`/trades/${prev.id}`)}
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!next}
            onClick={() => next && router.push(`/trades/${next.id}`)}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
          <Link href={`/trades/${trade.id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm("Delete this trade? This cannot be undone.")) {
                deleteTrade(trade.id);
                router.push("/log");
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      <PriceChart trade={trade} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ExecutionPanel trade={trade} />
        <RiskExcursionPanel trade={trade} />
        <PlanVsActualPanel trade={trade} />
      </div>

      <ReflectionPanel trade={trade} />
    </div>
  );
}
