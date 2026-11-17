import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getPosts } from "@/lib/wordpress/posts";
import { PRANAYAMA_PRACTICES } from "@/data/practices";
import { BreathingVisualizer } from "@/components/BreathingVisualizer";
import { PracticeCard } from "@/components/PracticeCard";
import { ArticleCard } from "@/components/ArticleCard";
import { AppCtaSection } from "@/components/AppCtaSection";
import { NewsletterSection } from "@/components/NewsletterSection";
import { AppCtaButton } from "@/components/pwa/AppCtaButton";
import {
  ArrowRight,
  ArrowUpRight,
  Wind,
  ShieldCheck,
  Sparkles,
  BookOpen,
} from "lucide-react";

export const revalidate = 3600;

export default async function HomePage() {
  const featuredArticles = await getPosts({ limit: 3 });
  const featuredPractices = PRANAYAMA_PRACTICES.slice(0, 4);

  return (
    <div className="space-y-24 sm:space-y-32 pb-16">
      {/* SECTION A: HERO */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden">
        {/* Subtle organic background tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2] via-[#EDE8DC] to-[#EDE8DC] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Left Content (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#FAF7F2] text-[#263F35] border border-[#D6C6A5] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#82947A]" />
                <span>Still Mountain Wellness Retreat</span>
              </div>

              <h1 className="font-serif font-bold text-4xl sm:text-6xl lg:text-7xl text-[#263F35] tracking-tight leading-[1.08]">
                Find Your Stillness, <br />
                <span className="italic font-normal text-[#1A2D25]">
                  One Breath at a Time.
                </span>
              </h1>

              <p className="text-[#355245] text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                Explore the ancient practice of pranayama, deepen your understanding of conscious breathing, and create space for calm in everyday life.
              </p>

              {/* Primary & Secondary Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <AppCtaButton
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#263F35] hover:bg-[#1A2D25] text-[#FAF7F2] px-8 py-4 rounded-2xl font-medium text-base shadow-xs hover:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
                >
                  <Wind className="w-4 h-4 text-[#D6C6A5]" />
                  <span>Start Breathing</span>
                  <ArrowRight className="w-4 h-4 opacity-80" />
                </AppCtaButton>

                <Link
                  href="/journal"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FAF7F2] hover:bg-[#F5F1E9] text-[#263F35] border border-[#D6C6A5] px-7 py-4 rounded-2xl font-medium text-base transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-[#82947A]" />
                  <span>Explore the Journal</span>
                </Link>
              </div>

              {/* Trust & Lineage Indicators */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#82947A] font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#263F35]" />
                  <span>Traditional 6-Stage Sequences</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#263F35]" />
                  <span>No Account Required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-[#263F35]" />
                  <span>Closed-Eye Audio Guidance</span>
                </div>
              </div>
            </div>

            {/* Hero Right: Breathing Visualizer (lg:col-span-5) */}
            <div className="lg:col-span-5 flex justify-center">
              <BreathingVisualizer />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: INTRODUCTION TO PRANAYAMA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] border border-[#D6C6A5] rounded-3xl p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#82947A]">
                <span>Classical Foundation</span>
              </div>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[#263F35] leading-tight">
                Discover the Art of Conscious Breathing.
              </h2>
              <p className="text-[#355245] text-base sm:text-lg leading-relaxed">
                In classical Sanskrit, <em>Prana</em> signifies the subtle vital life current, while <em>Ayama</em> translates to conscious expansion and regulation. Far from mechanical hyperventilation, authentic pranayama is a deliberate, gentle training of the nervous system.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 text-sm text-[#355245]">
                <div className="space-y-1.5">
                  <h4 className="font-serif font-bold text-lg text-[#263F35]">
                    Why Breath Awareness Matters
                  </h4>
                  <p className="leading-relaxed">
                    The respiratory system is the only vital function that is both entirely automatic and under conscious voluntary control. By changing the cadence of your breath, you directly modulate the autonomic tone of your brainstem.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-serif font-bold text-lg text-[#263F35]">
                    How Beginners Can Start
                  </h4>
                  <p className="leading-relaxed">
                    Begin with natural diaphragmatic expansion, gentle alternate-nostril rhythm (Anulom Vilom), and prolonged unforced exhalations. Never strain the lungs or force breath retention.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 bg-[#EDE8DC] hover:bg-[#E2E8DF] text-[#263F35] border border-[#D6C6A5] px-6 py-3 rounded-xl font-medium text-sm transition-colors"
                >
                  <span>Explore Learning Resources & Sequences</span>
                  <ArrowRight className="w-4 h-4 text-[#82947A]" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-[#EDE8DC] border border-[#D6C6A5]">
              <Image
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
                alt="Morning meditation in nature"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION C: FEATURED PRANAYAMA PRACTICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#82947A]">
              Selected Disciplines
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[#263F35]">
              Featured Pranayama Practices.
            </h2>
            <p className="text-[#355245] text-base max-w-xl">
              Traditional breathing practices arranged according to autonomic effect, difficulty level, and meditative depth.
            </p>
          </div>

          <Link
            href="/learn"
            className="inline-flex items-center gap-2 bg-[#FAF7F2] hover:bg-[#F5F1E9] text-[#263F35] border border-[#D6C6A5] px-6 py-3 rounded-2xl font-medium text-sm transition-colors self-start md:self-auto"
          >
            <span>View All Practices & Guides</span>
            <ArrowRight className="w-4 h-4 text-[#82947A]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredPractices.map((practice) => (
            <PracticeCard key={practice.id} practice={practice} />
          ))}
        </div>
      </section>

      {/* SECTION D: PRANAYAMA TIMER FEATURE */}
      <AppCtaSection />

      {/* SECTION E: JOURNAL / LATEST ARTICLES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#82947A]">
              Editorial Journal
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[#263F35]">
              Essays on Breath, Stillness & Science.
            </h2>
            <p className="text-[#355245] text-base max-w-xl">
              Reflections on autonomic neuroscience, traditional yogic commentaries, and practical protocols for daily inner quiet.
            </p>
          </div>

          <Link
            href="/journal"
            className="inline-flex items-center gap-2 bg-[#FAF7F2] hover:bg-[#F5F1E9] text-[#263F35] border border-[#D6C6A5] px-6 py-3 rounded-2xl font-medium text-sm transition-colors self-start md:self-auto"
          >
            <span>View All Articles</span>
            <ArrowRight className="w-4 h-4 text-[#82947A]" />
          </Link>
        </div>

        {/* Featured First Article + Grid */}
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

      {/* SECTION F: PHILOSOPHY / CONNECTION WITH SMWR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] border border-[#D6C6A5] rounded-3xl p-8 sm:p-12 lg:p-16">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#EDE8DC] border border-[#D6C6A5] flex items-center justify-center p-2.5">
              <Image
                src="/images/still-mountain-logo.png"
                alt="Still Mountain logo"
                width={32}
                height={32}
              />
            </div>

            <span className="text-xs font-semibold uppercase tracking-widest text-[#82947A] block">
              Still Mountain Wellness Retreat
            </span>

            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[#263F35] leading-tight">
              Rooted in Tradition. Made for Everyday Life.
            </h2>

            <p className="text-[#355245] text-base sm:text-lg leading-relaxed">
              Still Mountain Wellness Retreat (SMWR) is an intentional sanctuary dedicated to traditional yoga sadhana, noble silence, and mindful living. This digital pranayama platform exists to bridge that quiet mountain environment into your morning living room, giving you an authentic instrument to build an enduring daily practice.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://smwr.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#263F35] hover:bg-[#1A2D25] text-[#FAF7F2] px-7 py-3.5 rounded-xl font-medium text-sm transition-colors shadow-xs"
              >
                <span>Discover Still Mountain</span>
                <ArrowUpRight className="w-4 h-4 text-[#D6C6A5]" />
              </a>

              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#263F35] hover:text-[#82947A] transition-colors"
              >
                <span>Learn about our connection with SMWR &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION G: NEWSLETTER / COMMUNITY */}
      <NewsletterSection />
    </div>
  );
}
