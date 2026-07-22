import { Star } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { DerivedTrade } from "@/lib/types";

export function ReflectionPanel({ trade }: { trade: DerivedTrade }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reflection</CardTitle>
      </CardHeader>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{trade.grade}</Badge>
          <Badge tone="neutral" className="capitalize">{trade.emotion}</Badge>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn("h-3.5 w-3.5", i < trade.confidence ? "fill-accent text-accent" : "text-border")}
              />
            ))}
          </div>
        </div>

        {trade.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {trade.tags.map((tag) => (
              <Badge key={tag} tone="neutral">#{tag}</Badge>
            ))}
          </div>
        )}

        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-fg-subtle">What went right</dt>
            <dd className="mt-0.5 text-fg-muted">{trade.review.right}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-fg-subtle">What went wrong</dt>
            <dd className="mt-0.5 text-fg-muted">{trade.review.wrong}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-fg-subtle">One change</dt>
            <dd className="mt-0.5 text-fg-muted">{trade.review.oneChange}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-fg-subtle">Thesis correct?</dt>
            <dd className="mt-0.5 text-fg-muted">{trade.review.thesisCorrect ? "Yes" : "No"}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
