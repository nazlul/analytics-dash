"use client"

import { useEffect, useState } from "react"
import {
  Area, AreaChart, CartesianGrid, XAxis, YAxis
} from "recharts"
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card"
import {
  ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent
} from "@/components/ui/chart"

interface FacebookInsight {
  campaign_name: string
  clicks: string
}

const chartConfig = {
  clicks: {
    label: "clicks",
    color: "#439B82",
  },
} satisfies ChartConfig

export function LineChart() {
  const [chartData, setChartData] = useState<{ label: string; clicks: number }[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fb-insights`)
        const json = await res.json()

        if (!res.ok) throw new Error(json.detail || "Fetch failed")

        const formatted = (json.data as FacebookInsight[]).map((item, index) => ({
          label: item.campaign_name || `Row ${index + 1}`,
          clicks: parseInt(item.clicks ?? "0"),
        }))

        setChartData(formatted)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    }

    fetchData()
  }, [])

  if (error) return <div className="text-red-600">Error: {error}</div>
  if (chartData.length === 0) return <div>Loading...</div>

  return (
    <Card className="w-full bg-[#FFF5EE]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">Clicks</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] sm:h-[300px] md:h-[350px]">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <AreaChart
            data={chartData}
            margin={{ left: -15, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="clicks"
              type="monotone"
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
