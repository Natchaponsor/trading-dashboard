import { breakdownBySetup, breakdownBySymbol, weekdayHourHeatmap, WEEKDAY_LABELS } from "./aggregations";
import { computeMetrics } from "./metrics";
import { formatCurrency } from "./format";
import type { DerivedTrade } from "./types";

export interface Insight {
  id: string;
  text: string;
  tone: "positive" | "negative" | "neutral";
}

function hourLabel(hour: number): string {
  const period = hour >= 12 ? "pm" : "am";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}${period}`;
}

export function generateInsights(trades: DerivedTrade[]): Insight[] {
  const insights: Insight[] = [];
  if (trades.length < 5) return insights;

  const followed = trades.filter((t) => t.followedPlan);
  const notFollowed = trades.filter((t) => !t.followedPlan);
  if (followed.length > 3 && notFollowed.length > 3) {
    const mFollowed = computeMetrics(followed);
    const mNot = computeMetrics(notFollowed);
    if (mNot.netPnl < 0 && mFollowed.expectancy > mNot.expectancy) {
      insights.push({
        id: "plan-adherence",
        text: `Off-plan trades cost you ${formatCurrency(Math.abs(mNot.netPnl))} — expectancy drops from ${mFollowed.expectancy.toFixed(2)}R (plan followed) to ${mNot.expectancy.toFixed(2)}R (plan broken).`,
        tone: "negative",
      });
    }
  }

  const heatmap = weekdayHourHeatmap(trades).filter((c) => c.count >= 3);
  const worstCell = heatmap.reduce<(typeof heatmap)[number] | null>((worst, c) => {
    if (!worst || c.expectancy < worst.expectancy) return c;
    return worst;
  }, null);
  if (worstCell && worstCell.expectancy < 0) {
    insights.push({
      id: "weak-window",
      text: `You lose most trading ${WEEKDAY_LABELS[worstCell.weekday]}s around ${hourLabel(worstCell.hour)} — expectancy is ${worstCell.expectancy.toFixed(2)}R in that window.`,
      tone: "negative",
    });
  }

  const bestCell = heatmap.reduce<(typeof heatmap)[number] | null>((best, c) => {
    if (!best || c.expectancy > best.expectancy) return c;
    return best;
  }, null);
  if (bestCell && bestCell.expectancy > 0.3) {
    insights.push({
      id: "strong-window",
      text: `Your best window is ${WEEKDAY_LABELS[bestCell.weekday]}s around ${hourLabel(bestCell.hour)} — expectancy of ${bestCell.expectancy.toFixed(2)}R there.`,
      tone: "positive",
    });
  }

  const bySetup = breakdownBySetup(trades).filter((s) => s.count >= 5);
  if (bySetup.length > 1) {
    const best = bySetup[0];
    const worst = bySetup[bySetup.length - 1];
    if (best.netPnl > 0) {
      insights.push({
        id: "best-setup",
        text: `"${best.key}" is your most profitable setup — ${formatCurrency(best.netPnl)} net across ${best.count} trades at a ${(best.winRate * 100).toFixed(0)}% win rate.`,
        tone: "positive",
      });
    }
    if (worst.netPnl < 0) {
      insights.push({
        id: "worst-setup",
        text: `"${worst.key}" is dragging on results — ${formatCurrency(Math.abs(worst.netPnl))} net loss across ${worst.count} trades.`,
        tone: "negative",
      });
    }
  }

  const bySymbol = breakdownBySymbol(trades).filter((s) => s.count >= 5);
  const worstSymbol = bySymbol[bySymbol.length - 1];
  if (worstSymbol && worstSymbol.netPnl < 0) {
    insights.push({
      id: "worst-symbol",
      text: `${worstSymbol.key} has cost you ${formatCurrency(Math.abs(worstSymbol.netPnl))} over ${worstSymbol.count} trades — worth reviewing why.`,
      tone: "negative",
    });
  }

  const oversized = trades.filter((t) => t.tags.includes("oversized"));
  if (oversized.length > 2) {
    const m = computeMetrics(oversized);
    if (m.netPnl < 0) {
      insights.push({
        id: "oversized",
        text: `"Oversized" trades cost you ${formatCurrency(Math.abs(m.netPnl))} across ${m.count} trades — sizing discipline matters most when it feels most tempting to break it.`,
        tone: "negative",
      });
    }
  }

  return insights.slice(0, 6);
}
