import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { MarketMode } from "@/lib/calculations/market-mode";
import { getSuggestedStrategies } from "@/lib/calculations/market-mode";

interface DailySetupCardProps {
  marketMode: MarketMode;
  expectedMoveDollars: number;
}

export function DailySetupCard({
  marketMode,
  expectedMoveDollars,
}: DailySetupCardProps) {
  const strategies = getSuggestedStrategies(marketMode.environment);

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader className="pb-2">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Market Outlook Today
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <span className="text-muted-foreground">SPY Trend</span>
            <p className="font-medium">{marketMode.trend}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Volatility</span>
            <p className="font-medium">{marketMode.volatility}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Expected Move</span>
            <p className="font-medium tabular-nums">±${expectedMoveDollars.toFixed(2)}</p>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground mb-1.5 text-xs font-medium uppercase tracking-wide">
            Most favorable strategies
          </p>
          <ul className="text-muted-foreground list-inside list-disc space-y-0.5 text-sm">
            {strategies.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
