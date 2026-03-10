import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { IndexQuote } from "@/types";

interface StockCardProps {
  quote: IndexQuote;
  className?: string;
}

export function StockCard({ quote, className }: StockCardProps) {
  const isPositive = quote.change >= 0;
  const isNegative = quote.change < 0;

  return (
    <Link
      href={`/stock/${quote.symbol}`}
      className="block min-w-0 touch-manipulation active:opacity-90"
    >
      <Card
        className={cn(
          "border-border/50 bg-card min-h-[88px] transition-colors hover:border-primary/40 hover:bg-muted/30",
          className
        )}
      >
        <CardHeader className="pb-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {quote.symbol}
          </p>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-semibold tabular-nums tracking-tight">
            ${quote.price.toFixed(2)}
          </p>
          <div className="flex items-center gap-1.5 text-sm">
            {isPositive && (
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                <IconTrendingUp className="size-3.5" />
                +{quote.changePercent.toFixed(2)}%
              </span>
            )}
            {isNegative && (
              <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400">
                <IconTrendingDown className="size-3.5" />
                {quote.changePercent.toFixed(2)}%
              </span>
            )}
          </div>
          <p className="text-muted-foreground pt-1 text-xs">Click for chart & details →</p>
        </CardContent>
      </Card>
    </Link>
  );
}
