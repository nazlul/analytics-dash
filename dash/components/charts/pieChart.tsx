"use client"

import React, { useEffect, useState } from "react"
import { Pie, PieChart, Label, ResponsiveContainer, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart"

const chartConfig = {
  clicks: {
    label: "Clicks",
    color: "#439B82"
  }
}

interface PlatformData {
  platform: string
  clicks: number
}

export function PieC({
  selectedYear,
  selectedMonth
}: {
  selectedYear: number
  selectedMonth: number
}) {
  const [data, setData] = useState<PlatformData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const getDateRange = () => {
    const since = new Date(selectedYear, selectedMonth - 1, 1)
    const until = new Date(selectedYear, selectedMonth, 0)
    return {
      since: since.toISOString().split("T")[0],
      until: until.toISOString().split("T")[0]
    }
  }

  useEffect(() => {
    async function fetchData() {
      setError(null)
      setLoading(true)
      setData([])

      const { since, until } = getDateRange()
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fb-insights/monthly?since=${since}&until=${until}&metric=clicks`
        )
        const json = await res.json()

        if (!res.ok) {
          throw new Error(typeof json.detail === "string" ? json.detail : JSON.stringify(json))
        }

        const platformClicks = new Map<string, number>()
        for (const item of json as { publisher_platform: string; metric_value: number }[]) {
          const platform = item.publisher_platform || "Unknown"
          platformClicks.set(platform, (platformClicks.get(platform) || 0) + item.metric_value)
        }

        const arr = Array.from(platformClicks.entries()).map(([platform, clicks]) => ({
          platform,
          clicks
        }))

        setData(arr)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedMonth, selectedYear])

  const totalClicks = data.reduce((acc, cur) => acc + cur.clicks, 0)

  const platformColors: Record<string, string> = {
    facebook: "#439B82",
    instagram: "#35204D",
    messenger: "#1877F2"
  }

  return (
    <Card className="w-full h-full bg-[#FFF5EE] flex flex-col">
      <CardHeader className="items-center pb-2 flex justify-between">
        <div>
          <CardTitle className="text-base">Publisher Platforms</CardTitle>
          <CardDescription>
            {`${new Date(selectedYear, selectedMonth - 1).toLocaleString("default", {
              month: "long"
            })} ${selectedYear}`}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : loading ? (
          <div>Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-red-600">No data available for the selected period</div>
        ) : (
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={data}
                  dataKey="clicks"
                  nameKey="platform"
                  innerRadius="60%"
                  outerRadius="100%"
                  strokeWidth={5}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        platformColors[entry.platform.toLowerCase()] || "#FFA366"
                      }
                    />
                  ))}
                  <Label
                    content={({ viewBox }) =>
                      viewBox && "cx" in viewBox && "cy" in viewBox ? (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-[#35204D] text-xl font-bold"
                        >
                          {totalClicks.toLocaleString()}
                          <tspan x={viewBox.cx} dy="1.4em" className="fill-[#35204D] text-sm">
                            Clicks
                          </tspan>
                        </text>
                      ) : null
                    }
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
