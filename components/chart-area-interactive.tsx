"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from '@/hooks/use-mobile'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'

export const description = "An interactive area chart"

const chartData = [
  { date: "2024-04-01", portfolio: 44200, spy: 518 },
  { date: "2024-04-08", portfolio: 43800, spy: 512 },
  { date: "2024-04-15", portfolio: 44100, spy: 506 },
  { date: "2024-04-22", portfolio: 43500, spy: 501 },
  { date: "2024-04-29", portfolio: 44400, spy: 509 },
  { date: "2024-05-06", portfolio: 44800, spy: 518 },
  { date: "2024-05-13", portfolio: 45200, spy: 524 },
  { date: "2024-05-20", portfolio: 44900, spy: 530 },
  { date: "2024-05-27", portfolio: 45500, spy: 526 },
  { date: "2024-06-03", portfolio: 45800, spy: 534 },
  { date: "2024-06-10", portfolio: 46200, spy: 542 },
  { date: "2024-06-17", portfolio: 46500, spy: 548 },
  { date: "2024-06-24", portfolio: 47250, spy: 545 },
  { date: "2024-06-30", portfolio: 47250, spy: 550 },
]

const chartConfig = {
  portfolio: {
    label: "Portfolio",
    color: "var(--primary)",
  },
  spy: {
    label: "SPY",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") daysToSubtract = 30
    else if (timeRange === "7d") daysToSubtract = 7
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Portfolio vs SPY</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Portfolio value and SPY (reference) over time
          </span>
          <span className="@[540px]/card:hidden">Portfolio vs SPY</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillPortfolio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-portfolio)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-portfolio)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillSpy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-spy)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-spy)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="portfolio"
              type="natural"
              fill="url(#fillPortfolio)"
              stroke="var(--color-portfolio)"
              stackId="a"
            />
            <Area
              dataKey="spy"
              type="natural"
              fill="url(#fillSpy)"
              stroke="var(--color-spy)"
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
