import { mulberry32, gaussian } from "./rng";
import type { DerivedTrade } from "./types";

export interface PricePoint {
  t: number; // minute offset from entry
  price: number;
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/** Deterministic synthetic intraday path from entry to exit that respects mfe/mae extremes. */
export function generateSyntheticPath(trade: DerivedTrade, steps = 40): PricePoint[] {
  const rng = mulberry32(hashId(trade.id));
  const sign = trade.side === "long" ? 1 : -1;

  const favorableExtreme = trade.entryPrice + sign * trade.mfe;
  const adverseExtreme = trade.entryPrice - sign * trade.mae;

  const favIdx = Math.max(1, Math.min(steps - 2, Math.round(steps * (0.3 + rng() * 0.4))));
  const advIdx = favIdx > steps / 2 ? Math.round(steps * 0.15) : Math.round(steps * 0.85);

  const anchors: { idx: number; price: number }[] = [
    { idx: 0, price: trade.entryPrice },
    { idx: Math.min(favIdx, advIdx), price: favIdx < advIdx ? favorableExtreme : adverseExtreme },
    { idx: Math.max(favIdx, advIdx), price: favIdx < advIdx ? adverseExtreme : favorableExtreme },
    { idx: steps, price: trade.exitPrice },
  ].sort((a, b) => a.idx - b.idx);

  const points: PricePoint[] = [];
  const minutesPerStep = trade.durationMin / steps;

  for (let i = 0; i <= steps; i++) {
    let lo = anchors[0];
    let hi = anchors[anchors.length - 1];
    for (let a = 0; a < anchors.length - 1; a++) {
      if (i >= anchors[a].idx && i <= anchors[a + 1].idx) {
        lo = anchors[a];
        hi = anchors[a + 1];
        break;
      }
    }
    const span = hi.idx - lo.idx || 1;
    const frac = (i - lo.idx) / span;
    const base = lo.price + (hi.price - lo.price) * frac;
    const noiseScale = Math.abs(favorableExtreme - adverseExtreme) * 0.04;
    const noise = i === 0 || i === steps ? 0 : gaussian(rng, 0, noiseScale);
    points.push({ t: Math.round(i * minutesPerStep), price: base + noise });
  }

  points[0].price = trade.entryPrice;
  points[points.length - 1].price = trade.exitPrice;

  return points;
}
