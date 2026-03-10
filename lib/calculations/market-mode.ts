/**
 * Derive market interpretation from VIX, SPY change, and expected move.
 * Powers the "Market Mode" and "Daily Setup" widgets.
 */

export type TrendLabel = "Up" | "Down" | "Neutral";
export type VolatilityLabel = "Low" | "Mid" | "High";
export type EnvironmentLabel = "Range" | "Trending";

export interface MarketMode {
  trend: TrendLabel;
  volatility: VolatilityLabel;
  environment: EnvironmentLabel;
}

const VIX_LOW = 15;
const VIX_HIGH = 22;
const TREND_THRESHOLD_PCT = 0.3;

export function getMarketMode(
  vix: number,
  spyChangePercent: number
): MarketMode {
  const trend: TrendLabel =
    spyChangePercent > TREND_THRESHOLD_PCT
      ? "Up"
      : spyChangePercent < -TREND_THRESHOLD_PCT
        ? "Down"
        : "Neutral";

  const volatility: VolatilityLabel =
    vix < VIX_LOW ? "Low" : vix > VIX_HIGH ? "High" : "Mid";

  const environment: EnvironmentLabel =
    volatility === "Low" && trend === "Neutral" ? "Range" : "Trending";

  return { trend, volatility, environment };
}

/** Short copy for "best strategies" given environment. */
export function getSuggestedStrategies(env: EnvironmentLabel): string[] {
  if (env === "Range") {
    return ["Bull Put Spread", "Bear Call Spread", "Iron Condor"];
  }
  if (env === "Trending") {
    return ["Bull Put Spread", "Call Debit Spread"];
  }
  return ["Bull Put Spread", "Iron Condor"];
}
