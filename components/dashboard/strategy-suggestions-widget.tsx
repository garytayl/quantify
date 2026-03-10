import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { StrategyResult, SpreadStrategyType } from "@/types";

const strategyLabels: Record<SpreadStrategyType, string> = {
  bull_put: "Bull Put Spread",
  bear_call: "Bear Call Spread",
  iron_condor: "Iron Condor",
};

function getReason(
  s: StrategyResult,
  spot: number,
  expectedMoveDollars: number
): string {
  const lower = spot - expectedMoveDollars;
  const upper = spot + expectedMoveDollars;
  const shortStrike =
    s.legs.find((l) => l.action === "sell")?.strike ?? 0;
  if (s.type === "bull_put" && shortStrike < lower) {
    return "Short put is below expected move range — high probability of expiring OTM.";
  }
  if (s.type === "bear_call" && shortStrike > upper) {
    return "Short call is above expected move range — high probability of expiring OTM.";
  }
  if (s.type === "iron_condor") {
    return "Both sides outside expected move — collecting premium with defined risk.";
  }
  return "Strike is outside expected move range.";
}

interface StrategySuggestionsWidgetProps {
  strategies: StrategyResult[];
  expectedMoveDollars: number;
  spot: number;
}

export function StrategySuggestionsWidget({
  strategies,
  expectedMoveDollars,
  spot,
}: StrategySuggestionsWidgetProps) {
  if (strategies.length === 0) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Strategy Suggestions
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No spreads meet your filters. Try Scanner with lower min probability or higher max risk.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Strategy Suggestions
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {strategies.slice(0, 3).map((s) => {
          const label = strategyLabels[s.type];
          const shortLeg = s.legs.find((l) => l.action === "sell");
          const longLeg = s.legs.find((l) => l.action === "buy");
          const strikeLabel =
            shortLeg && longLeg
              ? `${shortLeg.strike} / ${longLeg.strike}`
              : "—";
          const reason = getReason(s, spot, expectedMoveDollars);

          return (
            <div
              key={s.id}
              className="rounded-lg border border-border/50 bg-muted/30 p-3 text-sm"
            >
              <p className="font-medium">{s.ticker} {label}</p>
              <p className="text-muted-foreground mt-0.5">{strikeLabel}</p>
              <p className="mt-2 text-muted-foreground">
                POP: {(s.probabilityOfProfit * 100).toFixed(0)}% · Credit: $
                {s.credit.toFixed(2)} · Risk: ${s.maxRisk.toFixed(0)}
              </p>
              <p className="mt-2 text-muted-foreground text-xs italic">
                {reason}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
