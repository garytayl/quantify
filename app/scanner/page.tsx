"use client";

import { useState } from "react";
import { AppShell } from "@/components/dashboard/app-shell";
import { StrategyCard } from "@/components/trading/strategy-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { StrategyResult } from "@/types";

type Ticker = "SPY" | "QQQ" | "IWM";

export default function ScannerPage() {
  const [ticker, setTicker] = useState<Ticker>("SPY");
  const [maxRisk, setMaxRisk] = useState(500);
  const [minProb, setMinProb] = useState(70);
  const [dte, setDte] = useState(14);
  const [results, setResults] = useState<StrategyResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"probability" | "credit" | "risk">("probability");

  async function handleScan() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ticker,
        maxRisk: String(maxRisk),
        minProb: String(minProb),
        dte: String(dte),
      });
      const res = await fetch(`/api/scan?${params}`);
      const r = (await res.json()) as StrategyResult[];
      setResults(Array.isArray(r) ? r : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  const displayedResults = [...results].sort((a, b) => {
    if (sortBy === "probability") return b.probabilityOfProfit - a.probabilityOfProfit;
    if (sortBy === "credit") return b.credit - a.credit;
    return a.maxRisk - b.maxRisk;
  });

  return (
    <AppShell>
      <div className="space-y-6 px-4 lg:px-6">
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Strategy Scanner</CardTitle>
            <CardDescription>
              Find high-probability option spreads by ticker, max risk, and minimum probability of profit.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Ticker</Label>
              <select
                className="border-input bg-background flex h-9 w-24 rounded-md border px-3 py-1 text-sm"
                value={ticker}
                onChange={(e) => setTicker(e.target.value as Ticker)}
              >
                <option value="SPY">SPY</option>
                <option value="QQQ">QQQ</option>
                <option value="IWM">IWM</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Max Risk ($)</Label>
              <Input
                type="number"
                value={maxRisk}
                onChange={(e) => setMaxRisk(Number(e.target.value))}
                className="w-28"
              />
            </div>
            <div className="space-y-2">
              <Label>Min Probability (%)</Label>
              <Input
                type="number"
                min={50}
                max={95}
                value={minProb}
                onChange={(e) => setMinProb(Number(e.target.value))}
                className="w-28"
              />
            </div>
            <div className="space-y-2">
              <Label>Days to Expiration</Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={dte}
                onChange={(e) => setDte(Number(e.target.value))}
                className="w-28"
              />
            </div>
            <Button onClick={handleScan} disabled={loading}>{loading ? "Scanning…" : "Scan"}</Button>
          </CardContent>
        </Card>

        {searched && (
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h2 className="mr-2 text-lg font-semibold">Results</h2>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={sortBy === "probability" ? "default" : "outline"}
                  onClick={() => setSortBy("probability")}
                >
                  High Probability
                </Button>
                <Button
                  size="sm"
                  variant={sortBy === "credit" ? "default" : "outline"}
                  onClick={() => setSortBy("credit")}
                >
                  High Credit
                </Button>
                <Button
                  size="sm"
                  variant={sortBy === "risk" ? "default" : "outline"}
                  onClick={() => setSortBy("risk")}
                >
                  Low Risk
                </Button>
              </div>
            </div>
            {results.length === 0 ? (
              <p className="text-muted-foreground">No strategies match your filters. Try lowering min probability or increasing max risk.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayedResults.map((s) => (
                  <StrategyCard key={s.id} s={s} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
