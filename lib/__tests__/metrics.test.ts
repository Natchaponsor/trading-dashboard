import { describe, expect, it } from "vitest";
import { deriveTrade } from "../derive";
import { computeMetrics, computeEquityCurve } from "../metrics";
import type { Trade } from "../types";

function makeTrade(overrides: Partial<Trade>): Trade {
  return {
    id: overrides.id ?? "t",
    symbol: "AAPL",
    side: "long",
    qty: 10,
    entryPrice: 100,
    exitPrice: 100,
    entryTime: "2026-01-05T14:30:00.000Z",
    exitTime: "2026-01-05T15:00:00.000Z",
    fees: 0,
    stop: 99,
    target: 103,
    mfe: 1,
    mae: 0.5,
    setup: "VWAP Bounce",
    tags: [],
    grade: "A",
    emotion: "calm",
    confidence: 4,
    followedPlan: true,
    thesis: "",
    review: { right: "", wrong: "", thesisCorrect: true, oneChange: "" },
    account: "Main",
    isSeed: true,
    createdAt: "2026-01-05T14:30:00.000Z",
    updatedAt: "2026-01-05T14:30:00.000Z",
    ...overrides,
  };
}

describe("computeMetrics", () => {
  it("returns zeroed metrics for an empty set", () => {
    const m = computeMetrics([]);
    expect(m.count).toBe(0);
    expect(m.netPnl).toBe(0);
    expect(m.winRate).toBe(0);
  });

  it("computes win rate and profit factor across a mixed set", () => {
    const trades = [
      makeTrade({ id: "w1", exitPrice: 110 }), // win: +100
      makeTrade({ id: "w2", exitPrice: 105 }), // win: +50
      makeTrade({ id: "l1", exitPrice: 95 }), // loss: -50
    ].map(deriveTrade);

    const m = computeMetrics(trades);
    expect(m.count).toBe(3);
    expect(m.wins).toBe(2);
    expect(m.losses).toBe(1);
    expect(m.winRate).toBeCloseTo(2 / 3);
    expect(m.netPnl).toBeCloseTo(100);
    expect(m.profitFactor).toBeCloseTo(150 / 50);
  });

  it("computes max drawdown from the equity curve", () => {
    const trades = [
      makeTrade({ id: "a", exitPrice: 110, exitTime: "2026-01-05T15:00:00.000Z" }), // +100
      makeTrade({ id: "b", exitPrice: 80, exitTime: "2026-01-06T15:00:00.000Z" }), // -200
      makeTrade({ id: "c", exitPrice: 105, exitTime: "2026-01-07T15:00:00.000Z" }), // +50
    ].map(deriveTrade);

    const equity = computeEquityCurve(trades);
    expect(equity[equity.length - 1].cumulativeNet).toBeCloseTo(-50);

    const m = computeMetrics(trades);
    // peak after trade a = 100, trough after trade b = -100 -> drawdown = -200
    expect(m.maxDrawdown).toBeCloseTo(-200);
  });
});
