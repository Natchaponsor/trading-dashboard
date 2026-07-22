import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { PnlText } from "@/components/ui/PnlText";
import { formatCurrency, formatR, formatPct } from "@/lib/format";
import type { DerivedTrade } from "@/lib/types";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-fg-muted">{label}</span>
      <span className="font-medium tabular-nums text-fg">{value}</span>
    </div>
  );
}

export function RiskExcursionPanel({ trade }: { trade: DerivedTrade }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk & Excursion</CardTitle>
      </CardHeader>
      <div className="divide-y divide-border">
        <Row
          label="Realized R"
          value={<PnlText value={trade.rMultiple} formatted={formatR(trade.rMultiple, { signed: true })} />}
        />
        <Row label="Initial risk" value={formatCurrency(trade.initialRisk)} />
        <Row label="Planned R:R" value={`${trade.plannedRR.toFixed(2)}:1`} />
        <Row label="MFE" value={`${formatCurrency(trade.mfe)} (${trade.mfeR.toFixed(2)}R)`} />
        <Row label="MAE" value={`${formatCurrency(trade.mae)} (${trade.maeR.toFixed(2)}R)`} />
        <Row label="Capture rate" value={formatPct(trade.captureRate)} />
        <Row label="Return" value={formatPct(trade.returnPct, { signed: true })} />
      </div>
    </Card>
  );
}
