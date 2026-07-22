import { ALL_TAGS, MARKET_CONDITION_TAGS, MISTAKE_TAGS, QUALITY_TAGS, SETUPS, SYMBOLS } from "./constants";
import { mulberry32, randFloat, randInt, pick, chance, gaussian, type Random } from "./rng";
import type { Emotion, Grade, Side, Trade } from "./types";

export const SEED = 20260721;
export const TRADE_COUNT = 300;

/** Weak hours (ET) where the seeded account performs worse — a discoverable pattern. */
const WEAK_HOURS = new Set([11, 12, 13]);
/** Weak weekday (0=Sun..6=Sat) — Monday tends to be choppier for this account. */
const WEAK_WEEKDAY = 1;

interface SymbolProfile {
  base: number;
  volPct: number; // typical intraday % move used to size stops
}

const SYMBOL_PROFILES: Record<(typeof SYMBOLS)[number], SymbolProfile> = {
  AAPL: { base: 205, volPct: 0.014 },
  NVDA: { base: 145, volPct: 0.032 },
  MSFT: { base: 430, volPct: 0.014 },
  TSLA: { base: 260, volPct: 0.038 },
  SPY: { base: 565, volPct: 0.009 },
  QQQ: { base: 490, volPct: 0.012 },
  AMD: { base: 165, volPct: 0.03 },
  META: { base: 560, volPct: 0.024 },
  AMZN: { base: 195, volPct: 0.02 },
  GOOGL: { base: 180, volPct: 0.019 },
};

function randomEntryDate(rng: Random, now: Date): Date {
  const daysAgo = randInt(rng, 1, 364);
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);

  const dow = d.getDay();
  if (dow === 0) d.setDate(d.getDate() + 1);
  if (dow === 6) d.setDate(d.getDate() - 1);

  const hour = randInt(rng, 9, 15);
  const minute = hour === 9 ? randInt(rng, 30, 59) : randInt(rng, 0, 59);
  d.setHours(hour, minute, randInt(rng, 0, 59), 0);
  return d;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function thesisFor(setup: string, symbol: string, side: Side, rng: Random): string {
  const templates = [
    `${symbol} showing ${side === "long" ? "relative strength" : "relative weakness"} into the ${setup} level; plan is to ${side === "long" ? "buy" : "short"} the trigger with a defined stop.`,
    `Clean ${setup} setup on ${symbol}, volume confirming, sizing to the stop distance.`,
    `Waiting for ${symbol} to tag the ${setup} trigger; higher timeframe trend is ${side === "long" ? "up" : "down"}.`,
  ];
  return pick(rng, templates);
}

function reviewFor(followedPlan: boolean, win: boolean, rng: Random) {
  const right = followedPlan
    ? pick(rng, ["Waited for the trigger", "Sized to the plan", "Cut losers fast", "Let the winner run to target"])
    : pick(rng, ["Recognized the setup early", "Got in the right direction"]);
  const wrong = followedPlan
    ? win
      ? pick(rng, ["Nothing major", "Could have added at the retest"])
      : pick(rng, ["Setup just didn't work", "Market regime shifted mid-trade"])
    : pick(rng, ["Sized too big for the setup", "Chased the entry past the trigger", "Moved the stop instead of exiting", "Entered without a clear trigger"]);
  const oneChange = followedPlan
    ? pick(rng, ["Keep doing exactly this", "Consider scaling out at 1R"])
    : pick(rng, ["Wait for the actual trigger next time", "Pre-define size before entering", "Walk away after the stop is hit, no revenge trade"]);
  return { right, wrong, thesisCorrect: win, oneChange };
}

export function generateSeedTrades(now: Date = new Date()): Trade[] {
  const rng = mulberry32(SEED);
  const trades: Trade[] = [];

  for (let i = 0; i < TRADE_COUNT; i++) {
    const symbol = pick(rng, SYMBOLS);
    const profile = SYMBOL_PROFILES[symbol];
    const setup = pick(rng, SETUPS);
    const side: Side = chance(rng, 0.68) ? "long" : "short";
    const sign = side === "long" ? 1 : -1;

    const entryTime = randomEntryDate(rng, now);
    const weekday = entryTime.getDay();
    const hour = entryTime.getHours();

    const followedPlan = chance(rng, 0.78);

    let winProb = 0.6;
    if (!followedPlan) winProb -= 0.16;
    if (WEAK_HOURS.has(hour)) winProb -= 0.08;
    if (weekday === WEAK_WEEKDAY) winProb -= 0.05;
    winProb = Math.min(0.85, Math.max(0.12, winProb));

    const roll = rng();
    const isBreakeven = chance(rng, 0.04);
    const win = !isBreakeven && roll < winProb;

    const priceJitter = 1 + gaussian(rng, 0, profile.volPct * 0.4);
    const entryPrice = Math.max(1, profile.base * priceJitter);
    const stopDistancePct = randFloat(rng, profile.volPct * 0.35, profile.volPct * 0.9);
    const stopDistance = entryPrice * stopDistancePct;
    const stop = entryPrice - sign * stopDistance;

    const plannedRR = randFloat(rng, 1.5, 3);
    const target = entryPrice + sign * stopDistance * plannedRR;

    const riskBudget = Math.max(40, gaussian(rng, 250, 90));
    const qty = Math.max(1, Math.round(riskBudget / stopDistance));
    const initialRisk = stopDistance * qty;

    let rMultiple: number;
    if (isBreakeven) {
      rMultiple = gaussian(rng, 0, 0.02);
    } else if (win) {
      rMultiple = Math.max(0.1, gaussian(rng, 1.35, 0.65));
    } else {
      rMultiple = Math.min(-0.05, gaussian(rng, -0.82, 0.32));
    }

    const fees = round2(Math.max(1, qty * 0.005 + randFloat(rng, 0.5, 2)));
    const netPnl = rMultiple * initialRisk;
    const grossPnl = netPnl + fees;
    const exitPrice = round2(entryPrice + (sign * grossPnl) / qty);

    const durationMin = Math.min(210, Math.max(5, Math.round(gaussian(rng, 55, 40))));
    const exitTime = new Date(entryTime.getTime() + durationMin * 60000);
    if (exitTime.getHours() >= 16) {
      exitTime.setHours(15, randInt(rng, 30, 59), 0, 0);
    }

    let mfe: number;
    let mae: number;
    if (win || isBreakeven) {
      const realizedPerShare = Math.abs(grossPnl / qty);
      mfe = realizedPerShare * randFloat(rng, 1.0, 1.5);
      mae = stopDistance * randFloat(rng, 0.05, 0.35);
    } else {
      mfe = stopDistance * randFloat(rng, 0.05, 0.45);
      mae = stopDistance * randFloat(rng, 0.85, 1.15);
    }

    let grade: Grade;
    if (followedPlan) {
      grade = win ? pick(rng, ["A+", "A", "A"] as Grade[]) : pick(rng, ["B", "A"] as Grade[]);
    } else {
      grade = pick(rng, ["C", "B", "C"] as Grade[]);
    }

    const emotion: Emotion = followedPlan
      ? pick(rng, ["calm", "confident", "confident", "calm"] as Emotion[])
      : pick(rng, ["fearful", "greedy", "frustrated", "fomo", "bored"] as Emotion[]);

    const confidence = followedPlan
      ? randInt(rng, 3, 5)
      : randInt(rng, 1, 3);

    const tags: string[] = [];
    if (chance(rng, 0.5)) tags.push(pick(rng, MARKET_CONDITION_TAGS));
    if (followedPlan) {
      if (chance(rng, 0.55)) tags.push(pick(rng, QUALITY_TAGS));
    } else {
      tags.push(pick(rng, MISTAKE_TAGS));
      if (chance(rng, 0.3)) tags.push(pick(rng, MISTAKE_TAGS));
    }

    const createdAt = entryTime.toISOString();

    trades.push({
      id: `seed-${i.toString().padStart(4, "0")}`,
      symbol,
      side,
      qty,
      entryPrice: round2(entryPrice),
      exitPrice,
      entryTime: entryTime.toISOString(),
      exitTime: exitTime.toISOString(),
      fees,
      stop: round2(stop),
      target: round2(target),
      mfe: round2(mfe),
      mae: round2(mae),
      setup,
      tags: Array.from(new Set(tags)).filter((t): t is string => Boolean(t) && (ALL_TAGS as readonly string[]).includes(t)),
      grade,
      emotion,
      confidence,
      followedPlan,
      thesis: thesisFor(setup, symbol, side, rng),
      review: reviewFor(followedPlan, win, rng),
      account: "Main",
      isSeed: true,
      createdAt,
      updatedAt: createdAt,
    });
  }

  trades.sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());
  return trades;
}
