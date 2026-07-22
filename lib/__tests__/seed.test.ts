import { describe, expect, it } from "vitest";
import { generateSeedTrades, TRADE_COUNT } from "../seed";
import { deriveTrades } from "../derive";
import { computeMetrics } from "../metrics";

describe("generateSeedTrades", () => {
  const now = new Date("2026-07-21T12:00:00.000Z");

  it("is deterministic across calls", () => {
    const a = generateSeedTrades(now);
    const b = generateSeedTrades(now);
    expect(a).toEqual(b);
  });

  it("generates the expected trade count", () => {
    expect(generateSeedTrades(now)).toHaveLength(TRADE_COUNT);
  });

  it("stays within the last 12 months up to now", () => {
    const trades = generateSeedTrades(now);
    const yearAgo = new Date(now);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    for (const t of trades) {
      const entry = new Date(t.entryTime);
      expect(entry.getTime()).toBeLessThanOrEqual(now.getTime());
      expect(entry.getTime()).toBeGreaterThanOrEqual(yearAgo.getTime());
    }
  });

  it("only uses weekday entry times", () => {
    const trades = generateSeedTrades(now);
    for (const t of trades) {
      const day = new Date(t.entryTime).getDay();
      expect(day).not.toBe(0);
      expect(day).not.toBe(6);
    }
  });

  it("produces a net-profitable account with a plausible win rate", () => {
    const derived = deriveTrades(generateSeedTrades(now));
    const metrics = computeMetrics(derived);
    expect(metrics.netPnl).toBeGreaterThan(0);
    expect(metrics.winRate).toBeGreaterThan(0.4);
    expect(metrics.winRate).toBeLessThan(0.65);
  });

  it("bakes in the followed-plan discoverable pattern", () => {
    const derived = deriveTrades(generateSeedTrades(now));
    const followed = derived.filter((t) => t.followedPlan);
    const notFollowed = derived.filter((t) => !t.followedPlan);
    const followedMetrics = computeMetrics(followed);
    const notFollowedMetrics = computeMetrics(notFollowed);
    expect(followedMetrics.expectancy).toBeGreaterThan(notFollowedMetrics.expectancy);
  });
});
