/**
 * Options calculation engine for expected move, probability, and spread metrics.
 * Delta approximations: 10Δ ≈ 90% OTM, 15Δ ≈ 85%, 20Δ ≈ 80%.
 */

const TRADING_DAYS_PER_YEAR = 252;

/**
 * Expected move (1 std dev) in dollars.
 * expected_move = price * iv * sqrt(dte / 365)
 */
export function calculateExpectedMove(
  price: number,
  impliedVolatility: number,
  daysToExpiration: number
): number {
  const annualization = Math.sqrt(daysToExpiration / 365);
  return price * impliedVolatility * annualization;
}

/**
 * Probability OTM from delta (approximation).
 * 10 delta ≈ 90% prob OTM, 15 ≈ 85%, 20 ≈ 80%.
 * probOTM ≈ 1 - delta (for calls); for puts use delta as prob ITM.
 */
export function calculateProbabilityFromDelta(delta: number, isCall: boolean): number {
  const d = Math.abs(delta);
  // Rough mapping: 0.10 -> 90%, 0.15 -> 85%, 0.20 -> 80%, 0.50 -> 50%
  const probOTM = 1 - d;
  return isCall ? probOTM : 1 - probOTM;
}

/**
 * Probability of profit for a short option (we want it to expire OTM).
 * For short put: profit if spot > strike -> use prob spot above strike ≈ 1 - putDelta.
 */
export function probabilityOfProfitFromDelta(delta: number, isShortPut: boolean): number {
  const d = Math.abs(delta);
  if (isShortPut) return 1 - d; // short put profits when spot stays above
  return d; // short call profits when spot stays below (call delta ≈ prob above)
}

/**
 * Max risk for a spread = width - credit (for credit spreads).
 */
export function calculateSpreadRisk(width: number, credit: number): number {
  return Math.max(0, width * 100 - credit * 100);
}

/**
 * Credit received for a vertical (same expiry).
 * Legs: [{ strike, type, action, premium }]
 */
export function calculateCreditSpread(legs: { action: string; premium: number }[]): number {
  let credit = 0;
  for (const leg of legs) {
    if (leg.action === "sell") credit += leg.premium;
    else credit -= leg.premium;
  }
  return credit;
}

/**
 * Bull put spread: sell put at higher strike, buy put at lower strike.
 * Credit = sell premium - buy premium. Max risk = (width * 100) - (credit * 100).
 */
export function calculateBullPutSpread(
  sellStrike: number,
  buyStrike: number,
  sellPremium: number,
  buyPremium: number,
  sellDelta: number
): {
  credit: number;
  maxRisk: number;
  probabilityOfProfit: number;
  riskReward: number;
} {
  const width = sellStrike - buyStrike;
  const credit = sellPremium - buyPremium;
  const maxRisk = width * 100 - credit * 100;
  const pop = probabilityOfProfitFromDelta(sellDelta, true);
  const riskReward = maxRisk > 0 ? (credit * 100) / maxRisk : 0;
  return { credit, maxRisk, probabilityOfProfit: pop, riskReward };
}

/**
 * Bear call spread: sell call at lower strike, buy call at higher strike.
 */
export function calculateBearCallSpread(
  sellStrike: number,
  buyStrike: number,
  sellPremium: number,
  buyPremium: number,
  sellDelta: number
): {
  credit: number;
  maxRisk: number;
  probabilityOfProfit: number;
  riskReward: number;
} {
  const width = buyStrike - sellStrike;
  const credit = sellPremium - buyPremium;
  const maxRisk = width * 100 - credit * 100;
  // Short call profits when spot stays below; prob below ≈ 1 - call delta
  const pop = 1 - Math.abs(sellDelta);
  const riskReward = maxRisk > 0 ? (credit * 100) / maxRisk : 0;
  return { credit, maxRisk, probabilityOfProfit: pop, riskReward };
}

/**
 * Iron condor: sell OTM put spread + sell OTM call spread.
 * Credit = sum of credits. Max risk = width of wider side - credit (simplified).
 */
export function calculateIronCondor(
  putSellStrike: number,
  putBuyStrike: number,
  callSellStrike: number,
  callBuyStrike: number,
  putSellPremium: number,
  putBuyPremium: number,
  callSellPremium: number,
  callBuyPremium: number,
  putSellDelta: number,
  callSellDelta: number
): {
  credit: number;
  maxRisk: number;
  probabilityOfProfit: number;
  riskReward: number;
} {
  const putWidth = putSellStrike - putBuyStrike;
  const callWidth = callBuyStrike - callSellStrike;
  const putCredit = putSellPremium - putBuyPremium;
  const callCredit = callSellPremium - callBuyPremium;
  const credit = putCredit + callCredit;
  const maxRiskPerSide = Math.max(putWidth * 100 - putCredit * 100, callWidth * 100 - callCredit * 100);
  const maxRisk = maxRiskPerSide; // simplified: same width both sides
  const popPut = probabilityOfProfitFromDelta(putSellDelta, true);
  const popCall = 1 - Math.abs(callSellDelta);
  const probabilityOfProfit = (popPut + popCall) / 2; // rough combo
  const riskReward = maxRisk > 0 ? (credit * 100) / maxRisk : 0;
  return { credit, maxRisk, probabilityOfProfit, riskReward };
}
