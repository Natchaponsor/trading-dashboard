import { format } from "date-fns";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency, formatDuration } from "@/lib/format";
import type { DerivedTrade } from "@/lib/types";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-fg-muted">{label}</span>
      <span className="font-medium tabular-nums text-fg">{value}</span>
    </div>
  );
}

export function ExecutionPanel({ trade }: { trade: DerivedTrade }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution</CardTitle>
      </CardHeader>
      <div className="divide-y divide-border">
        <Row label="Symbol" value={trade.symbol} />
        <Row label="Side" value={trade.side.toUpperCase()} />
        <Row label="Quantity" value={trade.qty} />
        <Row label="Entry price" value={formatCurrency(trade.entryPrice)} />
        <Row label="Exit price" value={formatCurrency(trade.exitPrice)} />
        <Row label="Entry time" value={format(new Date(trade.entryTime), "MMM d, h:mm a")} />
        <Row label="Exit time" value={format(new Date(trade.exitTime), "MMM d, h:mm a")} />
        <Row label="Duration" value={formatDuration(trade.durationMin)} />
        <Row label="Fees" value={formatCurrency(trade.fees)} />
        <Row label="Account" value={trade.account} />
      </div>
    </Card>
  );
}
