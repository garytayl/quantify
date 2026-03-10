import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StrategyResult, SpreadStrategyType } from "@/types";
import { cn } from "@/lib/utils";

const strategyLabels: Record<SpreadStrategyType, string> = {
  bull_put: "Bull Put Spread",
  bear_call: "Bear Call Spread",
  iron_condor: "Iron Condor",
};

export function StrategyCard({ s }: { s: StrategyResult }) {
  const label = strategyLabels[s.type];

  const sellLegs = s.legs.filter((l) => l.action === "sell");
  const buyLegs = s.legs.filter((l) => l.action === "buy");

  return (
    <Card className="border-border/50 bg-card transition-colors hover:border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold">{s.ticker} {label}</span>
          <Badge variant="secondary" className="tabular-nums">
            {(s.probabilityOfProfit * 100).toFixed(0)}% POP
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="space-y-1">
          {sellLegs.map((l) => (
            <p key={l.strike} className="text-muted-foreground">
              Sell {l.strike} {l.type === "call" ? "Call" : "Put"}
            </p>
          ))}
          {buyLegs.map((l) => (
            <p key={l.strike} className="text-muted-foreground">
              Buy {l.strike} {l.type === "call" ? "Call" : "Put"}
            </p>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-border/50 pt-2">
          <div>
            <p className="text-muted-foreground text-xs">Credit</p>
            <p className={cn("font-medium tabular-nums", "text-emerald-600 dark:text-emerald-400")}>
              ${s.credit.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Max Risk</p>
            <p className="font-medium tabular-nums">${s.maxRisk.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Risk/Reward</p>
            <p className="font-medium tabular-nums">{s.riskReward.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">DTE</p>
            <p className="font-medium tabular-nums">{s.daysToExpiration}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
