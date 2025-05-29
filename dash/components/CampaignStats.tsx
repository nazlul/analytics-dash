"use client";

export default function CampaignStats() {
  return (
    <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4">
      {[
        { label: "Clicks", value: "1,024" },
        { label: "Impressions", value: "8,540" },
        { label: "Average CPC", value: "₹1.5" },
        { label: "CTR", value: "2.6%" }
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
  );
}
