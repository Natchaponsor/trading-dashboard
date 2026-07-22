export const SYMBOLS = [
  "AAPL",
  "NVDA",
  "MSFT",
  "TSLA",
  "SPY",
  "QQQ",
  "AMD",
  "META",
  "AMZN",
  "GOOGL",
] as const;

export const SETUPS = [
  "VWAP Bounce",
  "Opening Range Breakout",
  "Trend Pullback",
  "Gap-and-Go",
  "Mean Reversion",
  "Breakout Retest",
] as const;

export const MARKET_CONDITION_TAGS = [
  "trending",
  "choppy",
  "high-volume",
  "low-volume",
  "news-driven",
] as const;

export const MISTAKE_TAGS = [
  "oversized",
  "chased-entry",
  "moved-stop",
  "early-exit",
  "revenge-trade",
  "no-stop",
] as const;

export const QUALITY_TAGS = [
  "textbook",
  "patient-entry",
  "good-exit",
  "sized-right",
] as const;

export const ALL_TAGS = [
  ...MARKET_CONDITION_TAGS,
  ...MISTAKE_TAGS,
  ...QUALITY_TAGS,
] as const;

export const GRADES = ["A+", "A", "B", "C"] as const;

export const EMOTIONS = [
  "confident",
  "calm",
  "fearful",
  "greedy",
  "frustrated",
  "bored",
  "fomo",
] as const;

export const ACCOUNTS = ["Main"] as const;

export const DATE_PRESETS = ["7D", "30D", "90D", "YTD", "1Y", "All", "Custom"] as const;
export type DatePreset = (typeof DATE_PRESETS)[number];

export const VIEW_MODES = ["$", "R", "%"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];
