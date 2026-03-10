import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: number;
  changePercent?: number;
  subtitle?: string;
  className?: string;
}

export function KpiCard({ title, value, change, changePercent, subtitle, className }: KpiCardProps) {
  const isPositive = change == null ? null : change >= 0;
  const isNegative = change != null && change < 0;

  return (
    <Card className={cn("border-border/50 bg-card", className)}>
      <CardHeader className="pb-1">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {title}
        </p>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
        {(change != null || changePercent != null) && (
          <div className="flex items-center gap-1.5 text-sm">
            {isPositive && (
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                <IconTrendingUp className="size-3.5" />
                {changePercent != null ? `+${changePercent.toFixed(2)}%` : `+${change}`}
              </span>
            )}
            {isNegative && (
              <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400">
                <IconTrendingDown className="size-3.5" />
                {changePercent != null ? `${changePercent.toFixed(2)}%` : change}
              </span>
            )}
          </div>
        )}
        {subtitle && (
          <p className="text-muted-foreground text-xs">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
