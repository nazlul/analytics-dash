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
        console.log("Checking authentication...");
        const data = await fetchProtectedData();
        console.log("Protected data fetched successfully:", data);
      } catch (err) {
        console.error("Authentication failed:", err);
        router.replace("/users/signin");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="w-full min-h-screen bg-[#35204D] p-4 relative">
      <MainNav />
      <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 mb-6">
        <div className="min-h-[300px]"><LineChart /></div>
        <div className="min-h-[300px]"><BarC /></div>
        <div className="min-h-[300px]"><PieC /></div>
      </div>
      <CampaignStats />
      <CampaignTable />
    </div>
  );
}
