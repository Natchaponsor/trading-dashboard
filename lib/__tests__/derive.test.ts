import { describe, expect, it } from "vitest";
import { deriveTrade } from "../derive";
import type { Trade } from "../types";

function makeTrade(overrides: Partial<Trade> = {}): Trade {
  return {
    id: "t1",
    symbol: "AAPL",
    side: "long",
    qty: 100,
    entryPrice: 100,
    exitPrice: 102,
    entryTime: "2026-01-05T14:30:00.000Z",
    exitTime: "2026-01-05T15:00:00.000Z",
    fees: 2,
    stop: 99,
    target: 103,
    mfe: 2.5,
    mae: 0.3,
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

describe("deriveTrade", () => {
  it("computes gross/net pnl for a long win", () => {
    const d = deriveTrade(makeTrade());
    expect(d.grossPnl).toBeCloseTo(200);
    expect(d.netPnl).toBeCloseTo(198);
    expect(d.outcome).toBe("win");
  });

  it("computes negative pnl for a short trade that moves against it", () => {
    const d = deriveTrade(
      makeTrade({ side: "short", entryPrice: 100, exitPrice: 105, stop: 101 })
    );
    // short: (exit - entry) * -1 * qty = (105-100)*-1*100 = -500
    expect(d.grossPnl).toBeCloseTo(-500);
    expect(d.outcome).toBe("loss");
  });

  it("computes rMultiple relative to initial risk", () => {
    const d = deriveTrade(makeTrade());
    // initial risk = |100-99|*100 = 100; netPnl 198 -> R = 1.98
    expect(d.initialRisk).toBeCloseTo(100);
    expect(d.rMultiple).toBeCloseTo(1.98);
  });

  it("marks near-zero net pnl as breakeven", () => {
    const d = deriveTrade(makeTrade({ exitPrice: 100, fees: 0 }));
    expect(d.outcome).toBe("breakeven");
  });

  it("computes duration in minutes", () => {
    const d = deriveTrade(makeTrade());
    expect(d.durationMin).toBe(30);
  });

  it("handles zero risk without dividing by zero", () => {
    const d = deriveTrade(makeTrade({ stop: 100 }));
    expect(d.rMultiple).toBe(0);
    expect(Number.isFinite(d.rMultiple)).toBe(true);
  });
});
