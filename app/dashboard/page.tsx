import { AppShell } from "@/components/dashboard/app-shell";
import { DailySetupCard } from "@/components/dashboard/daily-setup-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MarketModeWidget } from "@/components/dashboard/market-mode-widget";
import { StrategySuggestionsWidget } from "@/components/dashboard/strategy-suggestions-widget";
import { ExpectedMoveChart } from "@/components/charts/expected-move-chart";
import { getMarketMode } from "@/lib/calculations/market-mode";
import { runScanner } from "@/lib/calculations/scanner";
import {
  mockIndexQuotes,
  mockVIX,
  mockExpectedMoveWeekly,
  mockSPYExpectedMoveBands,
} from "@/lib/market/mock-data";

export default function DashboardPage() {
  const spy = mockIndexQuotes.find((q) => q.symbol === "SPY")!;
  const qqq = mockIndexQuotes.find((q) => q.symbol === "QQQ")!;
  const marketMode = getMarketMode(mockVIX, spy.changePercent);
  const strategySuggestions = runScanner({
    ticker: "SPY",
    maxRisk: 500,
    minProbability: 70,
    daysToExpiration: 14,
  });

  return (
    <AppShell>
      <div className="space-y-6 px-4 lg:px-6">
        <DailySetupCard
          marketMode={marketMode}
          expectedMoveDollars={mockExpectedMoveWeekly}
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
            value={mockVIX.toFixed(2)}
            subtitle="CBOE Volatility Index"
          />
          <KpiCard
            title="Expected Move (1W)"
            value={`$${mockExpectedMoveWeekly.toFixed(2)}`}
            subtitle="SPY 1 standard deviation"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <MarketModeWidget mode={marketMode} />
          <StrategySuggestionsWidget
            strategies={strategySuggestions}
            expectedMoveDollars={mockExpectedMoveWeekly}
            spot={spy.price}
          />
        </div>

        <ExpectedMoveChart data={mockSPYExpectedMoveBands} />
      </div>
    </AppShell>
  );
}
