/**
 * Fetch real market data from Polygon.io and map to app types.
 */

import {
  getStockSnapshot,
  getStockPrevClose,
  getOptionsSnapshot,
} from "@/lib/api/polygon";
import type { IndexQuote, OptionContract } from "@/types";

const INDEX_SYMBOLS = ["SPY", "QQQ", "IWM"] as const;

export async function fetchIndexQuotes(): Promise<IndexQuote[] | null> {
  const results: IndexQuote[] = [];
  for (const symbol of INDEX_SYMBOLS) {
    const snap = await getStockSnapshot(symbol);
    if (!snap) return null;
    let prevClose = snap.prevClose;
    if (prevClose == null) {
      prevClose = await getStockPrevClose(symbol) ?? snap.price;
    }
    const change = snap.price - prevClose;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;
    results.push({
      symbol,
      price: snap.price,
      change,
      changePercent,
    });
  }
  return results;
}

/** VIX is not a stock on Polygon; caller should use mock or another source. */
export async function fetchVIX(): Promise<number | null> {
  return null;
}

/**
 * Fetch option chain for underlying. Maps Polygon snapshot to OptionContract[].
 */
export async function fetchOptionChain(
  underlyingTicker: string,
  expirationGte: string,
  expirationLte: string
): Promise<OptionContract[]> {
  const results = await getOptionsSnapshot(
    underlyingTicker,
    expirationGte,
    expirationLte,
    250
  );
  const contracts: OptionContract[] = [];
  for (const r of results) {
    const type = r.details?.contract_type?.toLowerCase();
    if (type !== "call" && type !== "put") continue;
    const strike = r.details?.strike_price;
    const expiration = r.details?.expiration_date;
    if (strike == null || !expiration) continue;
    const bid = r.last_quote?.bid_price ?? 0;
    const ask = r.last_quote?.ask_price ?? r.last_trade?.price ?? 0;
    const mid = ask ? (bid + ask) / 2 : (r.last_trade?.price ?? 0);
    const iv = r.implied_volatility ?? 0;
    const delta = r.greeks?.delta ?? (type === "call" ? 0.5 : -0.5);
    contracts.push({
      strike,
      bid,
      ask: ask || bid || mid,
      delta,
      iv: typeof iv === "number" ? iv : 0,
      volume: r.day?.volume ?? 0,
      openInterest: r.open_interest ?? 0,
      type: type as "call" | "put",
      expiration,
    });
  }
  return contracts;
}
