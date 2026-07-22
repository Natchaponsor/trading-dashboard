import type { DerivedTrade } from "./types";

export interface EquityPoint {
  date: string; // ISO day
  cumulativeNet: number;
  cumulativeGross: number;
  tradeId: string;
}

export interface DrawdownPoint {
  date: string;
  drawdown: number; // negative or zero, $
  drawdownPct: number; // negative or zero
}

export interface Metrics {
  count: number;
  netPnl: number;
  grossPnl: number;
  winRate: number;
  wins: number;
  losses: number;
  breakevens: number;
  profitFactor: number;
  expectancy: number; // mean R
  avgWin: number;
  avgLoss: number;
  payoffRatio: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  sharpe: number;
  largestWin: number;
  largestLoss: number;
  longestWinStreak: number;
  longestLossStreak: number;
  avgHoldMin: number;
  bestDay: { date: string; net: number } | null;
  worstDay: { date: string; net: number } | null;
  avgCaptureRate: number;
  disciplineScore: number;
  adherenceRate: number;
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function sortByExit(trades: DerivedTrade[]) {
  return [...trades].sort(
    (a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime()
  );
}

export function computeEquityCurve(trades: DerivedTrade[]): EquityPoint[] {
  const sorted = sortByExit(trades);
  let cumulativeNet = 0;
  let cumulativeGross = 0;
  return sorted.map((t) => {
    cumulativeNet += t.netPnl;
    cumulativeGross += t.grossPnl;
    return {
      date: t.exitTime,
      cumulativeNet,
      cumulativeGross,
      tradeId: t.id,
    };
  });
}

export function computeDrawdownSeries(equity: EquityPoint[]): DrawdownPoint[] {
  let peak = 0;
  return equity.map((p) => {
    peak = Math.max(peak, p.cumulativeNet);
    const drawdown = p.cumulativeNet - peak;
    const drawdownPct = peak !== 0 ? drawdown / Math.max(Math.abs(peak), 1) : 0;
    return { date: p.date, drawdown, drawdownPct };
  });
}

function computeMaxDrawdown(equity: EquityPoint[]): { dollars: number; pct: number } {
  let peak = 0;
  let maxDd = 0;
  let maxDdPct = 0;
  for (const p of equity) {
    peak = Math.max(peak, p.cumulativeNet);
    const dd = p.cumulativeNet - peak;
    if (dd < maxDd) maxDd = dd;
    const base = Math.max(peak, 1);
    const ddPct = dd / base;
    if (ddPct < maxDdPct) maxDdPct = ddPct;
  }
  return { dollars: maxDd, pct: maxDdPct };
}

function computeStreaks(trades: DerivedTrade[]) {
  const sorted = sortByExit(trades);
  let longestWin = 0;
  let longestLoss = 0;
  let curWin = 0;
  let curLoss = 0;
  for (const t of sorted) {
    if (t.outcome === "win") {
      curWin += 1;
      curLoss = 0;
    } else if (t.outcome === "loss") {
      curLoss += 1;
      curWin = 0;
    } else {
      curWin = 0;
      curLoss = 0;
    }
    longestWin = Math.max(longestWin, curWin);
    longestLoss = Math.max(longestLoss, curLoss);
  }
  return { longestWin, longestLoss };
}

function computeDailyNet(trades: DerivedTrade[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of trades) {
    const key = dayKey(t.exitTime);
    map.set(key, (map.get(key) ?? 0) + t.netPnl);
  }
  return map;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/** Discipline score blends plan-adherence, grade, emotion regulation, and sizing consistency. */
function computeDisciplineScore(trades: DerivedTrade[]): number {
  if (trades.length === 0) return 0;

  const gradeScore: Record<string, number> = { "A+": 100, A: 85, B: 65, C: 35 };
  const calmEmotions = new Set(["calm", "confident"]);

  const qtys = trades.map((t) => t.qty);
  const meanQty = qtys.reduce((a, b) => a + b, 0) / qtys.length;
  const qtyStd = stdDev(qtys);
  const sizingConsistency = meanQty > 0 ? Math.max(0, 1 - qtyStd / meanQty) : 1;

  const scores = trades.map((t) => {
    const adherence = t.followedPlan ? 100 : 20;
    const grade = gradeScore[t.grade] ?? 50;
    const emotion = calmEmotions.has(t.emotion) ? 100 : 40;
    return adherence * 0.4 + grade * 0.3 + emotion * 0.2 + sizingConsistency * 100 * 0.1;
  });

  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function computeMetrics(trades: DerivedTrade[]): Metrics {
  const count = trades.length;
  if (count === 0) {
    return {
      count: 0,
      netPnl: 0,
      grossPnl: 0,
      winRate: 0,
      wins: 0,
      losses: 0,
      breakevens: 0,
      profitFactor: 0,
      expectancy: 0,
      avgWin: 0,
      avgLoss: 0,
      payoffRatio: 0,
      maxDrawdown: 0,
      maxDrawdownPct: 0,
      sharpe: 0,
      largestWin: 0,
      largestLoss: 0,
      longestWinStreak: 0,
      longestLossStreak: 0,
      avgHoldMin: 0,
      bestDay: null,
      worstDay: null,
      avgCaptureRate: 0,
      disciplineScore: 0,
      adherenceRate: 0,
    };
  }

  const wins = trades.filter((t) => t.outcome === "win");
  const losses = trades.filter((t) => t.outcome === "loss");
  const breakevens = trades.filter((t) => t.outcome === "breakeven");

  const netPnl = trades.reduce((a, t) => a + t.netPnl, 0);
  const grossPnl = trades.reduce((a, t) => a + t.grossPnl, 0);

  const grossProfit = wins.reduce((a, t) => a + t.netPnl, 0);
  const grossLoss = Math.abs(losses.reduce((a, t) => a + t.netPnl, 0));

  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
  const expectancy = trades.reduce((a, t) => a + t.rMultiple, 0) / count;

  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const payoffRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

  const equity = computeEquityCurve(trades);
  const { dollars: maxDrawdown, pct: maxDrawdownPct } = computeMaxDrawdown(equity);

  const dailyNet = computeDailyNet(trades);
  const dailyReturns = Array.from(dailyNet.values());
  const meanDaily = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const dailyStd = stdDev(dailyReturns);
  const sharpe = dailyStd > 0 ? (meanDaily / dailyStd) * Math.sqrt(252) : 0;

  const largestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.netPnl)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map((t) => t.netPnl)) : 0;

  const { longestWin, longestLoss } = computeStreaks(trades);

  const avgHoldMin = trades.reduce((a, t) => a + t.durationMin, 0) / count;

  let bestDay: { date: string; net: number } | null = null;
  let worstDay: { date: string; net: number } | null = null;
  for (const [date, net] of dailyNet.entries()) {
    if (!bestDay || net > bestDay.net) bestDay = { date, net };
    if (!worstDay || net < worstDay.net) worstDay = { date, net };
  }

  const captureRates = trades.filter((t) => Number.isFinite(t.captureRate));
  const avgCaptureRate =
    captureRates.length > 0
      ? captureRates.reduce((a, t) => a + t.captureRate, 0) / captureRates.length
      : 0;

  const adherenceRate = trades.filter((t) => t.followedPlan).length / count;
  const disciplineScore = computeDisciplineScore(trades);

  return {
    count,
    netPnl,
    grossPnl,
    winRate: wins.length / count,
    wins: wins.length,
    losses: losses.length,
    breakevens: breakevens.length,
    profitFactor,
    expectancy,
    avgWin,
    avgLoss,
    payoffRatio,
    maxDrawdown,
    maxDrawdownPct,
    sharpe,
    largestWin,
    largestLoss,
    longestWinStreak: longestWin,
    longestLossStreak: longestLoss,
    avgHoldMin,
    bestDay,
    worstDay,
    avgCaptureRate,
    disciplineScore,
    adherenceRate,
  };
}
