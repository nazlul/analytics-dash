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

interface PieCProps {
  selectedYear: number
  selectedMonth: number
  selectedMetric: "clicks" | "impressions" | "cpc" | "ctr"
}

interface PlatformData {
  platform: string
  value: number
}

export function PieC({ selectedYear, selectedMonth, selectedMetric }: PieCProps) {
  const [data, setData] = useState<PlatformData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const getDateRange = () => {
    const since = new Date(selectedYear, selectedMonth - 1, 1)
    const until = new Date(selectedYear, selectedMonth, 0)
    return {
      since: since.toISOString().split("T")[0],
      until: until.toISOString().split("T")[0],
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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fb-insights/monthly?since=${since}&until=${until}&metric=${selectedMetric}`
        )
        const json = await res.json()

        if (!res.ok) {
          throw new Error(typeof json.detail === "string" ? json.detail : JSON.stringify(json))
        }

        const map = new Map<string, number>()
        for (const item of json as { publisher_platform: string; metric_value: number }[]) {
          const platform = item.publisher_platform || "Unknown"
          map.set(platform, (map.get(platform) || 0) + item.metric_value)
        }

        const arr = Array.from(map.entries()).map(([platform, value]) => ({
          platform,
          value,
        }))

        setData(arr)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedMonth, selectedYear, selectedMetric])

  const total = data.reduce((acc, cur) => acc + cur.value, 0)

  const platformColors: Record<string, string> = {
    facebook: "#439B82",
    instagram: "#35204D",
    messenger: "#1877F2",
  }

  function formatValue(value: number) {
    if (selectedMetric === "cpc" || selectedMetric === "ctr") {
      return Number(value).toFixed(2)
    }
    return value.toString()
  }
  
  return (
    <Card className="w-full h-full bg-[#FFF5EE] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base uppercase">Publisher Platforms - {selectedMetric}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : loading ? (
          <div>Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-red-600">No data available for the selected period</div>
        ) : (
          <ChartContainer config={{ [selectedMetric]: { label: selectedMetric, color: "#439B82" } }} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="platform"
                  innerRadius="60%"
                  outerRadius="100%"
                  strokeWidth={5}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={platformColors[entry.platform.toLowerCase()] || "#FFA366"} />
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
                          {total.toLocaleString()}
                          <tspan x={viewBox.cx} dy="1.4em" className="fill-[#35204D] text-sm">
                            {selectedMetric}
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

     