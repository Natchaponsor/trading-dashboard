export type Side = "long" | "short";

export type Grade = "A+" | "A" | "B" | "C";

export type Emotion =
  | "confident"
  | "calm"
  | "fearful"
  | "greedy"
  | "frustrated"
  | "bored"
  | "fomo";

export type TagCategory = "market-condition" | "mistake" | "quality";

export interface Tag {
  name: string;
  category: TagCategory;
}

export interface TradeReview {
  right: string;
  wrong: string;
  thesisCorrect: boolean;
  oneChange: string;
}

/** As stored / user-editable. */
export interface Trade {
  id: string;
  symbol: string;
  side: Side;
  qty: number;
  entryPrice: number;
  exitPrice: number;
  entryTime: string; // ISO
  exitTime: string; // ISO
  fees: number;

  stop: number;
  target: number;
  mfe: number; // per-share, favorable
  mae: number; // per-share, adverse

  setup: string;
  tags: string[];
  grade: Grade;
  emotion: Emotion;
  confidence: number; // 1-5
  followedPlan: boolean;
  thesis: string;
  review: TradeReview;

  account: string;
  isSeed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Outcome = "win" | "loss" | "breakeven";

/** Computed from a Trade, never persisted. */
export interface DerivedTrade extends Trade {
  grossPnl: number;
  netPnl: number;
  initialRisk: number;
  rMultiple: number;
  durationMin: number;
  outcome: Outcome;
  returnPct: number;
  mfeR: number;
  maeR: number;
  captureRate: number;
  plannedRR: number;
}

export interface Quote {
  symbol: string;
  price: number | null;
  changePct: number | null;
  asOf: string | null;
  error?: string;
}
