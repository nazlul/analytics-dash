"use client"

import * as React from "react"
import { Pie, PieChart, Label, ResponsiveContainer } from "recharts"
import {
  Card, CardContent, CardHeader, CardDescription, CardTitle
} from "@/components/ui/card"
import {
  ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent
} from "@/components/ui/chart"

const chartData = [
  { browser: "instagram", visitors: 275, fill: "#ff7a00" },
  { browser: "facebook", visitors: 200, fill: "#1877F2" },
  { browser: "others", visitors: 19, fill: "#439B82" },
]

const chartConfig = {
  visitors: { label: "Clicks" },
  instagram: { label: "Instagram" },
  facebook: { label: "Facebook" },
  others: { label: "Others" },
} satisfies ChartConfig

export function PieC() {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  }, [])

  return (
    <Card className="w-full h-full bg-[#FFF5EE] flex flex-col">
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-base">Publisher Platforms</CardTitle>
        <CardDescription>January - February 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="visitors"
                nameKey="browser"
                innerRadius="60%"
                outerRadius="100%"
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-[#35204D] text-xl font-bold"
                          >
                            {totalVisitors.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 18}
                            className="fill-[#777] text-sm"
                          >
                            Clicks
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
