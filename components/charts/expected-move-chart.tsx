"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ExpectedMoveBand } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const chartConfig = {
  price: { label: "Price", color: "hsl(var(--primary))" },
  upper: { label: "Upper", color: "hsl(var(--chart-2))" },
  lower: { label: "Lower", color: "hsl(var(--chart-3))" },
};

interface ExpectedMoveChartProps {
  data: ExpectedMoveBand[];
  title?: string;
  description?: string;
}

export function ExpectedMoveChart({
  data,
  title = "SPY Price & Expected Move",
  description = "Price with 1 standard deviation expected move band (weekly)",
}: ExpectedMoveChartProps) {
  return (
    <Card className="border-border/50 min-w-0 bg-card">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] min-h-[280px] w-full min-w-0">
          <ResponsiveContainer width="100%" height={280} minHeight={280}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillUpper" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-upper)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-upper)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillLower" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-lower)" stopOpacity={0} />
                  <stop offset="100%" stopColor="var(--color-lower)" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-price)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-price)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                labelFormatter={(v) =>
                  new Date(v).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }
                formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
              />
              <Area
                type="monotone"
                dataKey="upper"
                stroke={chartConfig.upper.color}
                fill="url(#fillUpper)"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke={chartConfig.lower.color}
                fill="url(#fillLower)"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartConfig.price.color}
                fill="url(#fillPrice)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
