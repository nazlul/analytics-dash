"use client"

import React, { useEffect, useState } from "react"
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart" 

const chartColors: Record<string, string> = {
  clicks: "#439B82",
  impressions: "#35204D",
  cpc: "#FFA366",
  ctr: "#A9170A",
}

const chartConfig: Record<string, ChartConfig> = {
  clicks: {
    label: { label: "Clicks" },
    color: { color: chartColors.clicks },
  },
  impressions: {
    label: { label: "Impressions" },
    color: { color: chartColors.impressions },
  },
  cpc: {
    label: { label: "Average CPC" },
    color: { color: chartColors.cpc },
  },
  ctr: {
    label: { label: "CTR" },
    color: { color: chartColors.ctr },
  },
}


interface BarCProps {
  selectedYear: number
  selectedMonth: number
  selectedMetric: "clicks" | "impressions" | "cpc" | "ctr"
}

interface CampaignData {
  campaign: string
  value: number
}

export function BarC({ selectedYear, selectedMonth, selectedMetric }: BarCProps) {
  const [data, setData] = useState<CampaignData[]>([])
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

        const campaignValues = new Map<string, number>()
        for (const item of json as { campaign: string; metric_value: number }[]) {
          const campaign = item.campaign || "Unknown Campaign"
          campaignValues.set(
            campaign,
            (campaignValues.get(campaign) || 0) + item.metric_value
          )
        }

        const arr = Array.from(campaignValues.entries()).map(([campaign, value]) => ({
          campaign,
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

  function formatValue(value: number) {
    if (selectedMetric === "cpc" || selectedMetric === "ctr") {
      return Number(value).toFixed(2)
    }
    return value.toString()
  }

  return (
    <Card className="w-full h-full bg-[#FFF5EE] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base uppercase">{`Campaign ${selectedMetric}`}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-y-auto max-h-[350px]">
        {error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : loading ? (
          <div>Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-red-600">No data available for the selected period</div>
        ) : (
          <ChartContainer config={chartConfig[selectedMetric]} className="w-full h-full min-w-[300px]">
            <ResponsiveContainer width="100%" height={60 * data.length}>
              <BarChart data={data} layout="vertical" margin={{ right: 16 }}>
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="campaign" type="category" hide />
                <XAxis dataKey="value" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="value" fill={chartColors[selectedMetric]} radius={4} barSize={25}>
                  <LabelList
                    dataKey="campaign"
                    position="top"
                    className="fill-[#35204D] font-semibold whitespace-nowrap text-left"
                    fontSize={13}
                    content={({ x, y, value }) => (
                      <text
                        x={x}
                        y={Number(y) - 6}
                        fill="#35204D"
                        fontWeight="600"
                        fontSize={13}
                        textAnchor="start"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {value}
                      </text>
                    )}
                  />
                  <LabelList
                    dataKey="value"
                    position="right"
                    className="fill-[#35204D] font-bold"
                    fontSize={12}
                    formatter={formatValue}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
