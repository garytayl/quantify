import {
  calculateBullPutSpread,
  calculateBearCallSpread,
  calculateIronCondor,
} from "./options";
import type { OptionContract, StrategyResult } from "@/types";

export type TickerKey = "SPY" | "QQQ" | "IWM";

export interface ScannerInput {
  ticker: TickerKey;
  maxRisk: number;
  minProbability: number;
  daysToExpiration: number;
}


/** Run scanner with a provided chain and spot (e.g. from Polygon). */
export function runScannerWithChain(
  chain: OptionContract[],
  spot: number,
  input: Omit<ScannerInput, "ticker"> & { ticker: string }
): StrategyResult[] {
  const results: StrategyResult[] = [];
  const dte = input.daysToExpiration;

  const puts = chain.filter((c) => c.type === "put").sort((a, b) => b.strike - a.strike);
  const calls = chain.filter((c) => c.type === "call").sort((a, b) => a.strike - b.strike);
  _findSpreads(puts, calls, spot, dte, input, results);
  return _sortResults(results);
}

function _findSpreads(
  puts: OptionContract[],
  calls: OptionContract[],
  spot: number,
  dte: number,
  input: ScannerInput,
  results: StrategyResult[]
): void {
  for (let i = 0; i < puts.length - 1; i++) {
    const sellPut = puts[i];
    const buyPut = puts[i + 1];
    if (sellPut.strike <= spot && buyPut.strike < sellPut.strike) {
      const { credit, maxRisk, probabilityOfProfit, riskReward } = calculateBullPutSpread(
        sellPut.strike,
        buyPut.strike,
        (sellPut.bid + sellPut.ask) / 2,
        (buyPut.bid + buyPut.ask) / 2,
        sellPut.delta
      );
      if (probabilityOfProfit >= input.minProbability / 100 && maxRisk <= input.maxRisk) {
        results.push({
          id: `bull-put-${sellPut.strike}-${buyPut.strike}`,
          type: "bull_put",
          ticker: input.ticker,
          legs: [
            { strike: sellPut.strike, type: "put", action: "sell", premium: (sellPut.bid + sellPut.ask) / 2, delta: sellPut.delta },
            { strike: buyPut.strike, type: "put", action: "buy", premium: (buyPut.bid + buyPut.ask) / 2, delta: buyPut.delta },
          ],
          credit,
          maxRisk,
          probabilityOfProfit,
          riskReward,
          daysToExpiration: dte,
        });
      }
    }
  }
  for (let i = 0; i < calls.length - 1; i++) {
    const sellCall = calls[i];
    const buyCall = calls[i + 1];
    if (sellCall.strike >= spot && buyCall.strike > sellCall.strike) {
      const { credit, maxRisk, probabilityOfProfit, riskReward } = calculateBearCallSpread(
        sellCall.strike,
        buyCall.strike,
        (sellCall.bid + sellCall.ask) / 2,
        (buyCall.bid + buyCall.ask) / 2,
        sellCall.delta
      );
      if (probabilityOfProfit >= input.minProbability / 100 && maxRisk <= input.maxRisk) {
        results.push({
          id: `bear-call-${sellCall.strike}-${buyCall.strike}`,
          type: "bear_call",
          ticker: input.ticker,
          legs: [
            { strike: sellCall.strike, type: "call", action: "sell", premium: (sellCall.bid + sellCall.ask) / 2, delta: sellCall.delta },
            { strike: buyCall.strike, type: "call", action: "buy", premium: (buyCall.bid + buyCall.ask) / 2, delta: buyCall.delta },
          ],
          credit,
          maxRisk,
          probabilityOfProfit,
          riskReward,
          daysToExpiration: dte,
        });
      }
    }
  }
  const putOtm = puts.filter((p) => p.strike < spot);
  const callOtm = calls.filter((c) => c.strike > spot);
  for (let i = 0; i < Math.min(putOtm.length - 1, callOtm.length - 1); i++) {
    const putSell = putOtm[i];
    const putBuy = putOtm[i + 1];
    const callSell = callOtm[i];
    const callBuy = callOtm[i + 1];
    if (!putSell || !putBuy || !callSell || !callBuy) continue;
    const { credit, maxRisk, probabilityOfProfit, riskReward } = calculateIronCondor(
      putSell.strike,
      putBuy.strike,
      callSell.strike,
      callBuy.strike,
      (putSell.bid + putSell.ask) / 2,
      (putBuy.bid + putBuy.ask) / 2,
      (callSell.bid + callSell.ask) / 2,
      (callBuy.bid + callBuy.ask) / 2,
      putSell.delta,
      callSell.delta
    );
    if (probabilityOfProfit >= input.minProbability / 100 && maxRisk <= input.maxRisk) {
      results.push({
        id: `iron-${putSell.strike}-${callSell.strike}`,
        type: "iron_condor",
        ticker: input.ticker,
        legs: [
          { strike: putSell.strike, type: "put", action: "sell", premium: (putSell.bid + putSell.ask) / 2, delta: putSell.delta },
          { strike: putBuy.strike, type: "put", action: "buy", premium: (putBuy.bid + putBuy.ask) / 2, delta: putBuy.delta },
          { strike: callSell.strike, type: "call", action: "sell", premium: (callSell.bid + callSell.ask) / 2, delta: callSell.delta },
          { strike: callBuy.strike, type: "call", action: "buy", premium: (callBuy.bid + callBuy.ask) / 2, delta: callBuy.delta },
        ],
        credit,
        maxRisk,
        probabilityOfProfit,
        riskReward,
        daysToExpiration: dte,
      });
    }
  }
}

function _sortResults(results: StrategyResult[]): StrategyResult[] {
  return results
    .sort((a, b) => b.probabilityOfProfit - a.probabilityOfProfit)
    .slice(0, 12);
}

export function runScanner(input: ScannerInput): StrategyResult[] {
  return [];
}

