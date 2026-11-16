'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Settings, ArrowUpRight, History, Plus, Wind, Sparkles } from 'lucide-react';
import { PRANAYAMA_ROUTINES, YOGA_NIDRA_ROUTINES } from '@/data/routines';

interface AppHomeScreenProps {
  onSelectCategory: (category: 'pranayama' | 'yoga-nidra') => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenCreateRoutine: () => void;
}

export function AppHomeScreen({
  onSelectCategory,
  onOpenSettings,
  onOpenHistory,
  onOpenCreateRoutine,
}: AppHomeScreenProps) {
  // Dynamic greeting according to local time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* 1. Fixed App Header (Anchored at Top with Safe Area) */}
      <header className="app-anchor-bar pt-safe w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D6C6A5]/40 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FAF7F2] border border-[#D6C6A5] flex items-center justify-center p-1.5 shadow-2xs">
              <Image
                src="/images/still-mountain-logo.png"
                alt="Still Mountain mark"
                width={26}
                height={26}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="font-sans font-bold text-base sm:text-lg text-[#263F35] tracking-tight leading-tight">
                Pranayama Timer
              </h1>
              <span className="text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-[#82947A] block">
                Dedicated Sadhana App
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              aria-label="Application Settings"
              className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#D6C6A5]/60 flex items-center justify-center text-[#263F35] hover:bg-[#E2E8DF] active:scale-95 transition-all shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
            >
              <Settings className="w-5 h-5 text-[#263F35]" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Scrollable Body Content (Independent Native Momentum Scroll) */}
      <main className="app-scrollable scrollbar-none flex-1 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Welcome Masthead Section */}
          <section className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#82947A]">
                    Still Mountain Wellness Retreat
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#B97755]"></span>
                  <span className="text-[11px] sm:text-xs font-medium text-[#355245]/80">
                    Daily Practice
                  </span>
                </div>

                <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#1A2D25] tracking-tight">
                  {greeting}.
                </h2>

                <p className="text-sm sm:text-base text-[#355245] max-w-xl font-normal leading-relaxed pt-1">
                  Choose a conscious breathing routine or guided Yoga Nidra immersion to anchor your mind and center your nervous system.
                </p>
              </div>

              {/* Subtle decorative breath badge */}
              <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FAF7F2] border border-[#D6C6A5]/60 text-xs text-[#263F35] shadow-2xs shrink-0 self-start">
                <div className="w-2 h-2 rounded-full bg-[#82947A] animate-ping"></div>
                <span className="font-medium">Distraction-free environment</span>
              </div>
            </div>
          </section>

          {/* Practice Category Cards (Responsive: 1 col on mobile, 2 cols on tablet/desktop) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7 pb-4">
            {/* Card A: Pranayama */}
            <button
              onClick={() => onSelectCategory('pranayama')}
              className="group text-left bg-gradient-to-br from-[#FAF7F2] via-[#F6F2E9] to-[#EBE4D5]/60 hover:from-[#FAF7F2] hover:to-[#EDE5D4] border border-[#D6C6A5] hover:border-[#B97755]/60 rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-xs hover:shadow-md active:scale-[0.99] flex flex-col justify-between relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
            >
              {/* Ambient Background Aura */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#B97755]/10 via-[#CB8D6E]/5 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-[#F5DFD5] text-[#B97755] border border-[#ECC3B3] px-3 py-1 rounded-full">
                    <Wind className="w-3.5 h-3.5" />
                    <span>Breathing Sadhana</span>
                  </span>
                  <span className="text-xs font-bold text-[#82947A]">
                    {PRANAYAMA_ROUTINES.length} Classical Sets
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#1A2D25] group-hover:text-[#263F35] transition-colors">
                    Classical Pranayama
                  </h3>
                  <p className="text-xs sm:text-sm text-[#355245] leading-relaxed line-clamp-3 sm:line-clamp-none">
                    Vedic rhythm sequences including Kapalbhati, Anulom Vilom, and deep kumbhaka breath retention. Guided by authentic temple bell chimes.
                  </p>
                </div>
              </div>

              <div className="pt-6 sm:pt-8 flex items-center justify-between border-t border-[#D6C6A5]/50 relative z-10 mt-6">
                <div className="text-[11px] sm:text-xs text-[#82947A] font-medium flex items-center gap-2">
                  <span>10m &bull; 15m &bull; 35m &bull; 46m &bull; 60m</span>
                </div>

                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FAF7F2] bg-[#263F35] group-hover:bg-[#1A2D25] px-4 py-2.5 rounded-2xl shadow-xs transition-all group-hover:translate-x-0.5">
                  <span>Explore Practices</span>
                  <ArrowUpRight className="w-4 h-4 text-[#D6C6A5]" />
                </div>
              </div>
            </button>

            {/* Card B: Yoga Nidra */}
            <button
              onClick={() => onSelectCategory('yoga-nidra')}
              className="group text-left bg-gradient-to-br from-[#FAF7F2] via-[#F4F6F3] to-[#E5ECE4]/60 hover:from-[#FAF7F2] hover:to-[#E5EBE3] border border-[#D6C6A5] hover:border-[#82947A]/70 rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-xs hover:shadow-md active:scale-[0.99] flex flex-col justify-between relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
            >
              {/* Ambient Background Aura */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#82947A]/15 via-[#A5B59E]/5 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-[#E2E8DF] text-[#263F35] border border-[#C5D3C2] px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 text-[#82947A]" />
                    <span>Conscious Sleep</span>
                  </span>
                  <span className="text-xs font-bold text-[#82947A]">
                    {YOGA_NIDRA_ROUTINES.length} Audio Tracks
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#1A2D25] group-hover:text-[#263F35] transition-colors">
                    Guided Yoga Nidra
                  </h3>
                  <p className="text-xs sm:text-sm text-[#355245] leading-relaxed line-clamp-3 sm:line-clamp-none">
                    Deep somatic relaxation tracks for cellular rest, nervous system recalibration, emotional balance, and restorative sleep.
                  </p>
                </div>
              </div>

              <div className="pt-6 sm:pt-8 flex items-center justify-between border-t border-[#D6C6A5]/50 relative z-10 mt-6">
                <div className="text-[11px] sm:text-xs text-[#82947A] font-medium flex items-center gap-2">
                  <span>20m to 30m &bull; Offline Audio Ready</span>
                </div>

                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FAF7F2] bg-[#263F35] group-hover:bg-[#1A2D25] px-4 py-2.5 rounded-2xl shadow-xs transition-all group-hover:translate-x-0.5">
                  <span>Select Session</span>
                  <ArrowUpRight className="w-4 h-4 text-[#D6C6A5]" />
                </div>
              </div>
            </button>
          </section>
        </div>
      </main>

      {/* 3. Fixed Bottom Action & Utility Bar (Anchored at Bottom with Safe Area) */}
      <footer className="app-anchor-bar pb-safe w-full bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#D6C6A5]/40 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenHistory}
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#E2E8DF] active:bg-[#D6C6A5]/40 border border-[#D6C6A5]/70 text-xs font-semibold text-[#263F35] transition-all shadow-2xs"
            >
              <History className="w-3.5 h-3.5 text-[#82947A]" />
              <span>Practice Journal</span>
            </button>

            <button
              onClick={onOpenCreateRoutine}
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#E2E8DF] active:bg-[#D6C6A5]/40 border border-[#D6C6A5]/70 text-xs font-semibold text-[#263F35] transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#82947A]" />
              <span>Create Custom Routine</span>
            </button>
          </div>

          {/* Brand Attribution */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#82947A]">
            <span>Powered by</span>
            <span className="font-semibold text-[#263F35] uppercase tracking-wider">
              Still Mountain
            </span>
            <span>Wellness Retreat</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
