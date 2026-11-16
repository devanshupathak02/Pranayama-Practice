'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowLeft, Settings, History, Plus, Play, Clock, Wind } from 'lucide-react';
import { Routine } from '@/types/timer';

interface PranayamaListScreenProps {
  routines: Routine[];
  onSelectRoutine: (routine: Routine) => void;
  onBack: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenCreateRoutine: () => void;
}

export function PranayamaListScreen({
  routines,
  onSelectRoutine,
  onBack,
  onOpenSettings,
  onOpenHistory,
  onOpenCreateRoutine,
}: PranayamaListScreenProps) {
  const formatDurationBadge = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs > 0) return `${mins}m ${secs}s`;
    return `${mins}m`;
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* 1. Fixed Top Header (Anchored at Top with Safe Area) */}
      <header className="app-anchor-bar pt-safe w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D6C6A5]/40 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              aria-label="Back to home"
              className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#D6C6A5]/60 flex items-center justify-center text-[#263F35] hover:bg-[#E2E8DF] active:scale-95 transition-all shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#D6C6A5] flex items-center justify-center p-1 shadow-2xs">
              <Image
                src="/images/still-mountain-logo.png"
                alt="Pranayama mark"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>

            <div>
              <h1 className="font-sans font-bold text-base sm:text-lg text-[#263F35] tracking-tight leading-tight">
                Pranayama Practices
              </h1>
              <span className="text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-[#82947A] block">
                Classical Sequences &amp; Retentions
              </span>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#D6C6A5]/60 flex items-center justify-center text-[#263F35] hover:bg-[#E2E8DF] active:scale-95 transition-all shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
          >
            <Settings className="w-5 h-5 text-[#263F35]" />
          </button>
        </div>
      </header>

      {/* 2. Scrollable Body Content (Independent Native Momentum Scroll) */}
      <main className="app-scrollable scrollbar-none flex-1 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          {/* Section Intro */}
          <section className="space-y-1">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1A2D25]">
              Select Breathing Sequence
            </h2>
            <p className="text-xs sm:text-sm text-[#355245] max-w-xl">
              Each classical routine follows the authentic 17-stage progression from preliminary centering to stillness.
            </p>
          </section>

          {/* Routine Selection Grid (Responsive: 1 col on mobile, 2 cols on tablet/desktop) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-6">
            {routines.map((routine) => (
              <button
                key={routine.id}
                onClick={() => onSelectRoutine(routine)}
                className="text-left bg-[#FAF7F2] hover:bg-[#F5F0E6] border border-[#D6C6A5]/80 hover:border-[#B97755]/60 rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-2xs hover:shadow-sm active:scale-[0.99] flex flex-col justify-between group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#82947A] flex items-center gap-1">
                        <Wind className="w-3 h-3 text-[#B97755]" />
                        <span>{routine.source === 'custom' ? 'Custom Routine' : 'Classical Sequence'}</span>
                      </span>
                      <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1A2D25] leading-snug group-hover:text-[#263F35]">
                        {routine.name}
                      </h3>
                    </div>

                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EDE8DC] border border-[#D6C6A5] text-xs font-bold text-[#263F35] shrink-0">
                      <Clock className="w-3 h-3 text-[#82947A]" />
                      <span>{formatDurationBadge(routine.totalDurationSeconds)}</span>
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#355245] leading-relaxed line-clamp-2">
                    {routine.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 flex items-center justify-between border-t border-[#D6C6A5]/40">
                  <span className="text-[11px] font-semibold text-[#82947A]">
                    {routine.phases?.length || 17} Phases &bull; Audio Led
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#263F35] group-hover:text-[#B97755] transition-colors">
                    <span>Begin</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </span>
                </div>
              </button>
            ))}
          </section>
        </div>
      </main>

      {/* 3. Fixed Bottom Action Bar (Anchored at Bottom with Safe Area) */}
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

          <div className="text-[11px] text-[#82947A]">
            <span>Still Mountain Classical Lineage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
