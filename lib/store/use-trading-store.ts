import { create } from "zustand";
import type { JournalEntry, RiskSnapshot } from "@/types";

interface TradingState {
  journal: JournalEntry[];
  risk: RiskSnapshot;
  addJournalEntry: (entry: Omit<JournalEntry, "id">) => void;
  setRisk: (risk: Partial<RiskSnapshot>) => void;
}

export const useTradingStore = create<TradingState>((set) => ({
  journal: [
    {
      id: "1",
      ticker: "SPY",
      strategy: "Bull Put Spread",
      entryPrice: 1.35,
      exitPrice: 0,
      profitLoss: 135,
      notes: "Closed at expiry",
      entryDate: "2025-02-01",
      exitDate: "2025-02-15",
    },
    {
      id: "2",
      ticker: "QQQ",
      strategy: "Iron Condor",
      entryPrice: 2.1,
      exitPrice: 0.4,
      profitLoss: 170,
      notes: "Took off early",
      entryDate: "2025-02-10",
      exitDate: "2025-02-20",
    },
  ],
  risk: {
    totalCapital: 50000,
    openRisk: 1200,
    maxRiskPerTrade: 500,
    profitThisMonth: 840,
    winRate: 0.62,
  },
  addJournalEntry: (entry) =>
    set((s) => ({
      journal: [
        ...s.journal,
        { ...entry, id: String(Date.now()) },
      ],
    })),
  setRisk: (updates) =>
    set((s) => ({ risk: { ...s.risk, ...updates } })),
}));
