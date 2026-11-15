import React from "react";
import type { Metadata } from "next";
import { getRetreats } from "@/lib/wordpress/retreats";
import { RetreatCard } from "@/components/RetreatCard";
import { Mountain, ArrowUpRight } from "lucide-react";
import { Retreat } from "@/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Retreats — Still Mountain Wellness Retreat",
  description:
    "Explore noble silence, classical pranayama intensives, and yoga nidra sanctuaries at Still Mountain Wellness Retreat (smwr.org).",
};

export default async function RetreatsPage() {
  const retreats = await getRetreats();

  return (
    <div className="pt-28 sm:pt-36 pb-20 space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Section */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#FAF7F2] text-[#263F35] border border-[#D6C6A5] px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase">
            <Mountain className="w-3.5 h-3.5 text-[#82947A]" />
            <span>Still Mountain Wellness Retreat &bull; smwr.org</span>
          </div>
          <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-[#263F35] leading-tight">
            Residential Immersions & Sanctuaries.
          </h1>
          <p className="text-[#355245] text-lg sm:text-xl leading-relaxed font-normal">
            Still Mountain Wellness Retreat hosts residential noble silence retreats in the mountain foothills. Discover our upcoming calendar or book directly at smwr.org.
          </p>
          <div className="pt-2">
            <a
              href="https://smwr.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#263F35] hover:bg-[#1A2D25] text-[#FAF7F2] px-6 py-3 rounded-xl font-medium text-sm transition-colors"
            >
              <span>Visit Main Retreat Portal at smwr.org</span>
              <ArrowUpRight className="w-4 h-4 text-[#D6C6A5]" />
            </a>
          </div>
        </div>

        {/* Retreats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {retreats.map((retreat: Retreat) => (
            <RetreatCard key={retreat.id} retreat={retreat} />
          ))}
        </div>
      </div>
    </div>
  );
}
