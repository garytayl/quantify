import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { StockPriceChart } from "@/components/charts/stock-price-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SYMBOLS, getSpot, getIndexQuotes, getExpectedMoveWeekly, getStockBars } from "@/lib/market/data";

type Props = { params: Promise<{ ticker: string }> };

export default async function StockPage({ params }: Props) {
  const { ticker } = await params;
  const upper = ticker.toUpperCase();
  if (!SYMBOLS.includes(upper as (typeof SYMBOLS)[number])) {
    notFound();
  }

  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 30);
  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);

  const [quotes, bars, spot] = await Promise.all([
    getIndexQuotes(),
    getStockBars(upper, fromStr, toStr),
    getSpot(upper),
  ]);
  const quote = quotes.find((q) => q.symbol === upper);
  const expectedMove = getExpectedMoveWeekly(spot);

  return (
    <AppShell>
      <div className="space-y-6 px-4 lg:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">← Dashboard</Link>
          </Button>
          <h1 className="text-2xl font-semibold">{upper}</h1>
        </div>

        {!quote ? (
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle>No data</CardTitle>
              <CardDescription>
                Set POLYGON_API_KEY in .env to see live quotes and charts for {upper}.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 @xl/main:grid-cols-2 @4xl/main:grid-cols-4">
              <Card className="border-border/50 bg-card">
                <CardHeader className="pb-1">
                  <p className="text-muted-foreground text-xs font-medium uppercase">Price</p>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold tabular-nums">${quote.price.toFixed(2)}</p>
                  <p className="text-muted-foreground text-sm">
                    {quote.change >= 0 ? "+" : ""}
                    {quote.change.toFixed(2)} ({quote.changePercent >= 0 ? "+" : ""}
                    {quote.changePercent.toFixed(2)}%)
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card">
                <CardHeader className="pb-1">
                  <p className="text-muted-foreground text-xs font-medium uppercase">Expected move (1W)</p>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold tabular-nums">±${expectedMove.toFixed(2)}</p>
                  <p className="text-muted-foreground text-xs">1 standard deviation</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card">
                <CardHeader className="pb-1">
                  <p className="text-muted-foreground text-xs font-medium uppercase">Options</p>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/options?ticker=${upper}`}>View chain</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card">
                <CardHeader className="pb-1">
                  <p className="text-muted-foreground text-xs font-medium uppercase">Scanner</p>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/scanner">Find spreads</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <StockPriceChart data={bars} ticker={upper} />
          </>
        )}

        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-base">Other symbols</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {SYMBOLS.filter((s) => s !== upper).map((s) => (
              <Button key={s} variant="outline" size="sm" asChild>
                <Link href={`/stock/${s}`}>{s}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
