import { getIndexQuotes, getVIX, getSpot, getExpectedMoveWeekly } from "@/lib/market/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const [quotes, vix] = await Promise.all([
    getIndexQuotes(),
    getVIX(),
  ]);
  const spy = quotes.find((q) => q.symbol === "SPY");
  const spot = spy?.price ?? 503.21;
  const expectedMoveWeekly = getExpectedMoveWeekly(spot);
  return Response.json({
    quotes,
    vix,
    expectedMoveWeekly,
  });
}
