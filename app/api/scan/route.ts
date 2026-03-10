import { NextRequest } from "next/server";
import { runScannerWithChain } from "@/lib/calculations/scanner";
import { getOptionChain, getSpot } from "@/lib/market/data";
import type { TickerKey } from "@/lib/calculations/scanner";

const TICKERS: TickerKey[] = ["SPY", "QQQ", "IWM"];

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ticker = (request.nextUrl.searchParams.get("ticker") ?? "SPY") as TickerKey;
  const maxRisk = Number(request.nextUrl.searchParams.get("maxRisk")) || 500;
  const minProb = Number(request.nextUrl.searchParams.get("minProb")) || 70;
  const dte = Number(request.nextUrl.searchParams.get("dte")) || 14;

  if (!TICKERS.includes(ticker)) {
    return Response.json({ error: "Invalid ticker" }, { status: 400 });
  }

  const [chain, spot] = await Promise.all([
    getOptionChain(ticker),
    getSpot(ticker),
  ]);
  const results = runScannerWithChain(chain, spot, {
    ticker,
    maxRisk,
    minProbability: minProb,
    daysToExpiration: dte,
  });
  return Response.json(results);
}
