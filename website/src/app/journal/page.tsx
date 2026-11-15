import React from "react";
import type { Metadata } from "next";
import { getPosts } from "@/lib/wordpress/posts";
import { JournalFilterGrid } from "@/components/JournalFilterGrid";
import { AppCtaSection } from "@/components/AppCtaSection";
import { BookOpen } from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Journal & Essays — Breath Science & Stillness | Still Mountain",
  description:
    "Essays and research on classical pranayama, the neurobiology of slow exhalations, autonomic regulation, and contemplative stillness.",
};

export default async function JournalPage() {
  const articles = await getPosts();

  return (
    <div className="pt-28 sm:pt-36 pb-20 space-y-20 sm:space-y-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Section */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#FAF7F2] text-[#263F35] border border-[#D6C6A5] px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase">
            <BookOpen className="w-3.5 h-3.5 text-[#82947A]" />
            <span>Still Mountain Journal</span>
          </div>

          <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-[#263F35] leading-tight">
            The Science & Spirit of Classical Pranayama.
          </h1>

          <p className="text-[#355245] text-lg sm:text-xl leading-relaxed font-normal">
            In-depth writings exploring the intersection of authentic Himalayan breath traditions, autonomic vagal regulation, and the contemplative practice of stillness.
          </p>
        </div>

        {/* Interactive Filter Grid */}
        <JournalFilterGrid initialArticles={articles} />
      </div>

      {/* App CTA */}
      <AppCtaSection />
    </div>
  );
}
