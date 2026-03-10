import { AppShell } from "@/components/dashboard/app-shell";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ExpectedMoveChart } from "@/components/charts/expected-move-chart";
import {
  mockIndexQuotes,
  mockVIX,
  mockExpectedMoveWeekly,
  mockSPYExpectedMoveBands,
} from "@/lib/market/mock-data";

export default function DashboardPage() {
  const spy = mockIndexQuotes.find((q) => q.symbol === "SPY")!;
  const qqq = mockIndexQuotes.find((q) => q.symbol === "QQQ")!;

  return (
    <AppShell>
      <div className="grid gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @4xl/main:grid-cols-4">
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
      <div className="px-4 lg:px-6">
        <ExpectedMoveChart data={mockSPYExpectedMoveBands} />
      </div>
    </AppShell>
  );
}
