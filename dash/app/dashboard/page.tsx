"use client";

import { LineChart } from "@/components/charts/lineChart";
import { BarC } from "@/components/charts/barChart";
import { PieC } from "@/components/charts/pieChart";
import MainNav from "@/components/main-nav";
import CampaignTable from "@/components/CampaignTable";
import CampaignStats from "@/components/CampaignStats";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchProtectedData } from "../auth/auth";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
    }

    const checkAuth = async () => {
      try {
        await fetchProtectedData();
      } catch {
        router.replace("/users/signin");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#35204D] text-[#35204D] overflow-x-hidden">
      <MainNav />
      <main className="mx-4 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 py-6">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex w-full"><LineChart /></div>
          <div className="flex w-full"><BarC /></div>
          <div className="flex w-full"><PieC /></div>
        </section>

        <section className="mt-8">
          <CampaignStats />
        </section>

        <section className="mt-6">
          <CampaignTable />
        </section>
      </main>
    </div>
  );
}
