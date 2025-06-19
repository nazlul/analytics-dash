"use client"

import { useEffect, useState } from "react"

export type Metric = "clicks" | "impressions" | "cpc" | "ctr"

type Stats = {
  clicks: number
  impressions: number
  cpc: number
  ctr: number
}

interface CampaignStatsProps {
  selectedYear: number
  selectedMonth: number
  selectedMetric: Metric
  onMetricChange: (metric: Metric) => void
}

export default function CampaignStats({
  selectedYear,
  selectedMonth,
  selectedMetric,
  onMetricChange,
}: CampaignStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null)
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
    const fetchStats = async () => {
      setError(null)
      const { since, until } = getDateRange()

      try {
        const metrics: Metric[] = ["clicks", "impressions", "cpc", "ctr"]

        const results = await Promise.all(
          metrics.map(async (metric) => {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fb-insights/monthly?since=${since}&until=${until}&metric=${metric}`
            )
            const json = await res.json()

            if (!res.ok) {
              const detail = typeof json.detail === "string" ? json.detail : JSON.stringify(json)
              throw new Error(detail)
            }

            if (!Array.isArray(json)) {
              throw new Error(`Expected array but got ${typeof json}: ${JSON.stringify(json)}`)
            }

            return { metric, data: json }
          })
        )

        const aggregatedStats: Stats = {
          clicks: 0,
          impressions: 0,
          cpc: 0,
          ctr: 0,
        }

        for (const result of results) {
          const values = result.data.map((entry: any) => entry.metric_value ?? 0)
          const sum = values.reduce((acc, val) => acc + val, 0)

          if (result.metric === "cpc" || result.metric === "ctr") {
            aggregatedStats[result.metric] = values.length ? sum / values.length : 0
          } else {
            aggregatedStats[result.metric] = sum
          }
        }

        setStats(aggregatedStats)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    }

    fetchStats()
  }, [selectedYear, selectedMonth])

  if (error) {
    return <div className="text-red-600 mt-4">Error: {error}</div>
  }

  if (!stats) {
    return <div className="text-[#FFF5EE] mt-4">Loading...</div>
  }

  const metricCards = [
    {
      key: "clicks",
      label: "Clicks",
      value: stats.clicks.toLocaleString(),
    },
    {
      key: "impressions",
      label: "Impressions",
      value: stats.impressions.toLocaleString(),
    },
    {
      key: "cpc",
      label: "Average CPC",
      value: `₹${stats.cpc.toFixed(2)}`,
    },
    {
      key: "ctr",
      label: "CTR",
      value: `${stats.ctr.toFixed(1)}%`,
    },
  ] as const

  return (
    <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4">
      {metricCards.map((item) => {
        const isSelected = selectedMetric === item.key
        return (
          <button
            key={item.key}
            onClick={() => onMetricChange(item.key)}
            className={`border rounded-xl p-4 shadow-sm flex flex-col justify-between h-24 text-left transition
              ${isSelected ? "bg-[#f0fcf9] text-[#35204D] transform transition-all duration-100 border-3 border-[#439B82]" : "bg-[#FFF5EE] text-[#35204D]"}
              hover:bg-[#d0efe6]`}
          >
            <span className={`text-xs font-medium ${isSelected ? "text-[#35204D]" : "text-muted-foreground"}`}>
              {item.label}
            </span>
            <span className="text-2xl font-bold text-center mt-2">{item.value}</span>
          </button>
        )
      })}
    </div>
  )
}
