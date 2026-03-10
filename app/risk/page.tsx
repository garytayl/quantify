"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { AppShell } from "@/components/dashboard/app-shell";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTradingStore } from "@/lib/store/use-trading-store";

const PIE_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export default function RiskPage() {
  const { risk, journal } = useTradingStore();

  const riskPieData = useMemo(
    () => [
      { name: "Open Risk", value: risk.openRisk, color: PIE_COLORS[0] },
      { name: "Available", value: Math.max(0, risk.totalCapital - risk.openRisk), color: PIE_COLORS[1] },
    ],
    [risk.openRisk, risk.totalCapital]
  );

  const plChartData = useMemo(() => {
    const byMonth: Record<string, number> = {};
    journal.forEach((e) => {
      const month = e.exitDate.slice(0, 7);
      byMonth[month] = (byMonth[month] ?? 0) + e.profitLoss;
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, pnl]) => ({ month, pnl }));
  }, [journal]);

  return (
    <AppShell>
      <div className="min-w-0 space-y-6 px-4 lg:px-6">
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 @xl/main:grid-cols-2 @4xl/main:grid-cols-5">
          <KpiCard title="Total Capital" value={`$${risk.totalCapital.toLocaleString()}`} />
          <KpiCard title="Open Risk" value={`$${risk.openRisk.toLocaleString()}`} />
          <KpiCard title="Max Risk per Trade" value={`$${risk.maxRiskPerTrade}`} />
          <KpiCard
            title="Profit This Month"
            value={`$${risk.profitThisMonth}`}
            change={risk.profitThisMonth}
            changePercent={risk.profitThisMonth > 0 ? (risk.profitThisMonth / risk.totalCapital) * 100 : undefined}
          />
          <KpiCard title="Win Rate" value={`${(risk.winRate * 100).toFixed(0)}%`} />
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <Card className="border-border/50 min-w-0 bg-card">
            <CardHeader>
              <CardTitle>P/L Over Time</CardTitle>
              <CardDescription>Realized P/L by month from journal.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[240px] min-h-[240px] w-full min-w-0">
                {plChartData.length === 0 ? (
                  <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                    No P/L data yet. Log trades in Journal.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240} minHeight={240}>
                    <AreaChart data={plChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        formatter={(v: number) => [`$${v.toFixed(0)}`, "P/L"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="pnl"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary) / 0.2)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 min-w-0 bg-card">
            <CardHeader>
              <CardTitle>Risk Exposure</CardTitle>
              <CardDescription>Open risk vs available capital.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[240px] min-h-[240px] w-full min-w-0">
                <ResponsiveContainer width="100%" height={240} minHeight={240}>
                  <PieChart>
                    <Pie
                      data={riskPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {riskPieData.map((_, i) => (
                        <Cell key={i} fill={riskPieData[i].color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`$${v}`, ""]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
