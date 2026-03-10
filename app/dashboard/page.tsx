import Link from "next/link";
import { AppShell } from "@/components/dashboard/app-shell";
import { DailySetupCard } from "@/components/dashboard/daily-setup-card";
import { StockCard } from "@/components/dashboard/stock-card";
import { MarketModeWidget } from "@/components/dashboard/market-mode-widget";
import { StrategySuggestionsWidget } from "@/components/dashboard/strategy-suggestions-widget";
import { ExpectedMoveChart } from "@/components/charts/expected-move-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMarketMode } from "@/lib/calculations/market-mode";
import { runScannerWithChain } from "@/lib/calculations/scanner";
import {
  getIndexQuotes,
  getVIX,
  getExpectedMoveWeekly,
  getOptionChain,
  getSpot,
  getExpectedMoveBands,
} from "@/lib/market/data";

/** Always run on the server per request so POLYGON_API_KEY is read at runtime (e.g. Vercel env vars). */
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [quotes, vix, chain, spot] = await Promise.all([
    getIndexQuotes(),
    getVIX(),
    getOptionChain("SPY"),
    getSpot("SPY"),
  ]);
  const spy = quotes.find((q) => q.symbol === "SPY");
  const expectedMoveWeekly = getExpectedMoveWeekly(spot);
  const marketMode = getMarketMode(vix, spy?.changePercent ?? 0);
  const strategySuggestions =
    chain.length > 0 && spot > 0
      ? runScannerWithChain(chain, spot, {
          ticker: "SPY",
          maxRisk: 500,
          minProbability: 70,
          daysToExpiration: 14,
        })
      : [];
  const expectedMoveBands = getExpectedMoveBands();

  const hasData = quotes.length > 0;

  return (
    <AppShell>
      <div className="min-w-0 space-y-6 px-4 sm:px-4 lg:px-6">
        {!hasData ? (
          <Card className="border-primary/20 bg-card">
            <CardHeader>
              <CardTitle>Connect real data</CardTitle>
              <CardDescription>
                Add your Polygon.io API key so you can see live quotes, charts, and option chains.
                No placeholder data is shown.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Set <code className="rounded bg-muted px-1 py-0.5">POLYGON_API_KEY</code> in your
                environment (e.g. Vercel project env vars or local <code className="rounded bg-muted px-1 py-0.5">.env.local</code>).
                Locally, restart the dev server after adding it. On Vercel, refresh the page after saving the variable.
              </p>
              <Button asChild variant="outline" size="sm">
                <a
                  href="https://polygon.io"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get API key →
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <DailySetupCard
              marketMode={marketMode}
              expectedMoveDollars={expectedMoveWeekly}
            />

            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                Symbols — click for chart & details
              </p>
              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 @xl/main:grid-cols-2 @4xl/main:grid-cols-4">
                {quotes.map((q) => (
                  <StockCard key={q.symbol} quote={q} />
                ))}
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 @xl/main:grid-cols-2 @4xl/main:grid-cols-4">
              <Card className="border-border/50 min-w-0 bg-card">
                <CardHeader className="pb-1">
                  <p className="text-muted-foreground text-xs font-medium uppercase">VIX</p>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold tabular-nums">
                    {vix > 0 ? vix.toFixed(2) : "—"}
                  </p>
                  <p className="text-muted-foreground text-xs">CBOE Volatility (not from Polygon)</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 min-w-0 bg-card">
                <CardHeader className="pb-1">
                  <p className="text-muted-foreground text-xs font-medium uppercase">Expected move (1W)</p>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold tabular-nums">
                    {expectedMoveWeekly > 0 ? `$${expectedMoveWeekly.toFixed(2)}` : "—"}
                  </p>
                  <p className="text-muted-foreground text-xs">SPY 1 std dev</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid min-w-0 gap-4 lg:grid-cols-2">
              <MarketModeWidget mode={marketMode} />
              <StrategySuggestionsWidget
                strategies={strategySuggestions}
                expectedMoveDollars={expectedMoveWeekly}
                spot={spot}
              />
            </div>

            {expectedMoveBands.length > 0 ? (
              <ExpectedMoveChart data={expectedMoveBands} />
            ) : (
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="text-base">Expected move chart</CardTitle>
                  <CardDescription>No historical band data. Use Polygon for real data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Click a symbol above (e.g. SPY) for its price chart.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
