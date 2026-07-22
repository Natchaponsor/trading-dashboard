"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { PnlText } from "@/components/ui/PnlText";
import { FormField, inputClass, textareaClass } from "./FormField";
import { useTradeStore } from "@/store/useTradeStore";
import { deriveTrade } from "@/lib/derive";
import { formatCurrency, formatR } from "@/lib/format";
import { SYMBOLS, SETUPS, GRADES, EMOTIONS, ALL_TAGS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { Emotion, Grade, Side, Trade } from "@/lib/types";

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nowLocal(): string {
  return toDatetimeLocal(new Date().toISOString());
}

interface FormState {
  symbol: string;
  side: Side;
  qty: string;
  entryPrice: string;
  exitPrice: string;
  entryTime: string;
  exitTime: string;
  fees: string;
  stop: string;
  target: string;
  mfe: string;
  mae: string;
  setup: string;
  tags: string[];
  grade: Grade;
  emotion: Emotion;
  confidence: number;
  followedPlan: boolean;
  thesis: string;
  reviewRight: string;
  reviewWrong: string;
  reviewThesisCorrect: boolean;
  reviewOneChange: string;
  account: string;
}

function defaultForm(): FormState {
  return {
    symbol: SYMBOLS[0],
    side: "long",
    qty: "100",
    entryPrice: "",
    exitPrice: "",
    entryTime: nowLocal(),
    exitTime: nowLocal(),
    fees: "1",
    stop: "",
    target: "",
    mfe: "0",
    mae: "0",
    setup: SETUPS[0],
    tags: [],
    grade: "B",
    emotion: "calm",
    confidence: 3,
    followedPlan: true,
    thesis: "",
    reviewRight: "",
    reviewWrong: "",
    reviewThesisCorrect: true,
    reviewOneChange: "",
    account: "Main",
  };
}

function tradeToForm(trade: Trade): FormState {
  return {
    symbol: trade.symbol,
    side: trade.side,
    qty: String(trade.qty),
    entryPrice: String(trade.entryPrice),
    exitPrice: String(trade.exitPrice),
    entryTime: toDatetimeLocal(trade.entryTime),
    exitTime: toDatetimeLocal(trade.exitTime),
    fees: String(trade.fees),
    stop: String(trade.stop),
    target: String(trade.target),
    mfe: String(trade.mfe),
    mae: String(trade.mae),
    setup: trade.setup,
    tags: trade.tags,
    grade: trade.grade,
    emotion: trade.emotion,
    confidence: trade.confidence,
    followedPlan: trade.followedPlan,
    thesis: trade.thesis,
    reviewRight: trade.review.right,
    reviewWrong: trade.review.wrong,
    reviewThesisCorrect: trade.review.thesisCorrect,
    reviewOneChange: trade.review.oneChange,
    account: trade.account,
  };
}

function num(s: string): number {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

interface TradeFormProps {
  existingTrade?: Trade;
}

export function TradeForm({ existingTrade }: TradeFormProps) {
  const router = useRouter();
  const addTrade = useTradeStore((s) => s.addTrade);
  const updateTrade = useTradeStore((s) => s.updateTrade);

  const [form, setForm] = useState<FormState>(() => (existingTrade ? tradeToForm(existingTrade) : defaultForm()));

  function patch(p: Partial<FormState>) {
    setForm((f) => ({ ...f, ...p }));
  }

  const previewTrade = useMemo(() => {
    const draft: Trade = {
      id: existingTrade?.id ?? "preview",
      symbol: form.symbol,
      side: form.side,
      qty: num(form.qty),
      entryPrice: num(form.entryPrice),
      exitPrice: num(form.exitPrice),
      entryTime: new Date(form.entryTime || 0).toISOString(),
      exitTime: new Date(form.exitTime || 0).toISOString(),
      fees: num(form.fees),
      stop: num(form.stop),
      target: num(form.target),
      mfe: num(form.mfe),
      mae: num(form.mae),
      setup: form.setup,
      tags: form.tags,
      grade: form.grade,
      emotion: form.emotion,
      confidence: form.confidence,
      followedPlan: form.followedPlan,
      thesis: form.thesis,
      review: {
        right: form.reviewRight,
        wrong: form.reviewWrong,
        thesisCorrect: form.reviewThesisCorrect,
        oneChange: form.reviewOneChange,
      },
      account: form.account,
      isSeed: false,
      createdAt: existingTrade?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return deriveTrade(draft);
  }, [form, existingTrade]);

  function toggleTag(tag: string) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trade: Trade = {
      id: existingTrade?.id ?? `user-${Date.now()}`,
      symbol: previewTrade.symbol,
      side: previewTrade.side,
      qty: previewTrade.qty,
      entryPrice: previewTrade.entryPrice,
      exitPrice: previewTrade.exitPrice,
      entryTime: previewTrade.entryTime,
      exitTime: previewTrade.exitTime,
      fees: previewTrade.fees,
      stop: previewTrade.stop,
      target: previewTrade.target,
      mfe: previewTrade.mfe,
      mae: previewTrade.mae,
      setup: previewTrade.setup,
      tags: previewTrade.tags,
      grade: previewTrade.grade,
      emotion: previewTrade.emotion,
      confidence: previewTrade.confidence,
      followedPlan: previewTrade.followedPlan,
      thesis: previewTrade.thesis,
      review: previewTrade.review,
      account: previewTrade.account,
      isSeed: false,
      createdAt: previewTrade.createdAt,
      updatedAt: new Date().toISOString(),
    };

    if (existingTrade) {
      updateTrade(existingTrade.id, trade);
    } else {
      addTrade(trade);
    }
    router.push(`/trades/${trade.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      <Card className="sticky top-[7.5rem] z-20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">Live Preview</p>
          <div className="mt-1 flex items-baseline gap-3">
            <PnlText
              value={previewTrade.netPnl}
              formatted={formatCurrency(previewTrade.netPnl, { signed: true })}
              className="text-xl"
            />
            <span className="text-sm text-fg-muted">{formatR(previewTrade.rMultiple, { signed: true })}</span>
          </div>
        </div>
        <Button type="submit" variant="primary">
          {existingTrade ? "Save changes" : "Log trade"}
        </Button>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Mechanical</CardTitle>
            <CardSubtitle>What actually happened</CardSubtitle>
          </div>
        </CardHeader>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FormField label="Symbol">
            <input
              list="symbol-options"
              value={form.symbol}
              onChange={(e) => patch({ symbol: e.target.value.toUpperCase() })}
              className={inputClass}
            />
            <datalist id="symbol-options">
              {SYMBOLS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </FormField>
          <FormField label="Side">
            <Segmented options={["long", "short"] as const} value={form.side} onChange={(v) => patch({ side: v })} />
          </FormField>
          <FormField label="Quantity">
            <input type="number" value={form.qty} onChange={(e) => patch({ qty: e.target.value })} className={inputClass} min={0} />
          </FormField>
          <FormField label="Entry price">
            <input type="number" step="0.01" value={form.entryPrice} onChange={(e) => patch({ entryPrice: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="Exit price">
            <input type="number" step="0.01" value={form.exitPrice} onChange={(e) => patch({ exitPrice: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="Fees">
            <input type="number" step="0.01" value={form.fees} onChange={(e) => patch({ fees: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="Entry time">
            <input type="datetime-local" value={form.entryTime} onChange={(e) => patch({ entryTime: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="Exit time">
            <input type="datetime-local" value={form.exitTime} onChange={(e) => patch({ exitTime: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="Account">
            <input value={form.account} onChange={(e) => patch({ account: e.target.value })} className={inputClass} />
          </FormField>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Risk & Plan</CardTitle>
            <CardSubtitle>What you planned for</CardSubtitle>
          </div>
        </CardHeader>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <FormField label="Stop">
            <input type="number" step="0.01" value={form.stop} onChange={(e) => patch({ stop: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="Target">
            <input type="number" step="0.01" value={form.target} onChange={(e) => patch({ target: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="MFE (per share)" hint="Best price move in your favor">
            <input type="number" step="0.01" value={form.mfe} onChange={(e) => patch({ mfe: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="MAE (per share)" hint="Worst price move against you">
            <input type="number" step="0.01" value={form.mae} onChange={(e) => patch({ mae: e.target.value })} className={inputClass} />
          </FormField>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Reflection</CardTitle>
            <CardSubtitle>Quick-pickers for the mental game</CardSubtitle>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <FormField label="Setup">
              <select value={form.setup} onChange={(e) => patch({ setup: e.target.value })} className={inputClass}>
                {SETUPS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Grade">
              <select value={form.grade} onChange={(e) => patch({ grade: e.target.value as Grade })} className={inputClass}>
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Emotion">
              <select value={form.emotion} onChange={(e) => patch({ emotion: e.target.value as Emotion })} className={inputClass}>
                {EMOTIONS.map((em) => (
                  <option key={em} value={em} className="capitalize">{em}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Confidence">
              <div className="flex h-9 items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => patch({ confidence: i + 1 })}
                    aria-label={`${i + 1} out of 5`}
                  >
                    <Star className={cn("h-5 w-5", i < form.confidence ? "fill-accent text-accent" : "text-border")} />
                  </button>
                ))}
              </div>
            </FormField>
          </div>

          <label className="flex items-center gap-2 text-sm text-fg-muted">
            <input
              type="checkbox"
              checked={form.followedPlan}
              onChange={(e) => patch({ followedPlan: e.target.checked })}
              className="h-4 w-4 rounded border-border accent-[var(--color-accent)]"
            />
            Followed my plan
          </label>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-fg-muted">Tags</span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    form.tags.includes(tag)
                      ? "border-accent/40 bg-accent/15 text-accent"
                      : "border-border bg-panel text-fg-muted hover:text-fg"
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <FormField label="Thesis">
            <textarea value={form.thesis} onChange={(e) => patch({ thesis: e.target.value })} className={textareaClass} rows={2} />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="What went right">
              <textarea value={form.reviewRight} onChange={(e) => patch({ reviewRight: e.target.value })} className={textareaClass} rows={2} />
            </FormField>
            <FormField label="What went wrong">
              <textarea value={form.reviewWrong} onChange={(e) => patch({ reviewWrong: e.target.value })} className={textareaClass} rows={2} />
            </FormField>
          </div>
          <FormField label="One change for next time">
            <textarea value={form.reviewOneChange} onChange={(e) => patch({ reviewOneChange: e.target.value })} className={textareaClass} rows={2} />
          </FormField>
          <label className="flex items-center gap-2 text-sm text-fg-muted">
            <input
              type="checkbox"
              checked={form.reviewThesisCorrect}
              onChange={(e) => patch({ reviewThesisCorrect: e.target.checked })}
              className="h-4 w-4 rounded border-border accent-[var(--color-accent)]"
            />
            Thesis was correct
          </label>
        </div>
      </Card>
    </form>
  );
}
