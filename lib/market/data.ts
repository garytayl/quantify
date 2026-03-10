/**
 * Market data: Polygon only. No placeholder/mock data.
 */

import { isPolygonConfigured } from "@/lib/api/polygon";
import { getStockAggsRange } from "@/lib/api/polygon";
import { fetchIndexQuotes, fetchOptionChain } from "@/lib/market/polygon-data";
import { calculateExpectedMove } from "@/lib/calculations/options";
import type { IndexQuote, OptionContract } from "@/types";

export const SYMBOLS = ["SPY", "QQQ", "IWM"] as const;
export type SymbolTicker = (typeof SYMBOLS)[number];

function isSymbol(s: string): s is SymbolTicker {
  return SYMBOLS.includes(s as SymbolTicker);
}

/** Index quotes (SPY, QQQ, IWM). Empty if Polygon not configured or fetch fails. */
export async function getIndexQuotes(): Promise<IndexQuote[]> {
  if (!isPolygonConfigured()) return [];
  const real = await fetchIndexQuotes();
  return real ?? [];
}

/** VIX. Polygon doesn't provide it; returns 0 so UI can show "—" or N/A. */
export async function getVIX(): Promise<number> {
  return 0;
}

/** Expected move (1 week) in dollars. */
export function getExpectedMoveWeekly(spot: number, iv = 0.14): number {
  if (!spot) return 0;
  return calculateExpectedMove(spot, iv, 7);
}

/** No mock bands. Returns empty; chart shows empty state. */
export function getExpectedMoveBands(): { date: string; price: number; upper: number; lower: number }[] {
  return [];
}

/** Option chain. Empty if no Polygon or not a known symbol. */
export async function getOptionChain(ticker: string): Promise<OptionContract[]> {
  if (!isPolygonConfigured()) return [];
  if (!isSymbol(ticker)) return [];
  const now = new Date();
  const gte = now.toISOString().slice(0, 10);
  const lte = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  try {
    return await fetchOptionChain(ticker, gte, lte);
  } catch {
    return [];
  }
}

/** Spot price. 0 when no data. */
export async function getSpot(ticker: string): Promise<number> {
  const quotes = await getIndexQuotes();
  const q = quotes.find((x) => x.symbol === ticker);
  return q?.price ?? 0;
}

/** Daily bars for chart. from/to = YYYY-MM-DD. */
export async function getStockBars(
  ticker: string,
  from: string,
  to: string
): Promise<{ date: string; open: number; high: number; low: number; close: number; volume: number }[]> {
  if (!isPolygonConfigured()) return [];
  const bars = await getStockAggsRange(ticker, from, to);
  return bars.map((b) => ({
    date: new Date(b.t).toISOString().slice(0, 10),
    open: b.o,
    high: b.h,
    low: b.l,
    close: b.c,
    volume: b.v,
  }));
}
