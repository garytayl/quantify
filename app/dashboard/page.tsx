import { AppShell } from "@/components/dashboard/app-shell";
import { DailySetupCard } from "@/components/dashboard/daily-setup-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MarketModeWidget } from "@/components/dashboard/market-mode-widget";
import { StrategySuggestionsWidget } from "@/components/dashboard/strategy-suggestions-widget";
import { ExpectedMoveChart } from "@/components/charts/expected-move-chart";
import { getMarketMode } from "@/lib/calculations/market-mode";
import { runScannerWithChain } from "@/lib/calculations/scanner";
import {
  getIndexQuotes,
  getVIX,
  getExpectedMoveWeekly,
  getOptionChain,
  getSpot,
  getSPYExpectedMoveBands,
} from "@/lib/market/data";

export default async function DashboardPage() {
  const [quotes, vix, chain, spot] = await Promise.all([
    getIndexQuotes(),
    getVIX(),
    getOptionChain("SPY"),
    getSpot("SPY"),
  ]);
  const spy = quotes.find((q) => q.symbol === "SPY")!;
  const qqq = quotes.find((q) => q.symbol === "QQQ")!;
  const expectedMoveWeekly = getExpectedMoveWeekly(spot);
  const marketMode = getMarketMode(vix, spy.changePercent);
  const strategySuggestions = runScannerWithChain(chain, spot, {
    ticker: "SPY",
    maxRisk: 500,
    minProbability: 70,
    daysToExpiration: 14,
  });
  const spyExpectedMoveBands = getSPYExpectedMoveBands();

  return (
    <AppShell>
      <div className="space-y-6 px-4 lg:px-6">
        <DailySetupCard
          marketMode={marketMode}
          expectedMoveDollars={expectedMoveWeekly}
        />

        <div className="grid gap-4 @xl/main:grid-cols-2 @4xl/main:grid-cols-4">
          <KpiCard
            title="SPY Price"
            value={`$${spy.price.toFixed(2)}`}
            change={spy.change}
            changePercent={spy.changePercent}
          />
          <KpiCard
            title="QQQ Price"
            value={`$${qqq.price.toFixed(2)}`}
            change={qqq.change}
            changePercent={qqq.changePercent}
          />
          <KpiCard
            title="VIX"
            value={vix.toFixed(2)}
            subtitle="CBOE Volatility Index"
          />
          <KpiCard
            title="Expected Move (1W)"
            value={`$${expectedMoveWeekly.toFixed(2)}`}
            subtitle="SPY 1 standard deviation"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <MarketModeWidget mode={marketMode} />
          <StrategySuggestionsWidget
            strategies={strategySuggestions}
            expectedMoveDollars={expectedMoveWeekly}
            spot={spy.price}
          />
        </div>

        <ExpectedMoveChart data={spyExpectedMoveBands} />
      </div>
    </AppShell>
  );
}
