import { NextRequest } from "next/server";
import { getOptionChain } from "@/lib/market/data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker") ?? "SPY";
  const chain = await getOptionChain(ticker);
  return Response.json(chain);
}
