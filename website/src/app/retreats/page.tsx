import React from "react";
import type { Metadata } from "next";
import { getRetreats } from "@/lib/wordpress/retreats";
import { RetreatCard } from "@/components/RetreatCard";
import { AppCtaSection } from "@/components/AppCtaSection";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Himalayan Breathwork & Meditation Retreats",
  description:
    "Explore upcoming noble silence, classical pranayama intensives, and yoga nidra sanctuaries at Still Mountain.",
};

export default async function RetreatsPage() {
  const retreats = await getRetreats();

  return (
    <div className="space-y-20 py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Section */}
        <div className="max-w-3xl space-y-5">
          <span className="bg-[#C8F3FF] text-[#092832] border border-[#8EE0F7] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            Immersive In-Person Experiences
          </span>
          <h1 className="font-serif font-extrabold text-4xl sm:text-6xl text-slate-950 leading-tight">
            Sacred Stillness in the Mountain Sanctuary.
          </h1>
          <p className="text-slate-600 text-lg sm:text-xl leading-relaxed">
            Unplug from worldly urgency. Step into noble silence (*mauna*), refine advanced breath ratios under experienced resident guidance, and experience deep cellular rest.
          </p>
        </div>

        {/* Retreats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {retreats.map((retreat) => (
            <RetreatCard key={retreat.id} retreat={retreat} />
          ))}
        </div>
      </div>

      {/* App CTA */}
      <AppCtaSection />
    </div>
  );
}
