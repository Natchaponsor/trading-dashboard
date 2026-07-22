import type { DerivedTrade, Outcome, Trade } from "./types";

function sideSign(side: Trade["side"]) {
  return side === "long" ? 1 : -1;
}

export function deriveTrade(trade: Trade): DerivedTrade {
  const sign = sideSign(trade.side);

  const grossPnl = (trade.exitPrice - trade.entryPrice) * sign * trade.qty;
  const netPnl = grossPnl - trade.fees;

  const initialRisk = Math.abs(trade.entryPrice - trade.stop) * trade.qty;
  const rMultiple = initialRisk > 0 ? netPnl / initialRisk : 0;

  const entryTime = new Date(trade.entryTime).getTime();
  const exitTime = new Date(trade.exitTime).getTime();
  const durationMin = Math.max(0, Math.round((exitTime - entryTime) / 60000));

  // A trade within a small band of its own risk unit reads as noise, not skill — call it breakeven.
  const breakevenBand = initialRisk > 0 ? initialRisk * 0.05 : 0.01;
  let outcome: Outcome = "breakeven";
  if (netPnl > breakevenBand) outcome = "win";
  else if (netPnl < -breakevenBand) outcome = "loss";

  const costBasis = trade.entryPrice * trade.qty;
  const returnPct = costBasis > 0 ? netPnl / costBasis : 0;

  const perShareRisk = Math.abs(trade.entryPrice - trade.stop);
  const mfeR = perShareRisk > 0 ? trade.mfe / perShareRisk : 0;
  const maeR = perShareRisk > 0 ? trade.mae / perShareRisk : 0;
  const captureRate = mfeR !== 0 ? rMultiple / mfeR : 0;

  const plannedRisk = Math.abs(trade.entryPrice - trade.stop);
  const plannedReward = Math.abs(trade.target - trade.entryPrice);
  const plannedRR = plannedRisk > 0 ? plannedReward / plannedRisk : 0;

  return {
    ...trade,
    grossPnl,
    netPnl,
    initialRisk,
    rMultiple,
    durationMin,
    outcome,
    returnPct,
    mfeR,
    maeR,
    captureRate,
    plannedRR,
  };
}

export function deriveTrades(trades: Trade[]): DerivedTrade[] {
  return trades.map(deriveTrade);
}
