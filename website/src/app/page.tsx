import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getRetreats } from "@/lib/wordpress/retreats";
import { getPosts } from "@/lib/wordpress/posts";
import { APP_FEATURES } from "@/data/features";
import { BreathingVisualizer } from "@/components/BreathingVisualizer";
import { RetreatCard } from "@/components/RetreatCard";
import { ArticleCard } from "@/components/ArticleCard";
import { AppCtaSection } from "@/components/AppCtaSection";
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Wind,
  Moon,
  Timer,
  Bell,
  Sliders,
  ShieldCheck,
} from "lucide-react";

export const revalidate = 3600;

const ICON_MAP: Record<string, React.ReactNode> = {
  Wind: <Wind className="w-6 h-6 text-[#FF5C23]" />,
  Moon: <Moon className="w-6 h-6 text-[#FF5C23]" />,
  Timer: <Timer className="w-6 h-6 text-[#FF5C23]" />,
  Bell: <Bell className="w-6 h-6 text-[#FF5C23]" />,
  Sliders: <Sliders className="w-6 h-6 text-[#FF5C23]" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-[#FF5C23]" />,
};

export default async function HomePage() {
  const featuredRetreats = await getRetreats({ limit: 3 });
  const featuredArticles = await getPosts({ limit: 3 });


  return (
    <div className="space-y-24 sm:space-y-32">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 pb-12 sm:pt-16 sm:pb-20 overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#C8F3FF]/40 blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-10 w-80 h-80 rounded-full bg-[#FF5C23]/10 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#C8F3FF] text-[#092832] border border-[#8EE0F7] px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-sm">
                <Sparkles className="w-4 h-4 text-[#FF5C23]" />
                <span>Still Mountain Breathwork & Meditation Platform</span>
              </div>

              <h1 className="font-serif font-extrabold text-4xl sm:text-6xl lg:text-7xl text-slate-950 tracking-tight leading-[1.08]">
                Master the Breath. <br />
                <span className="text-[#FF5C23]">Cultivate the Silence.</span>
              </h1>

              <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                An authentic, audio-guided pranayama timer and sanctuary platform designed for closed-eye practice. Structured classical sequences, restorative yoga nidra, and immersive mountain retreats.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href={siteConfig.pwaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#FF5C23] hover:bg-[#E04B14] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg shadow-[#FF5C23]/25 hover:shadow-xl hover:shadow-[#FF5C23]/35 hover:-translate-y-0.5 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Start Practicing Free</span>
                  <ArrowUpRight className="w-5 h-5 opacity-90" />
                </a>

                <Link
                  href="/retreats"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-7 py-4 rounded-2xl font-bold text-base shadow-sm hover:border-[#8EE0F7] transition-all"
                >
                  <span>Explore Retreats</span>
                  <ArrowRight className="w-4 h-4 text-[#FF5C23]" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF5C23]" />
                  <span>No Account Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF5C23]" />
                  <span>100% Offline PWA</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF5C23]" />
                  <span>Classical 6-Stage Sequences</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visualizer */}
            <div className="lg:col-span-5 flex justify-center">
              <BreathingVisualizer />
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRANAYAMA INTRODUCTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#C8F3FF]/40 via-white to-[#C8F3FF]/20 border border-[#8EE0F7] rounded-3xl p-8 sm:p-12 lg:p-16">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF5C23] block">
              The Lineage & Science
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-slate-950 leading-tight">
              A Gentle, Distraction-Free Instrument for Daily Sadhana.
            </h2>
            <p className="text-slate-700 text-base sm:text-lg leading-relaxed">
              Pranayama is not arbitrary breath manipulation—it is the systematic expansion and regulation of the vital life current (*prana*). When practiced in proper sequence with dedicated witness pauses, it harmonizes autonomic nervous tone and clears mental fog.
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#FF5C23] hover:underline"
              >
                <span>Read more about our philosophy & lineage</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PWA FEATURES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="bg-[#C8F3FF] text-[#092832] border border-[#8EE0F7] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Practice Application
          </span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-950">
            Engineered for Practitioners with Eyes Closed.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Most fitness timers are built for eyes glued to a screen. Our dedicated PWA is built to stay silent, accurate, and audio-guided while your phone rests face-down.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {APP_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#8EE0F7] transition-all space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#C8F3FF] border border-[#8EE0F7] flex items-center justify-center group-hover:scale-110 transition-transform">
                  {ICON_MAP[feature.iconName] || <Wind className="w-6 h-6 text-[#FF5C23]" />}
                </div>

                <div>
                  <span className="text-xs font-bold text-[#FF5C23] uppercase tracking-wider block mb-1">
                    {feature.badge}
                  </span>
                  <h3 className="font-serif font-bold text-xl text-slate-950">
                    {feature.title}
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold block mt-0.5">
                    {feature.tagline}
                  </span>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <a
                  href={siteConfig.pwaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#FF5C23] hover:underline flex items-center gap-1"
                >
                  <span>Practice in App</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. RETREATS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="bg-[#C8F3FF] text-[#092832] border border-[#8EE0F7] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Immersive Sanctuaries
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-950">
              Upcoming Retreats in the Himalayas.
            </h2>
            <p className="text-slate-600 text-base max-w-xl">
              Step away from digital noise. Deepen your pranayama ratios, enter noble silence, and restore cellular vitality in our mountain sanctuary.
            </p>
          </div>

          <Link
            href="/retreats"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm hover:border-[#8EE0F7] transition-colors self-start md:self-auto"
          >
            <span>View All Retreats</span>
            <ArrowRight className="w-4 h-4 text-[#FF5C23]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredRetreats.map((retreat) => (
            <RetreatCard key={retreat.id} retreat={retreat} />
          ))}
        </div>
      </section>

      {/* 5. JOURNAL PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="bg-[#C8F3FF] text-[#092832] border border-[#8EE0F7] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Breathwork Journal
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-950">
              Essays on Breath Science & Stillness.
            </h2>
            <p className="text-slate-600 text-base max-w-xl">
              Discover the physiological and meditative mechanics behind kumbhaka, parasympathetic activation, and the art of the witness breath.
            </p>
          </div>

          <Link
            href="/journal"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm hover:border-[#8EE0F7] transition-colors self-start md:self-auto"
          >
            <span>Read All Articles</span>
            <ArrowRight className="w-4 h-4 text-[#FF5C23]" />
          </Link>
        </div>

        {/* Featured First Article + 2 Smaller */}
        <div className="space-y-8">
          {featuredArticles.length > 0 && (
            <ArticleCard article={featuredArticles[0]} featured={true} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredArticles.slice(1, 3).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. CONVERSION SECTION (PWA INSTALL) */}
      <AppCtaSection />
    </div>
  );
}
