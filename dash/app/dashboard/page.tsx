"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import MainNav from "@/components/main-nav"
import { LineChart } from "@/components/charts/lineChart"
import { BarC } from "@/components/charts/barChart"
import { PieC } from "@/components/charts/pieChart"
import CampaignStats from "@/components/CampaignStats"
import type { Metric } from "@/components/CampaignStats"
import CampaignTable from "@/components/CampaignTable"
import { fetchProtectedData } from "../auth/auth"
import { DatePicker } from "@/components/DatePicker"

const currentYear = new Date().getFullYear()

export default function Page() {
  const router = useRouter()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedMetric, setSelectedMetric] = useState<Metric>("clicks") 

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetchProtectedData()
      } catch {
        router.replace("/users/signin")
      }
    }
    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-[#35204D] text-[#35204D] overflow-x-hidden">
      <MainNav />
      <main className="mx-4 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 py-6">
        <div className="flex justify-end mb-4">
          <DatePicker
            year={selectedYear}
            month={selectedMonth}
            onChange={(year, month) => {
              setSelectedYear(year)
              setSelectedMonth(month)
            }}
          />
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LineChart selectedYear={selectedYear} selectedMonth={selectedMonth} selectedMetric={selectedMetric}/>
          <BarC selectedYear={selectedYear} selectedMonth={selectedMonth} selectedMetric={selectedMetric}/>
          <PieC selectedYear={selectedYear} selectedMonth={selectedMonth} selectedMetric={selectedMetric}/>
        </section>

        <section className="mt-8">
          <CampaignStats
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            selectedMetric={selectedMetric}
            onMetricChange={setSelectedMetric}
          />
        </section>

        <section className="mt-6">
          <CampaignTable />
        </section>
      </main>
    </div>
  )
}
