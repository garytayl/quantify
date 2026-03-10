import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { MarketMode } from "@/lib/calculations/market-mode";

interface MarketModeWidgetProps {
  mode: MarketMode;
}

export function MarketModeWidget({ mode }: MarketModeWidgetProps) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Market Mode
        </p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Trend</span>
          <span className="font-medium">{mode.trend}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Volatility</span>
          <span className="font-medium">{mode.volatility}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Environment</span>
          <span className="font-medium">{mode.environment}</span>
        </div>
      </CardContent>
    </Card>
  );
}
