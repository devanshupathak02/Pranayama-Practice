"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Volume2, Sparkles, CheckCircle2 } from "lucide-react";
import { useAppUrl } from "@/lib/hooks/useAppUrl";
import { useInstallPrompt } from "@/components/pwa/InstallContext";

export function AppCtaSection() {
  const appUrl = useAppUrl();
  const { triggerAppCta } = useInstallPrompt();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-[#FAF7F2] border border-[#D6C6A5] rounded-3xl p-8 sm:p-12 lg:p-16 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#EDE8DC] text-[#263F35] border border-[#D6C6A5] px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#82947A]" />
              <span>Dedicated Practice Instrument</span>
            </div>

            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[#263F35] leading-tight">
              Make Every Breath Count.
            </h2>

            <p className="text-[#355245] text-base sm:text-lg leading-relaxed max-w-xl">
              A simple space to slow down, focus, and build a mindful breathing practice. Audio-led cues for closed-eye practice, classical pranayama timing, and zero digital distractions.
            </p>

            {/* Value checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-[#263F35]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#82947A] shrink-0" />
                <span>35m & 46m Classical Sequences</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#82947A] shrink-0" />
                <span>Subtle Bell Transition Audio</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#82947A] shrink-0" />
                <span>Full Offline PWA Capability</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#82947A] shrink-0" />
                <span>No Account or Sign-Up Needed</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href={appUrl}
                onClick={triggerAppCta}
                className="inline-flex items-center gap-2.5 bg-[#263F35] hover:bg-[#1A2D25] text-[#FAF7F2] px-8 py-4 rounded-2xl font-medium text-base shadow-sm hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
              >
                <span>Open Pranayama Timer</span>
                <ArrowRight className="w-4 h-4 text-[#D6C6A5]" />
              </a>
            </div>
          </div>

          {/* Right Column: Visual Preview of Timer */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-3xl bg-[#EDE8DC] border border-[#D6C6A5] p-6 shadow-sm space-y-5">
              {/* Device Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#D6C6A5]/60 text-xs text-[#82947A]">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/still-mountain-logo.png"
                    alt="Logo mark"
                    width={20}
                    height={20}
                  />
                  <span className="font-serif font-bold text-[#263F35]">Still Mountain</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#D6C6A5] text-[10px] font-medium text-[#263F35]">
                  PWA Ready
                </span>
              </div>

              {/* Timer Preview Card */}
              <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#D6C6A5] text-center space-y-3">
                <span className="text-[11px] uppercase tracking-widest text-[#82947A] font-semibold block">
                  Active Routine
                </span>
                <h4 className="font-serif font-bold text-2xl text-[#263F35]">
                  35 Min Classical Set
                </h4>
                <p className="text-xs text-[#355245]">
                  6 Techniques &bull; 1-Min Witness Pauses &bull; Temple Bell Cues
                </p>

                {/* Breathing circle preview */}
                <div className="w-24 h-24 mx-auto rounded-full bg-[#EDE8DC] border-2 border-[#82947A]/40 flex items-center justify-center my-3">
                  <div className="w-16 h-16 rounded-full bg-[#263F35] flex items-center justify-center text-[#FAF7F2] text-xs font-serif font-bold">
                    3:00
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-[#82947A]">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Audio-led for closed eyes</span>
                </div>
              </div>

              <div className="text-center">
                <a
                  href={appUrl}
                  className="text-xs font-medium text-[#263F35] hover:text-[#82947A] underline transition-colors"
                >
                  Start this routine directly in your browser &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};