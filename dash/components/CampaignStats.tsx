"use client"

import { useEffect, useState } from "react"

type Stats = {
  clicks: number
  impressions: number
  cpc: number
  ctr: number
}

interface CampaignStatsProps {
  selectedYear: number
  selectedMonth: number
}

export default function CampaignStats({ selectedYear, selectedMonth }: CampaignStatsProps) {
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
        const metrics = ["clicks", "impressions", "cpc", "ctr"] as const

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

            return {
              metric,
              data: json,
            }
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

  return (
    <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4">
      {[
        { label: "Clicks", value: stats.clicks.toLocaleString() },
        { label: "Impressions", value: stats.impressions.toLocaleString() },
        { label: "Average CPC", value: `₹${stats.cpc.toFixed(2)}` },
        { label: "CTR", value: `${stats.ctr.toFixed(1)}%` },
      ].map((item, index) => (
        <div
          key={index}
          className="bg-[#FFF5EE] border rounded-xl p-4 shadow-sm flex flex-col justify-between h-24"
        >
          <div className="relative w-max">
            <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
          </div>
          <span className="text-2xl font-bold text-center mt-2">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
