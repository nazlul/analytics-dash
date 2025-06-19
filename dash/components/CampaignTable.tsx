"use client"

import { useEffect, useState } from "react"

type CampaignRow = {
  campaign: string
  clicks: number
  impressions: number
  cpc: number
  ctr: number
}

export default function CampaignTable() {
  const [data, setData] = useState<CampaignRow[]>([])
  const [sortBy, setSortBy] = useState<keyof CampaignRow>("clicks")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [tooltip, setTooltip] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllTimeData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fb-insights/all-time?limit=100`)
        const json = await res.json()
        console.log("Fetched data:", json)
        if (!res.ok) {
          throw new Error(typeof json.detail === "string" ? json.detail : JSON.stringify(json.detail || json))
        }

        if (!json.data || !Array.isArray(json.data)) {
          throw new Error("Invalid data format from server")
        }

        setData(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    }

    fetchAllTimeData()
  }, [])

  const handleSort = (column: keyof CampaignRow) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleMouseEnter = (e: React.MouseEvent, text: string) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 })
    setTooltip(text)
  }

  const handleMouseLeave = () => setTooltip(null)

  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortBy]
    const valB = b[sortBy]
    if (typeof valA === "string" && typeof valB === "string") {
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA)
    }
    return sortOrder === "asc" ? Number(valA) - Number(valB) : Number(valB) - Number(valA)
  })

  if (error) {
    return <div className="text-red-600 mt-4">Error: {error}</div>
  }

  return (
    <div className="mt-10 relative max-h-[550px] overflow-y-auto rounded-xl shadow-md">
      <table className="min-w-full bg-[#FFF5EE] border">
        <thead>
          <tr className="bg-[#FFF5EE] text-left text-sm text-gray-600 sticky top-0 z-10">
            <th className="px-4 py-3 border-b">Campaign</th>
            {[
              { key: "clicks", label: "Clicks", tooltip: "Total Clicks your ad received" },
              { key: "impressions", label: "Impressions", tooltip: "Number of times your ad was displayed" },
              { key: "cpc", label: "Avg CPC", tooltip: "Cost paid per click on average" },
              { key: "ctr", label: "CTR", tooltip: "Click-through-rate is the ratio of people that see an ad versus click on it" },
            ].map(({ key, label, tooltip }) => (
              <th
                key={key}
                onClick={() => handleSort(key as keyof CampaignRow)}
                onMouseEnter={(e) => handleMouseEnter(e, tooltip)}
                onMouseLeave={handleMouseLeave}
                className="px-4 py-3 border-b cursor-pointer select-none"
              >
                {label} {sortBy === key && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={index} className="text-gray-700 hover:bg-[#ffeee2]">
              <td className="px-4 py-2 border-b">{row.campaign}</td>
              <td className="px-4 py-2 border-b">{row.clicks}</td>
              <td className="px-4 py-2 border-b">{row.impressions}</td>
              <td className="px-4 py-2 border-b">₹{row.cpc.toFixed(2)}</td>
              <td className="px-4 py-2 border-b">{row.ctr.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {tooltip && (
        <div
          className="fixed z-50 bg-black text-white text-xs px-2 py-2 rounded-md w-44 mt-3 text-center pointer-events-none"
          style={{
            top: `${tooltipPosition.y}px`,
            left: `${tooltipPosition.x}px`,
            transform: 'translateX(-100%) translateY(-100%)',
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  )
}
