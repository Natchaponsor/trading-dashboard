import { Check, X } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/format";
import type { DerivedTrade } from "@/lib/types";

export function PlanVsActualPanel({ trade }: { trade: DerivedTrade }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan vs Actual</CardTitle>
        <Badge tone={trade.followedPlan ? "gain" : "loss"}>
          {trade.followedPlan ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          {trade.followedPlan ? "Followed plan" : "Deviated"}
        </Badge>
      </CardHeader>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div />
        <div className="text-center text-xs font-medium uppercase tracking-wide text-fg-subtle">Planned</div>
        <div className="text-center text-xs font-medium uppercase tracking-wide text-fg-subtle">Actual</div>

        <div className="py-2 text-fg-muted">Stop</div>
        <div className="py-2 text-center tabular-nums text-fg">{formatCurrency(trade.stop)}</div>
        <div className="py-2 text-center tabular-nums text-fg-subtle">—</div>

        <div className="py-2 text-fg-muted">Target</div>
        <div className="py-2 text-center tabular-nums text-fg">{formatCurrency(trade.target)}</div>
        <div className="py-2 text-center tabular-nums text-fg">{formatCurrency(trade.exitPrice)}</div>

        <div className="py-2 text-fg-muted">R:R</div>
        <div className="py-2 text-center tabular-nums text-fg">{trade.plannedRR.toFixed(2)}</div>
        <div className="py-2 text-center tabular-nums text-fg">{trade.rMultiple.toFixed(2)}</div>
      </div>
      {trade.thesis && (
        <div className="mt-3 rounded-lg bg-panel p-3 text-sm text-fg-muted">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-fg-subtle">Thesis</span>
          {trade.thesis}
        </div>
      )}
    </Card>
  );
}
