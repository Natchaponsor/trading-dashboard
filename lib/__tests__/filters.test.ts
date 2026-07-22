import { describe, expect, it } from "vitest";
import { deriveTrade } from "../derive";
import { applyFilters, DEFAULT_FILTERS } from "../filters";
import type { Trade } from "../types";

function makeTrade(overrides: Partial<Trade>): Trade {
  return {
    id: overrides.id ?? "t",
    symbol: "AAPL",
    side: "long",
    qty: 10,
    entryPrice: 100,
    exitPrice: 105,
    entryTime: "2026-06-01T14:30:00.000Z",
    exitTime: "2026-06-01T15:00:00.000Z",
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
    createdAt: "2026-06-01T14:30:00.000Z",
    updatedAt: "2026-06-01T14:30:00.000Z",
    ...overrides,
  };
}

const now = new Date("2026-07-21T12:00:00.000Z");

describe("applyFilters", () => {
  it("returns everything with default filters", () => {
    const trades = [makeTrade({ id: "a" }), makeTrade({ id: "b", symbol: "TSLA" })].map(deriveTrade);
    expect(applyFilters(trades, DEFAULT_FILTERS, now)).toHaveLength(2);
  });

  it("filters by symbol", () => {
    const trades = [makeTrade({ id: "a", symbol: "AAPL" }), makeTrade({ id: "b", symbol: "TSLA" })].map(deriveTrade);
    const result = applyFilters(trades, { ...DEFAULT_FILTERS, symbols: ["TSLA"] }, now);
    expect(result).toHaveLength(1);
    expect(result[0].symbol).toBe("TSLA");
  });

  it("filters by side", () => {
    const trades = [makeTrade({ id: "a", side: "long" }), makeTrade({ id: "b", side: "short" })].map(deriveTrade);
    const result = applyFilters(trades, { ...DEFAULT_FILTERS, side: "short" }, now);
    expect(result).toHaveLength(1);
    expect(result[0].side).toBe("short");
  });

  it("excludes trades outside a 7D window", () => {
    const trades = [
      makeTrade({ id: "recent", entryTime: "2026-07-20T14:30:00.000Z" }),
      makeTrade({ id: "old", entryTime: "2026-01-01T14:30:00.000Z" }),
    ].map(deriveTrade);
    const result = applyFilters(trades, { ...DEFAULT_FILTERS, datePreset: "7D" }, now);
    expect(result.map((t) => t.id)).toEqual(["recent"]);
  });

  it("filters by tag", () => {
    const trades = [
      makeTrade({ id: "a", tags: ["oversized"] }),
      makeTrade({ id: "b", tags: ["textbook"] }),
    ].map(deriveTrade);
    const result = applyFilters(trades, { ...DEFAULT_FILTERS, tags: ["oversized"] }, now);
    expect(result.map((t) => t.id)).toEqual(["a"]);
  });
});
