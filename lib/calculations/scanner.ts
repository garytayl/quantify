import {
  calculateBullPutSpread,
  calculateBearCallSpread,
  calculateIronCondor,
} from "./options";
import type { StrategyResult, SpreadStrategyType } from "@/types";
import { mockOptionChains } from "@/lib/market/mock-data";

type TickerKey = keyof typeof mockOptionChains;

interface ScannerInput {
  ticker: TickerKey;
  maxRisk: number;
  minProbability: number;
  daysToExpiration: number;
}

function getSpot(ticker: TickerKey): number {
  const spots: Record<TickerKey, number> = { SPY: 503.21, QQQ: 442.18, IWM: 198.45 };
  return spots[ticker] ?? 500;
}

export function runScanner(input: ScannerInput): StrategyResult[] {
  const chain = mockOptionChains[input.ticker];
  const spot = getSpot(input.ticker);
  const results: StrategyResult[] = [];
  const dte = input.daysToExpiration;

  const puts = chain.filter((c) => c.type === "put").sort((a, b) => b.strike - a.strike);
  const calls = chain.filter((c) => c.type === "call").sort((a, b) => a.strike - b.strike);

  // Bull put: sell put above spot, buy put below (e.g. sell 498, buy 493)
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

  // Bear call: sell call below spot, buy call above
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

  // Iron condor: OTM put spread + OTM call spread
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

  const sorted = results
  .sort((a, b) => b.probabilityOfProfit - a.probabilityOfProfit)
  .slice(0, 12);

  if (sorted.length === 0) {
    return [
      {
        id: "demo-bull-put",
        type: "bull_put",
        ticker: input.ticker,
        legs: [
          { strike: 492, type: "put", action: "sell", premium: 1.35, delta: -0.26 },
          { strike: 487, type: "put", action: "buy", premium: 0.85, delta: -0.18 },
        ],
        credit: 0.5,
        maxRisk: 450,
        probabilityOfProfit: 0.74,
        riskReward: 2.7,
        daysToExpiration: input.daysToExpiration,
      },
    ];
  }
  return sorted;
}
