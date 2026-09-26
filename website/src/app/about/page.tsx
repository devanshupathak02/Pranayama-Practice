import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Sparkles, ArrowUpRight, ArrowRight, ShieldCheck, Heart, Wind, Mountain } from "lucide-react";

export const metadata: Metadata = {
  title: "About the Lineage & Practice",
  description:
    "Learn about Still Mountain's dedication to classical pranayama, authentic breath ratios, and closed-eye meditation.",
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-20">
      {/* 1. About Hero */}
      <div className="max-w-3xl space-y-6">
        <span className="bg-[#C8F3FF] text-[#092832] border border-[#8EE0F7] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          Our Lineage & Philosophy
        </span>
        <h1 className="font-serif font-extrabold text-4xl sm:text-6xl text-slate-950 leading-tight">
          Breath as a Sacred Instrument for Inner Stillness.
        </h1>
        <p className="text-slate-600 text-lg sm:text-xl leading-relaxed">
          Still Mountain was founded as a quiet refuge for practitioners seeking authentic, classical breathwork without digital distractions, performance metrics, or superficial fitness adaptations.
        </p>
      </div>

      {/* 2. Visual Storytelling Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-xl border border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"
            alt="Practitioner seated in silent meditation"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="lg:col-span-6 bg-gradient-to-br from-[#C8F3FF]/40 to-white p-8 sm:p-10 rounded-3xl border border-[#8EE0F7] space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF5C23]">
            The Core Practice
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-950">
            Why Eyes-Closed Practice Demands Dedicated Audio Guidance
          </h2>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
            During genuine pranayama, the senses are drawn inward (*pratyahara*). When a timer forces you to repeatedly open your eyes to check how many seconds remain, the delicate parasympathetic balance is interrupted.
          </p>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
            We built our PWA to solve this exact dilemma: quiet singing bowls and voice cues guide every phase transition while your phone rests face-down and your consciousness remains within.
          </p>
        </div>
      </div>

      {/* 3. Three Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C8F3FF] border border-[#8EE0F7] flex items-center justify-center">
            <Wind className="w-6 h-6 text-[#FF5C23]" />
          </div>
          <h3 className="font-serif font-bold text-xl text-slate-950">Six Classical Techniques</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            From the activating warmth of Bhastrika and Kapalbhati to the cooling nectar of Sheetali and the harmonic vibration of Bhramari, each technique has an exact physiological purpose.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C8F3FF] border border-[#8EE0F7] flex items-center justify-center">
            <Mountain className="w-6 h-6 text-[#FF5C23]" />
          </div>
          <h3 className="font-serif font-bold text-xl text-slate-950">The Witness Pause</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Every intensive technique is followed by a 1-minute non-doing pause, allowing subtle vital currents to harmonize and spontaneous breath suspension (*kumbhaka*) to emerge.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C8F3FF] border border-[#8EE0F7] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#FF5C23]" />
          </div>
          <h3 className="font-serif font-bold text-xl text-slate-950">Respect for Privacy</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Your daily sadhana is sacred and personal. We do not track your practice, require accounts, or monetize your attention.
          </p>
        </div>
      </div>

      {/* 4. Organization Linkage & CTA */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 text-center space-y-6">
        <h2 className="font-serif font-bold text-3xl sm:text-4xl text-white">
          Begin Your Daily Sadhana Today
        </h2>
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
          Access the full 35, 46, and 60-minute classical routines directly from your browser. Install on your mobile home screen in seconds.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <a
            href={siteConfig.pwaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#FF5C23] hover:bg-[#E04B14] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-[#FF5C23]/30 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            <span>Launch Free App</span>
            <ArrowUpRight className="w-5 h-5" />
          </a>
          <Link
            href="/retreats"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-7 py-4 rounded-2xl font-bold text-base border border-white/20 transition-all"
          >
            <span>View In-Person Retreats</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
