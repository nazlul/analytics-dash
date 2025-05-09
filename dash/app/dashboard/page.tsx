"use client";

import { useState } from "react";
import { LineChart } from "@/components/charts/lineChart";
import { BarC } from "@/components/charts/barChart";
import { PieC } from "@/components/charts/pieChart";
import MainNav from "@/components/main-nav";

type CampaignRow = {
  campaign: string;
  clicks: number;
  impressions: number;
  cpc: number;
  ctr: number;
};

const initialData: CampaignRow[] = [
  { campaign: "Kasargod meetup", clicks: 180, impressions: 2400, cpc: 1.2, ctr: 3.2 },
  { campaign: "Young seniors Ad", clicks: 305, impressions: 1980, cpc: 1.4, ctr: 2.1 },
  { campaign: "Brand name campaign", clicks: 237, impressions: 3000, cpc: 1.1, ctr: 3.8 },
  { campaign: "Psychologist hiring", clicks: 73, impressions: 1600, cpc: 1.6, ctr: 1.9 },
  { campaign: "Content Creator Hiring", clicks: 209, impressions: 1600, cpc: 1.6, ctr: 1.9 },
];

export default function Page() {
  const [sortBy, setSortBy] = useState<keyof CampaignRow>("campaign");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleSort = (column: keyof CampaignRow) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, text: string) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
    setTooltip(text);
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const sortedData = [...initialData].sort((a, b) => {
    const valA = parseFloat(String(a[sortBy]).replace(/[₹,%]/g, ""));
    const valB = parseFloat(String(b[sortBy]).replace(/[₹,%]/g, ""));
    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  return (
    <div className="w-full min-h-screen p-4 relative">
      <MainNav />

      <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 mb-6">
        <div className="min-h-[300px]"><LineChart /></div>
        <div className="min-h-[300px]"><BarC /></div>
        <div className="min-h-[300px]"><PieC /></div>
      </div>

      <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4">
        {[
          { label: "Clicks", value: "1,024" },
          { label: "Impressions", value: "8,540" },
          { label: "Average CPC", value: "₹1.5" },
          { label: "CTR", value: "2.6%" }
        ].map((item, index) => (
          <div key={index} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between h-24">
            <div className="relative w-max">
              <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
            </div>
            <span className="text-2xl font-bold text-center mt-2">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 relative">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-xl shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="px-4 py-3 border-b">Campaign</th>
                {[
                  { key: "clicks", label: "Clicks", tooltip: "Total Clicks your ad received" },
                  { key: "impressions", label: "Impressions", tooltip: "Number of times your ad was displayed" },
                  { key: "cpc", label: "Average CPC", tooltip: "Cost paid per click on average" },
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
                <tr key={index} className="text-sm text-gray-700 hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{row.campaign}</td>
                  <td className="px-4 py-2 border-b">{row.clicks}</td>
                  <td className="px-4 py-2 border-b">{row.impressions}</td>
                  <td className="px-4 py-2 border-b">₹{row.cpc.toFixed(2)}</td>
                  <td className="px-4 py-2 border-b">{row.ctr.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
 
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
    </div>
  );
}
