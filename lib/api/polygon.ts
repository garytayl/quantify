/**
 * Massive (formerly Polygon.io) REST API client for market data.
 * All calls are server-side only. Set POLYGON_API_KEY in env (same key works at massive.com).
 */

const BASE = "https://api.massive.com";

function getApiKey(): string | undefined {
  return process.env.POLYGON_API_KEY;
}

export function isPolygonConfigured(): boolean {
  return Boolean(getApiKey());
}

async function fetchPolygon<T>(
  path: string,
  params: Record<string, string | number | undefined> = {}
): Promise<T> {
  const key = getApiKey();
  if (!key) {
    throw new Error("POLYGON_API_KEY is not set");
  }
  const search = new URLSearchParams({
    apiKey: key,
    ...Object.fromEntries(
      Object.entries(params)
        .filter(([, v]) => v != null && v !== "")
        .map(([k, v]) => [k, String(v)])
    ),
  });
  const url = `${BASE}${path}?${search.toString()}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Massive API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

// --- Stock aggregates (previous day) ---
export interface PolygonPrevBar {
  T?: string;
  c: number;
  h: number;
  l: number;
  o: number;
  v: number;
  vw?: number;
  t: number;
  n?: number;
}

export interface PolygonAggsPrevResponse {
  ticker: string;
  status: string;
  results?: PolygonPrevBar[];
}

export async function getStockPrevClose(ticker: string): Promise<number | null> {
  try {
    const data = await fetchPolygon<PolygonAggsPrevResponse>(
      `/v2/aggs/ticker/${encodeURIComponent(ticker)}/prev`
    );
    const bar = data.results?.[0];
    return bar ? bar.c : null;
  } catch {
    return null;
  }
}

// --- Stock aggregates range (for charts) ---
export interface PolygonAggBar {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  vw?: number;
  t: number;
  n?: number;
}

export interface PolygonAggsRangeResponse {
  ticker: string;
  results?: PolygonAggBar[];
  status?: string;
}

export async function getStockAggsRange(
  ticker: string,
  from: string,
  to: string,
  timespan: "day" | "week" = "day",
  multiplier = 1
): Promise<PolygonAggBar[]> {
  try {
    const data = await fetchPolygon<PolygonAggsRangeResponse>(
      `/v2/aggs/ticker/${encodeURIComponent(ticker)}/range/${multiplier}/${timespan}/${from}/${to}`
    );
    return data.results ?? [];
  } catch {
    return [];
  }
}

// --- Stock snapshot (last trade, last quote, day bar) ---
export interface PolygonStockSnapshot {
  ticker?: string;
  day?: { c?: number; o?: number; h?: number; l?: number; v?: number };
  lastTrade?: { p?: number; s?: number; t?: number };
  lastQuote?: { ap?: number; as?: number; bp?: number; bs?: number };
  min?: { av?: number; c?: number; h?: number; l?: number; o?: number; v?: number };
  prevDay?: { c?: number; h?: number; l?: number; o?: number; v?: number };
}

export interface PolygonStockSnapshotResponse {
  status?: string;
  ticker?: string;
  results?: PolygonStockSnapshot;
}

export async function getStockSnapshot(ticker: string): Promise<{
  price: number;
  prevClose: number | null;
} | null> {
  try {
    const data = await fetchPolygon<PolygonStockSnapshotResponse>(
      `/v2/snapshot/locale/us/markets/stocks/tickers/${encodeURIComponent(ticker)}`
    );
    const r = data.results ?? (data as unknown as PolygonStockSnapshot);
    const lastPrice =
      r.lastTrade?.p ??
      ((r.lastQuote?.bp != null && r.lastQuote?.ap != null)
        ? (r.lastQuote.bp + r.lastQuote.ap) / 2
        : r.day?.c ?? r.min?.c);
    if (lastPrice == null) return null;
    const prevClose = r.prevDay?.c ?? null;
    return { price: lastPrice, prevClose };
  } catch {
    return null;
  }
}

// --- Options snapshot (chain for underlying) ---
export interface PolygonOptionSnapshotResult {
  details?: {
    contract_type?: string;
    strike_price?: number;
    expiration_date?: string;
    ticker?: string;
  };
  greeks?: { delta?: number };
  implied_volatility?: number;
  open_interest?: number;
  last_quote?: { bid_price?: number; ask_price?: number };
  last_trade?: { price?: number };
  day?: { volume?: number };
}

export interface PolygonOptionsSnapshotResponse {
  status?: string;
  results?: PolygonOptionSnapshotResult[];
  next_url?: string;
}

export async function getOptionsSnapshot(
  underlyingTicker: string,
  expirationDateGte?: string,
  expirationDateLte?: string,
  limit = 250
): Promise<PolygonOptionSnapshotResult[]> {
  const params: Record<string, string | number> = { limit };
  if (expirationDateGte) params["expiration_date.gte"] = expirationDateGte;
  if (expirationDateLte) params["expiration_date.lte"] = expirationDateLte;
  const data = await fetchPolygon<PolygonOptionsSnapshotResponse>(
    `/v3/snapshot/options/${encodeURIComponent(underlyingTicker)}`,
    params
  );
  return data.results ?? [];
}
