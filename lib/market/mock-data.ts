/**
 * Mock market data for SPY, QQQ, IWM.
 * Realistic numbers for UI development.
 */

import type { IndexQuote, OptionContract, ExpectedMoveBand } from "@/types";

const now = new Date();
const formatDate = (d: Date) => d.toISOString().slice(0, 10);

// --- Index quotes ---
export const mockIndexQuotes: IndexQuote[] = [
  { symbol: "SPY", price: 503.21, change: 2.26, changePercent: 0.45 },
  { symbol: "QQQ", price: 442.18, change: -1.22, changePercent: -0.28 },
  { symbol: "IWM", price: 198.45, change: 0.88, changePercent: 0.45 },
];

export const mockVIX = 14.82;
export const mockExpectedMoveWeekly = 6.85; // 1w expected move for SPY in $

// --- SPY expected move band (for chart) ---
function genExpectedMoveBand(daysBack: number): ExpectedMoveBand[] {
  const bands: ExpectedMoveBand[] = [];
  let price = 498.5;
  const iv = 0.14;
  for (let i = daysBack; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const daysToExp = Math.min(7, 7 - (i % 7) + 7);
    const move = price * iv * Math.sqrt(daysToExp / 365);
    price = price + (i % 3 === 0 ? 0.3 : i % 3 === 1 ? -0.2 : 0.15);
    bands.push({
      date: formatDate(d),
      price,
      upper: price + move,
      lower: price - move,
    });
  }
  return bands;
}

export const mockSPYExpectedMoveBands = genExpectedMoveBand(30);

// --- Option chain mock (SPY, one expiration) ---
const exp = new Date(now);
exp.setDate(exp.getDate() + 14);
const expStr = formatDate(exp);

function mockStrikes(spot: number, count: number): number[] {
  const step = 2;
  const start = Math.floor((spot - step * count) / step) * step;
  return Array.from({ length: count }, (_, i) => start + i * step);
}

function buildChain(ticker: string, spot: number, iv: number): OptionContract[] {
  const strikes = mockStrikes(spot, 25).filter((s) => s >= spot - 30 && s <= spot + 30);
  const contracts: OptionContract[] = [];
  strikes.forEach((strike) => {
    const moneyness = (spot - strike) / spot;
    const vol = iv + moneyness * 0.05;
    const deltaCall = 0.5 + moneyness * 2;
    const deltaPut = -0.5 + moneyness * 2;
    const mid = Math.abs(moneyness) * 2 + 0.5;
    contracts.push({
      strike,
      bid: mid - 0.05,
      ask: mid + 0.05,
      delta: Math.max(0.01, Math.min(0.99, deltaCall)),
      iv: vol,
      volume: Math.floor(Math.random() * 5000),
      openInterest: Math.floor(Math.random() * 10000),
      type: "call",
      expiration: expStr,
    });
    contracts.push({
      strike,
      bid: mid - 0.05,
      ask: mid + 0.05,
      delta: Math.max(-0.99, Math.min(-0.01, deltaPut)),
      iv: vol,
      volume: Math.floor(Math.random() * 5000),
      openInterest: Math.floor(Math.random() * 10000),
      type: "put",
      expiration: expStr,
    });
  });
  return contracts;
}

export const mockOptionChains = {
  SPY: buildChain("SPY", 503.21, 0.14),
  QQQ: buildChain("QQQ", 442.18, 0.16),
  IWM: buildChain("IWM", 198.45, 0.18),
};

export function getCalls(ticker: keyof typeof mockOptionChains) {
  return mockOptionChains[ticker].filter((c) => c.type === "call");
}

export function getPuts(ticker: keyof typeof mockOptionChains) {
  return mockOptionChains[ticker].filter((c) => c.type === "put");
}
