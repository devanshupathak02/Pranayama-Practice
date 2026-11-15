import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight, Mountain, Wind, ShieldCheck, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About SMWR & Still Mountain Pranayama | Connection & Philosophy",
  description:
    "Learn about the relationship between Still Mountain Wellness Retreat (smwr.org) and our digital pranayama platform.",
};

export default function AboutPage() {
  return (
    <div className="pt-28 sm:pt-36 pb-20 space-y-20 sm:space-y-28">
      {/* 1. Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 bg-[#FAF7F2] text-[#263F35] border border-[#D6C6A5] px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase">
            <Mountain className="w-3.5 h-3.5 text-[#82947A]" />
            <span>Still Mountain Wellness Retreat</span>
          </div>

          <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-[#263F35] leading-tight">
            Rooted in Himalayan Tradition. Made for Everyday Life.
          </h1>

          <p className="text-[#355245] text-lg sm:text-xl leading-relaxed font-normal">
            Still Mountain Pranayama is an educational and digital wellness initiative operated under the Still Mountain Wellness Retreat (SMWR) brand.
          </p>
        </div>
      </section>

      {/* 2. The Two Platforms / Relationship */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] border border-[#D6C6A5] rounded-3xl p-8 sm:p-12 lg:p-16 space-y-10">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#82947A] block">
              Our Dual Mission
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#263F35]">
              How Our Platforms Complement Each Other
            </h2>
            <p className="text-[#355245] text-base leading-relaxed">
              To preserve clarity and purpose, Still Mountain maintains two dedicated spaces:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Main Website Card */}
            <div className="bg-[#EDE8DC] p-8 rounded-2xl border border-[#D6C6A5] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#82947A] uppercase tracking-wider">
                    Institutional Sanctuary
                  </span>
                  <span className="text-xs font-serif italic text-[#263F35]">smwr.org</span>
                </div>
                <h3 className="font-serif font-bold text-2xl text-[#263F35]">
                  Still Mountain Wellness Retreat
                </h3>
                <p className="text-sm text-[#355245] leading-relaxed">
                  The primary home of our physical retreat center and sanctuary. Promotes residential retreats, master teachers, wellness immersions, noble silence periods, and the foundational philosophy of our ashram.
                </p>
              </div>

              <div className="pt-4 border-t border-[#D6C6A5]/50">
                <a
                  href="https://smwr.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#263F35] hover:text-[#82947A] transition-colors"
                >
                  <span>Visit Main Retreat Center at smwr.org</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* This Platform Card */}
            <div className="bg-[#EDE8DC] p-8 rounded-2xl border border-[#82947A]/60 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#263F35] uppercase tracking-wider">
                    Digital Practice Instrument
                  </span>
                  <span className="text-xs font-serif italic text-[#82947A]">This Platform</span>
                </div>
                <h3 className="font-serif font-bold text-2xl text-[#263F35]">
                  Still Mountain Pranayama
                </h3>
                <p className="text-sm text-[#355245] leading-relaxed">
                  Dedicated strictly to the study, science, and practice of conscious breathing. Hosts educational publications, research essays on autonomic health, and the free Pranayama Timer application.
                </p>
              </div>

              <div className="pt-4 border-t border-[#D6C6A5]/50">
                <Link
                  href="/practice"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#263F35] hover:text-[#82947A] transition-colors"
                >
                  <span>Open Pranayama Timer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Philosophy & Lineage */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 relative h-80 sm:h-96 rounded-3xl overflow-hidden bg-[#FAF7F2] border border-[#D6C6A5]">
            <Image
              src="https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=1000&q=80"
              alt="Himalayan mountain sanctuary"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#82947A] block">
              Core Philosophy
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#263F35] leading-tight">
              A Quiet Refuge From Digital Velocity.
            </h2>
            <p className="text-[#355245] text-base leading-relaxed">
              At Still Mountain, we view pranayama not as another biometric habit to optimize or display on a dashboard, but as a sacred return to effortless presence.
            </p>
            <p className="text-[#355245] text-base leading-relaxed">
              When breath is smoothed and prolonged without force, mental turbulence naturally settles. We believe that regular, quiet daily breathing practice is the most direct, accessible vehicle for cultivating lasting calm in the modern world.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <a
                href="https://smwr.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#263F35] hover:bg-[#1A2D25] text-[#FAF7F2] px-6 py-3 rounded-xl font-medium text-sm transition-colors"
              >
                <span>Explore smwr.org</span>
                <ArrowUpRight className="w-4 h-4 text-[#D6C6A5]" />
              </a>

              <Link
                href="/learn"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#263F35] hover:text-[#82947A] transition-colors"
              >
                <span>Read technique guides &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Three Guiding Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#FAF7F2] p-8 rounded-3xl border border-[#D6C6A5] space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EDE8DC] border border-[#D6C6A5] flex items-center justify-center">
              <Wind className="w-5 h-5 text-[#263F35]" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#263F35]">Closed-Eye Practice</h3>
            <p className="text-sm text-[#355245] leading-relaxed">
              Pranayama draws attention inward (*pratyahara*). Our timer is designed to be experienced with your eyes closed, guided by quiet temple bells.
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-8 rounded-3xl border border-[#D6C6A5] space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EDE8DC] border border-[#D6C6A5] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#263F35]" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#263F35]">Ancient Lineage</h3>
            <p className="text-sm text-[#355245] leading-relaxed">
              Sequences adhere strictly to traditional Hatha yoga canons: 6 classic stages, balanced ratios, and essential witness pauses between intense rounds.
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-8 rounded-3xl border border-[#D6C6A5] space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EDE8DC] border border-[#D6C6A5] flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#263F35]" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#263F35]">Free & Unfettered</h3>
            <p className="text-sm text-[#355245] leading-relaxed">
              No subscription paywalls, no tracking algorithms, and no account barrier. Breathwork belongs to all sincere practitioners unconditionally.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
