import type { DerivedTrade } from "./types";

const COLUMNS: { header: string; get: (t: DerivedTrade) => string | number }[] = [
  { header: "Date", get: (t) => t.entryTime.slice(0, 10) },
  { header: "Symbol", get: (t) => t.symbol },
  { header: "Side", get: (t) => t.side },
  { header: "Qty", get: (t) => t.qty },
  { header: "Entry", get: (t) => t.entryPrice },
  { header: "Exit", get: (t) => t.exitPrice },
  { header: "Net P&L", get: (t) => t.netPnl.toFixed(2) },
  { header: "R Multiple", get: (t) => t.rMultiple.toFixed(2) },
  { header: "Setup", get: (t) => t.setup },
  { header: "Grade", get: (t) => t.grade },
  { header: "Followed Plan", get: (t) => (t.followedPlan ? "yes" : "no") },
];

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function tradesToCsv(trades: DerivedTrade[]): string {
  const header = COLUMNS.map((c) => c.header).join(",");
  const rows = trades.map((t) => COLUMNS.map((c) => escapeCsv(c.get(t))).join(","));
  return [header, ...rows].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
