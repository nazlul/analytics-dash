"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card"
import {
  ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent
} from "@/components/ui/chart"

const chartData = [
  { month: "Jan 1", clicks: 286 },
  { month: "Jan 15", clicks: 305 },
  { month: "Jan 29", clicks: 137 },
  { month: "Feb 12", clicks: 73 },
  { month: "Feb 26", clicks: 209 },
]

const chartConfig = {
  clicks: {
    label: "clicks",
    color: "#439B82",
  },
} satisfies ChartConfig

export function LineChart() {
  return (
    <Card className="w-full bg-[#FFF5EE]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">Clicks</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] sm:h-[300px] md:h-[350px]">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <AreaChart
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              ticks={[100, 200, 300]}
              fontSize={12}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="clicks"
              type="natural"
              fill="var(--color-clicks)"
              fillOpacity={0.2}
              stroke="var(--color-clicks)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
