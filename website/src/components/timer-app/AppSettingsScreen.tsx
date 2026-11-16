'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  VolumeX,
  SlidersHorizontal,
  Music,
  HardDrive,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { AppSettings } from '@/types/timer';
import { webAudioPlayer } from '@/lib/timer/webAudioPlayer';
import {
  backgroundAudioCache,
  getAudioCacheSize,
  formatBytes,
} from '@/lib/storage/offlineAudio';

interface AppSettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onBack: () => void;
}

const BELL_OPTIONS: { id: string; title: string; subtitle: string; file: string }[] = [
  {
    id: 'bell-1',
    title: 'Bell 1 — Clear Temple Chime',
    subtitle: 'Gentle acoustic brass chime with clear sustained decay (Default)',
    file: '/audio/bell-1.mp3',
  },
  {
    id: 'gong-1',
    title: 'Gong 1 — Resonant Tibetan Singing Bowl',
    subtitle: 'Medium acoustic bronze gong with rich harmonic overtones',
    file: '/audio/gong-1.mp3',
  },
  {
    id: 'gong-2',
    title: 'Gong 2 — Deep Grounding Temple Gong',
    subtitle: 'Deep, warm low-frequency reverberation for centering awareness',
    file: '/audio/gong-2.mp3',
  },
];

export function AppSettingsScreen({
  settings,
  onUpdateSettings,
  onBack,
}: AppSettingsScreenProps) {
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearNotice, setClearNotice] = useState<string | null>(null);

  // Load offline storage size on mount
  useEffect(() => {
    let active = true;
    getAudioCacheSize().then((sz) => {
      if (active) setCacheSize(sz);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleToggleMuteTechniques = () => {
    onUpdateSettings({
      ...settings,
      muteTechniqueNames: !settings.muteTechniqueNames,
    });
  };

  const handleToggleMuteAll = () => {
    const updated = !settings.muteAllAudio;
    onUpdateSettings({
      ...settings,
      muteAllAudio: updated,
    });
    if (updated) {
      webAudioPlayer.stop();
    }
  };

  const handleToggleAutoCache = () => {
    const current = settings.autoCacheAudio !== false;
    onUpdateSettings({
      ...settings,
      autoCacheAudio: !current,
    });
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    const res = await backgroundAudioCache.clearAllAudioCache();
    setIsClearing(false);
    setShowClearConfirm(false);
    if (res.success) {
      setCacheSize(0);
      setClearNotice(`Cleared ${formatBytes(res.freedBytes)} of cached audio.`);
      setTimeout(() => setClearNotice(null), 3500);
    }
  };

  const handleSelectSound = (soundId: string) => {
    onUpdateSettings({
      ...settings,
      witnessSoundId: soundId,
    });
  };

  const handlePreview = (sound: typeof BELL_OPTIONS[0]) => {
    setPreviewingId(sound.id);
    webAudioPlayer.playPhaseAudio(
      {
        id: 'preview',
        type: 'witness',
        label: sound.title,
        durationSeconds: 0,
        audio: { file: sound.file, category: 'bell', playOnce: true },
      },
      { ...settings, muteAllAudio: false }
    );
    setTimeout(() => {
      setPreviewingId(null);
    }, 2500);
  };

  const isAutoCacheEnabled = settings.autoCacheAudio !== false;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative">
      {/* 1. Fixed Top Header (Anchored at Top with Safe Area) */}
      <header className="app-anchor-bar pt-safe w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D6C6A5]/40 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4 flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Back"
            className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#D6C6A5]/60 flex items-center justify-center text-[#263F35] hover:bg-[#E2E8DF] active:scale-95 transition-all shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-sans font-bold text-base sm:text-lg text-[#263F35] tracking-tight leading-tight">
              Settings &amp; Preferences
            </h1>
            <span className="text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-[#82947A] block">
              Audio Cues &bull; Offline Storage
            </span>
          </div>
        </div>
      </header>

      {/* 2. Scrollable Body Content (Independent Native Momentum Scroll) */}
      <main className="app-scrollable scrollbar-none flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
          <div>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#1A2D25]">
              Sound &amp; Environment
            </h2>
            <p className="text-xs sm:text-sm text-[#355245] mt-1">
              Configure spoken cues, background caching, and authentic Himalayan transition instruments.
            </p>
          </div>

          {/* Section: Audio Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#82947A]" />
              <h3 className="font-sans font-bold text-base text-[#1A2D25] uppercase tracking-wider text-xs">
                Audio Guidance Controls
              </h3>
            </div>

            <div className="space-y-3">
              {/* Mute Technique Names Card */}
              <div className="bg-[#FAF7F2] border border-[#D6C6A5]/80 rounded-3xl p-5 sm:p-6 flex items-center justify-between gap-5 shadow-2xs">
                <div className="space-y-1 pr-2">
                  <span className="font-sans font-bold text-base text-[#1A2D25] block">
                    Mute Spoken Technique Names
                  </span>
                  <p className="text-xs text-[#355245] leading-relaxed max-w-lg">
                    Silences voice prompts between phases. Transition bell chimes and completion chimes always remain audible for closed-eye practice.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.muteTechniqueNames}
                  onClick={handleToggleMuteTechniques}
                  className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35] ${
                    settings.muteTechniqueNames ? 'bg-[#263F35]' : 'bg-[#D6C6A5]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      settings.muteTechniqueNames ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Mute All Audio Completely Card */}
              <div className="bg-[#FAF7F2] border border-[#D6C6A5]/80 rounded-3xl p-5 sm:p-6 flex items-center justify-between gap-5 shadow-2xs">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-base text-[#1A2D25] block">
                      Mute All Audio Completely
                    </span>
                    {settings.muteAllAudio && (
                      <VolumeX className="w-4 h-4 text-[#B97755]" />
                    )}
                  </div>
                  <p className="text-xs text-[#355245] leading-relaxed max-w-lg">
                    Silences all guidance and chimes for a completely silent, visual-only practice.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.muteAllAudio}
                  onClick={handleToggleMuteAll}
                  className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35] ${
                    settings.muteAllAudio ? 'bg-[#B97755]' : 'bg-[#D6C6A5]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      settings.muteAllAudio ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section: Yoga Nidra & Offline Storage */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#82947A]" />
              <h3 className="font-sans font-bold text-base text-[#1A2D25] uppercase tracking-wider text-xs">
                Yoga Nidra &amp; Offline Storage
              </h3>
            </div>

            <div className="space-y-3">
              {/* Automatic Offline Caching Toggle */}
              <div className="bg-[#FAF7F2] border border-[#D6C6A5]/80 rounded-3xl p-5 sm:p-6 flex items-center justify-between gap-5 shadow-2xs">
                <div className="space-y-1 pr-2">
                  <span className="font-sans font-bold text-base text-[#1A2D25] block">
                    Automatic Offline Caching
                  </span>
                  <p className="text-xs text-[#355245] leading-relaxed max-w-lg">
                    Automatically prepares Yoga Nidra sessions in the background when played. Allows seamless offline playback on subsequent sessions without manual downloads.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isAutoCacheEnabled}
                  onClick={handleToggleAutoCache}
                  className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35] ${
                    isAutoCacheEnabled ? 'bg-[#263F35]' : 'bg-[#D6C6A5]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isAutoCacheEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Cache Storage Management Card */}
              <div className="bg-[#FAF7F2] border border-[#D6C6A5]/80 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div className="space-y-1">
                  <span className="font-sans font-bold text-base text-[#1A2D25] block">
                    Cached Audio Storage
                  </span>
                  <p className="text-xs text-[#355245]">
                    {cacheSize > 0
                      ? `Currently storing ${formatBytes(cacheSize)} of verified offline recordings on this device.`
                      : 'No offline audio tracks stored on this device.'}
                  </p>
                  {clearNotice && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#263F35] font-semibold pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#263F35]" />
                      <span>{clearNotice}</span>
                    </span>
                  )}
                </div>

                {cacheSize > 0 && !showClearConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-[#D6C6A5] bg-white hover:bg-[#F5EBE6] text-[#B97755] hover:text-[#985E40] text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Cache</span>
                  </button>
                )}

                {showClearConfirm && (
                  <div className="shrink-0 flex items-center gap-2 p-2 bg-[#F5EBE6] rounded-2xl border border-[#ECC3B3]">
                    <span className="text-xs text-[#B97755] font-medium pr-1">Confirm delete?</span>
                    <button
                      type="button"
                      disabled={isClearing}
                      onClick={handleClearCache}
                      className="px-3 py-1.5 rounded-xl bg-[#B97755] text-white text-xs font-bold hover:bg-[#985E40] transition-colors cursor-pointer"
                    >
                      {isClearing ? 'Clearing...' : 'Yes, Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-[#D6C6A5] text-[#263F35] text-xs font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Witness Transition Bell */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-[#82947A]" />
              <h3 className="font-sans font-bold text-base text-[#1A2D25] uppercase tracking-wider text-xs">
                Witness Transition Instrument
              </h3>
            </div>
            <p className="text-xs text-[#355245] leading-relaxed">
              Select the authentic sacred sound played during transitions into Normal Breath / Witness phases.
            </p>

            <div className="space-y-3 pt-1">
              {BELL_OPTIONS.map((bell) => {
                const isSelected = (settings.witnessSoundId || 'bell-1') === bell.id;

                return (
                  <div
                    key={bell.id}
                    onClick={() => handleSelectSound(bell.id)}
                    className={`w-full flex items-center justify-between p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF7F2] border-[#B97755] ring-1 ring-[#B97755] shadow-sm'
                        : 'bg-[#FAF7F2] border-[#D6C6A5]/80 hover:bg-[#F5F0E6]'
                    }`}
                  >
                    <div className="flex items-center gap-4 pr-3">
                      {/* Radio Circle */}
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-[#B97755] bg-white'
                            : 'border-[#82947A] bg-transparent'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-3 h-3 rounded-full bg-[#B97755]" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <span className="font-sans font-bold text-sm sm:text-base text-[#1A2D25] block">
                          {bell.title}
                        </span>
                        <span className="text-xs text-[#355245] block">
                          {bell.subtitle}
                        </span>
                      </div>
                    </div>

                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(bell);
                      }}
                      className="shrink-0 bg-white hover:bg-[#EDE8DC] active:scale-95 border border-[#D6C6A5] text-[#263F35] text-xs font-semibold px-3.5 py-2 rounded-2xl flex items-center gap-1.5 shadow-2xs transition-all"
                    >
                      <Play
                        className={`w-3.5 h-3.5 ${
                          previewingId === bell.id ? 'text-[#B97755] animate-pulse' : 'text-[#263F35]'
                        }`}
                      />
                      <span>Preview</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* 3. Fixed Bottom Action Bar (Anchored at Bottom with Safe Area) */}
      <footer className="app-anchor-bar pb-safe w-full bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#D6C6A5]/40 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-3 sm:py-4">
          <button
            onClick={onBack}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#263F35] hover:bg-[#1A2D25] active:scale-[0.99] text-[#FAF7F2] font-sans font-bold text-sm sm:text-base transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
          >
            Return to Previous Screen
          </button>
        </div>
      </footer>
    </div>
  );
}
