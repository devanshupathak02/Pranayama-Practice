import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PracticeTimerApp } from "@/components/PracticeTimerApp";
import { Wind, Smartphone, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Pranayama Timer — Classical Guided Breath Sequences | Pranayama Times",
  description:
    "An authentic, distraction-free audio timer for classical pranayama and conscious breathing. Designed for closed-eye practice.",
  manifest: "/manifest.webmanifest",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PracticePage() {
  return (
    <div className="pt-28 sm:pt-36 pb-20 space-y-16">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-[#FAF7F2] text-[#263F35] border border-[#D6C6A5] px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase">
          <Wind className="w-3.5 h-3.5 text-[#82947A]" />
          <span>Pranayama Timer</span>
        </div>

        <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-[#263F35] leading-tight">
          Make Every Breath Count.
        </h1>

        <p className="text-[#355245] text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-normal">
          A quiet space to slow down, focus, and build an enduring breathing practice. Sit tall, close your eyes, and let the temple bell chimes guide your transitions.
        </p>
      </section>

      {/* Main Interactive Timer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PracticeTimerApp />
      </section>

      {/* PWA & Daily Sadhana Info */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] border border-[#D6C6A5] rounded-3xl p-8 sm:p-12 max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D6C6A5]/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE8DC] border border-[#D6C6A5] flex items-center justify-center text-[#263F35]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-[#263F35]">
                  Install as Standalone Offline App
                </h3>
                <span className="text-xs text-[#82947A]">
                  Add to Home Screen &bull; Zero app store fees &bull; 100% offline
                </span>
              </div>
            </div>

            <div className="text-xs text-[#82947A] font-medium">
              Progressive Web App (PWA)
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#355245]">
            <div className="space-y-1.5">
              <h4 className="font-semibold text-sm text-[#263F35]">iOS Safari</h4>
              <p className="leading-relaxed">
                Tap the Share icon <span className="font-medium text-[#263F35]">[↑]</span> at the bottom of Safari, then choose <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-semibold text-sm text-[#263F35]">Android Chrome</h4>
              <p className="leading-relaxed">
                Tap the three-dots menu <span className="font-medium text-[#263F35]">[⋮]</span> in Chrome, then choose <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-semibold text-sm text-[#263F35]">Mac / PC Chrome</h4>
              <p className="leading-relaxed">
                Click the Install icon in your browser URL bar to run as a clean desktop window.
              </p>
            </div>
          </div>

          <div className="pt-2 text-center sm:text-left">
            <Link
              href="/learn"
              className="text-xs font-medium text-[#263F35] hover:text-[#82947A] inline-flex items-center gap-1 transition-colors"
            >
              <span>Learn more about the 6-stage classical sequence &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Practice Safety Note */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] border border-[#D6C6A5] rounded-2xl p-6 max-w-4xl mx-auto flex items-start gap-4">
          <ShieldCheck className="w-5 h-5 text-[#82947A] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-[#355245] leading-relaxed">
            <p className="font-bold text-[#263F35]">
              Practice Safety & Self-Honoring Principle
            </p>
            <p>
              Pranayama is non-competitive. If you ever feel dizzy, breathless, or agitated during any routine, pause the timer immediately and resume comfortable, natural nasal breathing. Always honor your current somatic state. For contraindications on advanced practices (such as Bhastrika and Bahya Pranayama), consult the <Link href="/learn" className="text-[#263F35] underline font-medium">Technique Guides</Link> or your medical provider.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
