"use client"

import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
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

const chartConfig = {
  clicks: {
    label: "Clicks",
    color: "#439B82",
  },
}

function formatDate(dateString: string) {
  const d = new Date(dateString)
  const day = d.getDate()
  const month = d.toLocaleString("default", { month: "short" })
  return `${month} ${day}`
}

function generateXAxisTicks(year: number, month: number) {
  const days = [1, 8, 15, 22, 29]
  const lastDay = new Date(year, month, 0).getDate()
  return days.filter(d => d <= lastDay).map(d => {
    const dt = new Date(year, month - 1, d)
    return formatDate(dt.toISOString().split("T")[0])
  })
}

export function LineChart({
  selectedYear,
  selectedMonth,
}: {
  selectedYear: number
  selectedMonth: number
}) {
  const [chartData, setChartData] = useState<{ date: string; clicks: number }[]>([])
  const [error, setError] = useState<string | null>(null)

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
      setChartData([])

      const { since, until } = getDateRange()
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fb-insights/monthly?since=${since}&until=${until}&metric=clicks`
        )
        const json = await res.json()

        if (!res.ok) {
          throw new Error(typeof json.detail === "string" ? json.detail : JSON.stringify(json))
        }

        const clicksPerDay = new Map<string, number>()
        for (const item of json as { date: string; metric_value: number }[]) {
          clicksPerDay.set(
            item.date,
            (clicksPerDay.get(item.date) || 0) + item.metric_value
          )
        }

        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
        const filledData = []
        for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = new Date(selectedYear, selectedMonth - 1, d).toISOString().split("T")[0]
          filledData.push({
            date: formatDate(dateStr),
            clicks: clicksPerDay.get(dateStr) ?? 0,
          })
        }

        setChartData(filledData)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error")
      }
    }
    fetchData()
  }, [selectedMonth, selectedYear])

  const xTicks = generateXAxisTicks(selectedYear, selectedMonth)

  return (
    <Card className="w-full bg-[#FFF5EE]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">Clicks (Daily)</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] sm:h-[300px] md:h-[350px]">
        {error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : chartData.length === 0 ? (
          <div>Loading...</div>
        ) : (
          <ChartContainer config={chartConfig} className="w-full h-full">
            <AreaChart data={chartData} margin={{ left: -15, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                ticks={xTicks}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
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
        )}
      </CardContent>
    </Card>
  )
}
