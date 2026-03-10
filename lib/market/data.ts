/**
 * Unified market data: Polygon when configured, mock otherwise.
 */

import { isPolygonConfigured } from "@/lib/api/polygon";
import { fetchIndexQuotes, fetchOptionChain } from "@/lib/market/polygon-data";
import {
  mockIndexQuotes,
  mockVIX,
  mockExpectedMoveWeekly,
  mockSPYExpectedMoveBands,
  mockOptionChains,
} from "@/lib/market/mock-data";
import { calculateExpectedMove } from "@/lib/calculations/options";
import type { IndexQuote, OptionContract, ExpectedMoveBand } from "@/types";

const INDEX_SYMBOLS = ["SPY", "QQQ", "IWM"] as const;
type TickerKey = (typeof INDEX_SYMBOLS)[number];

function isTickerKey(s: string): s is TickerKey {
  return INDEX_SYMBOLS.includes(s as TickerKey);
}

/** Index quotes (SPY, QQQ, IWM). Real from Polygon or mock. */
export async function getIndexQuotes(): Promise<IndexQuote[]> {
  if (isPolygonConfigured()) {
    const real = await fetchIndexQuotes();
    if (real?.length) return real;
  }
  return mockIndexQuotes;
}

/** VIX. Polygon does not expose CBOE VIX; use mock until we add another source. */
export async function getVIX(): Promise<number> {
  return mockVIX;
}

/** Expected move (1 week) in dollars for a given spot and optional IV. */
export function getExpectedMoveWeekly(spot: number, iv = 0.14): number {
  return calculateExpectedMove(spot, iv, 7);
}

/** Expected move bands for chart (date, price, upper, lower). Mock for now. */
export function getSPYExpectedMoveBands(): ExpectedMoveBand[] {
  return mockSPYExpectedMoveBands;
}

/** Option chain for ticker. Real from Polygon or mock. */
export async function getOptionChain(
  ticker: string
): Promise<OptionContract[]> {
  if (!isPolygonConfigured() || !isTickerKey(ticker)) {
    return mockOptionChains[ticker as keyof typeof mockOptionChains] ?? [];
  }
  const now = new Date();
  const gte = now.toISOString().slice(0, 10);
  const lte = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  try {
    const contracts = await fetchOptionChain(ticker, gte, lte);
    if (contracts.length > 0) return contracts;
  } catch {
    // fallback
  }
  return mockOptionChains[ticker as keyof typeof mockOptionChains] ?? [];
}

/** Spot price for a ticker (from index quotes or first option underlying). */
export async function getSpot(ticker: string): Promise<number> {
  const quotes = await getIndexQuotes();
  const q = quotes.find((x) => x.symbol === ticker);
  if (q) return q.price;
  const fallback: Record<string, number> = {
    SPY: 503.21,
    QQQ: 442.18,
    IWM: 198.45,
  };
  return fallback[ticker] ?? 500;
}
