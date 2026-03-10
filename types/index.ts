// Options & market types for trading intelligence dashboard

export type OptionType = "call" | "put";

export interface OptionContract {
  strike: number;
  bid: number;
  ask: number;
  delta: number;
  iv: number; // implied vol as decimal e.g. 0.18
  volume: number;
  openInterest: number;
  type: OptionType;
  expiration: string; // ISO date
}

export interface OptionChain {
  ticker: string;
  spot: number;
  iv: number;
  expirations: string[];
  calls: OptionContract[];
  puts: OptionContract[];
}

export interface IndexQuote {
  symbol: string;
  price: number;
  change: number; // absolute
  changePercent: number;
}

export interface ExpectedMoveBand {
  date: string;
  price: number;
  upper: number;
  lower: number;
}

// Strategy scanner
export type SpreadStrategyType = "bull_put" | "bear_call" | "iron_condor";

export interface SpreadLeg {
  strike: number;
  type: OptionType;
  action: "buy" | "sell";
  premium: number;
  delta?: number;
}

export interface StrategyResult {
  id: string;
  type: SpreadStrategyType;
  ticker: string;
  legs: SpreadLeg[];
  credit: number;
  maxRisk: number;
  probabilityOfProfit: number;
  riskReward: number;
  daysToExpiration: number;
}

// Trade journal
export interface JournalEntry {
  id: string;
  ticker: string;
  strategy: string;
  entryPrice: number;
  exitPrice: number;
  profitLoss: number;
  notes: string;
  entryDate: string;
  exitDate: string;
}

// Risk
export interface RiskSnapshot {
  totalCapital: number;
  openRisk: number;
  maxRiskPerTrade: number;
  profitThisMonth: number;
  winRate: number;
}
