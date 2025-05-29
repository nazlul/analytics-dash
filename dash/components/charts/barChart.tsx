"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { event: "Kasargod meetup", clicks: 180},
  { event: "Young seniors Ad", clicks: 305},
  { event: "Brand name campaign", clicks: 237},
  { event: "Psychologist hiring", clicks: 73},
  { event: "Content Creator Hiring", clicks: 209},
]

const chartConfig = {
  clicks: {
    label: "clicks",
    color: "#35204D",
  }
} satisfies ChartConfig

export function BarC() {
  return (
    <Card className="w-full h-full bg-[#FFF5EE] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Clicks</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 min-h-0">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ right: 16 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="event"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
                hide
              />
              <XAxis dataKey="clicks" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="clicks"
                layout="vertical"
                fill="#439B82"
                radius={4}
              >
                <LabelList
                  dataKey="event"
                  position="insideLeft"
                  offset={8}
                  className="fill-[#35204D] font-bold"
                  fontSize={12}
                />
                <LabelList
                  dataKey="clicks"
                  position="right"
                  offset={8}
                  className="fill-[#35204D] font-bold"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
