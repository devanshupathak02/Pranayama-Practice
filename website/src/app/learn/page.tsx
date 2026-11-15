import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PRANAYAMA_PRACTICES } from "@/data/practices";
import { ArrowRight, Wind, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Learn Pranayama — Techniques, Philosophy & Practice Guides | Still Mountain",
  description:
    "Explore comprehensive, lineage-based guides to classical pranayama, the 6-stage sequence, breath awareness, and nervous system balance.",
};

export default function LearnPage() {
  return (
    <div className="pt-28 sm:pt-36 pb-20 space-y-20 sm:space-y-28">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#FAF7F2] text-[#263F35] border border-[#D6C6A5] px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase">
            <Wind className="w-3.5 h-3.5 text-[#82947A]" />
            <span>Educational Academy & Lineage</span>
          </div>

          <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-[#263F35] leading-tight">
            The Science & Art of Conscious Breathing.
          </h1>

          <p className="text-[#355245] text-lg sm:text-xl leading-relaxed font-normal">
            A comprehensive, lineage-informed guide to the classical pranayama techniques practiced at Still Mountain Wellness Retreat. Written for quiet, consistent daily sadhana.
          </p>
        </div>

        {/* Practice Safety & Medical Disclaimer Banner */}
        <div className="mt-8 bg-[#FAF7F2] border-l-4 border-[#B97755] border-y border-r border-[#D6C6A5] rounded-2xl p-5 sm:p-6 flex items-start gap-4">
          <ShieldAlert className="w-5 h-5 text-[#B97755] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm text-[#355245] leading-relaxed">
            <p className="font-bold text-[#263F35]">
              Health & Practice Safety Guidance
            </p>
            <p>
              Pranayama is a gentle internal practice, not a physical endurance test. Breath retention (<em>kumbhaka</em>) must never be forced or practiced to the point of strain, dizziness, or air hunger. Beginners should establish steady, effortless rhythmic breathing before attempting retentions.
            </p>
            <p className="text-[#82947A] text-[11px] sm:text-xs">
              <strong>Medical Disclaimer:</strong> This educational material is not a substitute for clinical medical evaluation or personalized care. If you are pregnant, have hypertension, heart disease, hernia, glaucoma, or epilepsy, please consult a qualified healthcare provider before practicing dynamic kriyas or kumbhaka.
            </p>
          </div>
        </div>
      </section>

      {/* The 6-Stage Classical Sequence Explanation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] border border-[#D6C6A5] rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="space-y-3 max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#82947A] block">
              The Architecture of Practice
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#263F35]">
              Why Sequence Matters: The 6-Stage Progression
            </h2>
            <p className="text-[#355245] text-base leading-relaxed">
              In authentic yoga, pranayama is never practiced as random, isolated drills. Each technique prepares the nervous system, respiratory musculature, and mind for the subsequent phase:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#EDE8DC] border border-[#D6C6A5] space-y-2">
              <span className="text-xs font-bold text-[#82947A]">Stage 1 &bull; Activation</span>
              <h3 className="font-serif font-bold text-xl text-[#263F35]">Bhastrika</h3>
              <p className="text-xs text-[#355245] leading-relaxed">
                Clears bronchial pathways, oxygenates cellular tissues, and arouses dormant prana.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#EDE8DC] border border-[#D6C6A5] space-y-2">
              <span className="text-xs font-bold text-[#82947A]">Stage 2 &bull; Purification</span>
              <h3 className="font-serif font-bold text-xl text-[#263F35]">Kapalbhati</h3>
              <p className="text-xs text-[#355245] leading-relaxed">
                Purifies frontal brain sinuses, releases stale CO₂, and brings spontaneous suspension.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#EDE8DC] border border-[#D6C6A5] space-y-2">
              <span className="text-xs font-bold text-[#82947A]">Stage 3 &bull; Lock & Lift</span>
              <h3 className="font-serif font-bold text-xl text-[#263F35]">Bahya Pranayama</h3>
              <p className="text-xs text-[#355245] leading-relaxed">
                External breath suspension with three bandhas (locks), directing energy upward.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#EDE8DC] border border-[#D6C6A5] space-y-2">
              <span className="text-xs font-bold text-[#82947A]">Stage 4 &bull; Resistance & Calm</span>
              <h3 className="font-serif font-bold text-xl text-[#263F35]">Ujjayi</h3>
              <p className="text-xs text-[#355245] leading-relaxed">
                Oceanic glottic resonance stimulating vagus nerve and stabilizing cardiovascular rhythm.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#EDE8DC] border border-[#D6C6A5] space-y-2">
              <span className="text-xs font-bold text-[#82947A]">Stage 5 &bull; Equilibrium</span>
              <h3 className="font-serif font-bold text-xl text-[#263F35]">Anulom Vilom</h3>
              <p className="text-xs text-[#355245] leading-relaxed">
                Alternate-nostril cadence harmonizing Ida and Pingala nadis and hemispheric balance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#EDE8DC] border border-[#D6C6A5] space-y-2">
              <span className="text-xs font-bold text-[#82947A]">Stage 6 &bull; Resonance & Stillness</span>
              <h3 className="font-serif font-bold text-xl text-[#263F35]">Bhramari</h3>
              <p className="text-xs text-[#355245] leading-relaxed">
                Acoustic cranial humming releasing nitric oxide and plunging awareness into meditation.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#E2E8DF] border border-[#82947A]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#263F35]">
                The Key: The 1-Minute Witness Pause
              </span>
              <p className="text-sm text-[#355245]">
                In our timer routines, every technique is followed by 60 seconds of silent observation (*Witness Breath*). This pause is where neural integration occurs.
              </p>
            </div>
            <Link
              href="/practice"
              className="shrink-0 inline-flex items-center gap-2 bg-[#263F35] text-[#FAF7F2] px-5 py-2.5 rounded-xl text-xs font-medium"
            >
              <span>Practice full set</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Detailed Practices Directory */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#82947A]">
            Technique Encyclopedia
          </span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#263F35]">
            Practice Instructions & Protocols
          </h2>
        </div>

        <div className="space-y-10">
          {PRANAYAMA_PRACTICES.map((practice) => (
            <div
              key={practice.id}
              id={practice.id}
              className="bg-[#FAF7F2] border border-[#D6C6A5] rounded-3xl p-8 sm:p-10 scroll-mt-32 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D6C6A5]/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#EDE8DC] border border-[#D6C6A5] flex items-center justify-center p-2.5">
                    <Image
                      src={practice.image}
                      alt={practice.name}
                      width={44}
                      height={44}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#263F35]">
                        {practice.name}
                      </h3>
                      <span className="text-sm font-serif italic text-[#82947A]">
                        {practice.sanskritName}
                      </span>
                    </div>
                    <span className="text-xs text-[#82947A] font-medium uppercase tracking-wider">
                      {practice.englishName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="bg-[#EDE8DC] text-[#263F35] border border-[#D6C6A5] px-3 py-1 rounded-full text-xs font-medium">
                    Level: {practice.difficulty}
                  </span>
                  <Link
                    href="/practice"
                    className="inline-flex items-center gap-1.5 bg-[#263F35] text-[#FAF7F2] hover:bg-[#1A2D25] px-4 py-2 rounded-xl text-xs font-medium transition-colors"
                  >
                    <span>Practice with Timer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="font-serif font-bold text-lg text-[#263F35]">
                    Overview & Energetic Focus
                  </h4>
                  <p className="text-[#355245] text-sm leading-relaxed">
                    {practice.fullDescription}
                  </p>

                  <div className="pt-2 space-y-2">
                    <h5 className="font-serif font-bold text-sm text-[#263F35] uppercase tracking-wider">
                      Step-by-Step Instructions:
                    </h5>
                    <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-[#355245] leading-relaxed">
                      {practice.instructions.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-[#EDE8DC] p-5 rounded-2xl border border-[#D6C6A5] space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#263F35] block">
                      Practice Essentials
                    </span>
                    <div className="space-y-2 text-xs text-[#355245]">
                      <div className="flex justify-between py-1 border-b border-[#D6C6A5]/50">
                        <span className="text-[#82947A]">Suggested Duration</span>
                        <span className="font-medium text-[#263F35]">{practice.durationMinutes} minutes</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#D6C6A5]/50">
                        <span className="text-[#82947A]">Primary Focus</span>
                        <span className="font-medium text-[#263F35]">{practice.focus}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[#82947A]">Beginner Friendly</span>
                        <span className="font-medium text-[#263F35]">
                          {practice.beginnerFriendly ? "Yes" : "With Guidance"}
                        </span>
                      </div>
                    </div>

                    {practice.contraindications && (
                      <div className="pt-2 text-[11px] text-[#B97755] leading-relaxed">
                        <strong className="font-semibold">Precaution:</strong> {practice.contraindications}
                      </div>
                    )}
                  </div>

                  {practice.articleSlug && (
                    <div className="text-center sm:text-left">
                      <Link
                        href={`/journal/${practice.articleSlug}`}
                        className="text-xs font-medium text-[#263F35] hover:text-[#82947A] underline inline-flex items-center gap-1"
                      >
                        <span>Read in-depth research article on this technique</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
