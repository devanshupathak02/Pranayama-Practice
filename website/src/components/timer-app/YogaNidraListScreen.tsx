'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Settings,
  History,
  Plus,
  CheckCircle2,
  Loader2,
  Sparkles,
  Play,
  Clock,
  Wifi,
  WifiOff,
  AlertCircle,
} from 'lucide-react';
import { Routine } from '@/types/timer';
import { backgroundAudioCache, AudioCacheStatus } from '@/lib/storage/offlineAudio';

interface YogaNidraListScreenProps {
  sessions: Routine[];
  onSelectSession: (routine: Routine) => void;
  onBack: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenCreateRoutine: () => void;
}

export function YogaNidraListScreen({
  sessions,
  onSelectSession,
  onBack,
  onOpenSettings,
  onOpenHistory,
  onOpenCreateRoutine,
}: YogaNidraListScreenProps) {
  const [cacheStatuses, setCacheStatuses] = useState<Record<string, AudioCacheStatus>>({});
  const [cacheProgress, setCacheProgress] = useState<Record<string, number>>({});
  const [offlineToast, setOfflineToast] = useState<string | null>(null);

  // Subscribe to background audio cache status & progress changes
  useEffect(() => {
    let active = true;

    // Initial check for all sessions
    sessions.forEach(async (session) => {
      if (session.audioFile) {
        const status = await backgroundAudioCache.getStatus(session.audioFile);
        const progress = backgroundAudioCache.getProgress(session.audioFile);
        if (active) {
          setCacheStatuses((prev) => ({ ...prev, [session.audioFile!]: status }));
          setCacheProgress((prev) => ({ ...prev, [session.audioFile!]: progress }));
        }
      }
    });

    const unsubscribe = backgroundAudioCache.subscribe((url, status, progress) => {
      if (active) {
        setCacheStatuses((prev) => ({ ...prev, [url]: status }));
        setCacheProgress((prev) => ({ ...prev, [url]: progress }));
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [sessions]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${mins}m`;
  };

  const handleSessionClick = (session: Routine) => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const status = session.audioFile ? cacheStatuses[session.audioFile] : undefined;

    // If device is offline and track has not been cached, explain clearly
    if (!isOnline && status !== 'offline_ready') {
      setOfflineToast(`"${session.name}" requires an internet connection for its first play.`);
      setTimeout(() => setOfflineToast(null), 4000);
      return;
    }

    onSelectSession(session);
  };

  const handleRetryCache = (e: React.MouseEvent, audioFile: string) => {
    e.stopPropagation();
    backgroundAudioCache.triggerBackgroundCache(audioFile, { force: true });
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative">
      {/* Offline Toast Notification */}
      {offlineToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#1A2D25] text-[#FAF7F2] text-xs font-medium shadow-lg flex items-center gap-2 max-w-sm animate-in fade-in slide-in-from-top duration-200">
          <WifiOff className="w-4 h-4 text-[#ECC3B3] shrink-0" />
          <span>{offlineToast}</span>
        </div>
      )}

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
                alt="Yoga Nidra mark"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>

            <div>
              <h1 className="font-sans font-bold text-base sm:text-lg text-[#263F35] tracking-tight leading-tight">
                Guided Yoga Nidra
              </h1>
              <span className="text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-[#82947A] block">
                Conscious Rest &amp; Somatic Journeys
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
              Select Restorative Session
            </h2>
            <p className="text-xs sm:text-sm text-[#355245] max-w-xl">
              Yoga Nidra is the systematic yogic method of inducing complete physical, mental, and emotional relaxation. Sessions automatically prepare for offline listening when played.
            </p>
          </section>

          {/* Yoga Nidra Grid (Responsive: 1 col on mobile, 2 cols on tablet/desktop) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-6">
            {sessions.map((session) => {
              const status = session.audioFile ? cacheStatuses[session.audioFile] || 'streaming' : 'streaming';
              const progress = session.audioFile ? cacheProgress[session.audioFile] || 0 : 0;

              return (
                <div
                  key={session.id}
                  className="bg-[#FAF7F2] hover:bg-[#F5F0E6] border border-[#D6C6A5]/80 hover:border-[#82947A]/70 rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-2xs hover:shadow-sm flex flex-col justify-between group"
                >
                  <div
                    onClick={() => handleSessionClick(session)}
                    className="cursor-pointer space-y-2.5"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSessionClick(session);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#82947A] flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#82947A]" />
                          <span>Somatic Immersion</span>
                        </span>
                        <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1A2D25] leading-snug group-hover:text-[#263F35]">
                          {session.name}
                        </h3>
                      </div>

                      <span className="shrink-0 bg-[#EDE8DC] text-[#263F35] border border-[#D6C6A5] text-xs font-bold px-3 py-1.5 rounded-2xl flex items-center gap-1 shadow-2xs">
                        <Clock className="w-3 h-3 text-[#82947A]" />
                        <span>{formatDuration(session.totalDurationSeconds)}</span>
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#355245] leading-relaxed line-clamp-2 sm:line-clamp-none">
                      {session.description}
                    </p>
                  </div>

                  {/* Footer Line: Primary Action (Listen Now) + Automatic Status Indicator */}
                  <div className="pt-5 mt-4 flex items-center justify-between border-t border-[#D6C6A5]/40 text-xs font-semibold text-[#1A2D25]">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleSessionClick(session)}
                        className="inline-flex items-center gap-1.5 text-[#B97755] group-hover:text-[#985E40] transition-colors font-bold cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current stroke-none" />
                        <span>Listen Now</span>
                      </button>

                      <span className="text-[#82947A]">&bull;</span>
                      <span className="text-[#82947A] text-[11px]">Guided Audio</span>
                    </div>

                    {session.audioFile && (
                      <div className="shrink-0">
                        {status === 'offline_ready' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E2E8DF] text-[#263F35] text-[11px] font-medium border border-[#C5D3C2]">
                            <CheckCircle2 className="w-3 h-3 text-[#263F35]" />
                            <span>Offline Ready</span>
                          </span>
                        )}

                        {status === 'preparing_offline' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EDE8DC] text-[#B97755] text-[11px] font-medium border border-[#D6C6A5]/80">
                            <Loader2 className="w-3 h-3 animate-spin text-[#B97755]" />
                            <span>Preparing Offline {progress > 0 ? `${progress}%` : ''}</span>
                          </span>
                        )}

                        {status === 'streaming' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EDE8DC]/70 text-[#82947A] text-[11px] font-medium border border-[#D6C6A5]/50">
                            <Wifi className="w-3 h-3 text-[#82947A]" />
                            <span>Streaming</span>
                          </span>
                        )}

                        {status === 'offline_unavailable' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5EBE6] text-[#B97755] text-[11px] font-medium border border-[#ECC3B3]">
                            <WifiOff className="w-3 h-3 text-[#B97755]" />
                            <span>Offline Unavailable</span>
                          </span>
                        )}

                        {status === 'download_failed' && (
                          <button
                            type="button"
                            onClick={(e) => handleRetryCache(e, session.audioFile!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FDF2F2] text-[#B91C1C] hover:bg-[#FEE2E2] text-[11px] font-medium border border-[#FCA5A5] transition-colors cursor-pointer"
                            title="Download failed. Tap to retry background caching."
                          >
                            <AlertCircle className="w-3 h-3 text-[#B91C1C]" />
                            <span>Failed &bull; Retry</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </main>

      {/* 3. Fixed Bottom Action Bar (Anchored at Bottom with Safe Area) */}
      <footer className="app-anchor-bar pb-safe w-full bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#D6C6A5]/40 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenHistory}
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#E2E8DF] active:bg-[#D6C6A5]/40 border border-[#D6C6A5]/70 text-xs font-semibold text-[#263F35] transition-all shadow-2xs"
            >
              <History className="w-4 h-4 text-[#82947A]" />
              <span>Practice Journal</span>
            </button>
            <button
              onClick={onOpenCreateRoutine}
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#E2E8DF] active:bg-[#D6C6A5]/40 border border-[#D6C6A5]/70 text-xs font-semibold text-[#263F35] transition-all shadow-2xs"
            >
              <Plus className="w-4 h-4 text-[#82947A]" />
              <span>Create Custom</span>
            </button>
          </div>

          <div className="text-[11px] font-medium text-[#82947A]">
            <span>{sessions.length} Guided Sessions Available</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
