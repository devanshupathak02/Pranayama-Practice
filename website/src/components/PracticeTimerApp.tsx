"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Routine, AppSettings, SessionRecord } from "@/types/timer";
import {
  PRANAYAMA_ROUTINES,
  YOGA_NIDRA_ROUTINES,
  SET_35_ROUTINE,
  COMPLETION_BELL,
} from "@/data/routines";
import { TimerEngine } from "@/lib/timer/TimerEngine";
import { webAudioPlayer } from "@/lib/timer/webAudioPlayer";
import {
  loadAppSettings,
  saveAppSettings,
  loadSessionHistory,
  recordCompletedSession,
  clearAllSessionHistory,
  importSessionHistory,
} from "@/lib/storage/indexedDB";
import { PracticeHistoryModal } from "@/components/PracticeHistoryModal";
import { isAudioCachedOffline, downloadAudioTrack } from "@/lib/storage/offlineAudio";
import { siteConfig } from "@/config/site";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle2,
  History,
  SlidersHorizontal,
  Download,
  Loader2,
} from "lucide-react";

export const PracticeTimerApp: React.FC = () => {
  // Routine & Mode State
  const [activeCategory, setActiveCategory] = useState<"pranayama" | "yoga-nidra">("pranayama");
  const [selectedRoutine, setSelectedRoutine] = useState<Routine>(SET_35_ROUTINE);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseSecondsRemaining, setPhaseSecondsRemaining] = useState(
    selectedRoutine.phases[0]?.durationSeconds || 0
  );
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Settings State (Granular Muting)
  const [settings, setSettings] = useState<AppSettings>({
    muteTechniqueNames: false,
    muteAllAudio: false,
    witnessSoundId: "bell-1",
  });
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);

  // History State
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Offline Audio State (Yoga Nidra)
  const [isYogaNidraCached, setIsYogaNidraCached] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Classical pranayama bell cues are permanently pre-cached; Yoga Nidra tracks check dynamic cache state
  const isOfflineReady = !selectedRoutine.audioFile || isYogaNidraCached;

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const timerEngineRef = useRef<TimerEngine | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);

  // Load persistent settings & history on mount
  useEffect(() => {
    loadAppSettings().then((s) => setSettings(s));
    loadSessionHistory().then((h) => setHistory(h));
  }, []);

  // Check offline readiness for selected audio track asynchronously
  useEffect(() => {
    let cancelled = false;
    if (selectedRoutine.audioFile) {
      isAudioCachedOffline(selectedRoutine.audioFile).then((cached) => {
        if (!cancelled) {
          setIsYogaNidraCached(cached);
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [selectedRoutine.audioFile]);

  const handleDownloadTrack = async () => {
    if (!selectedRoutine.audioFile || isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadError(null);

    const res = await downloadAudioTrack(selectedRoutine.audioFile, (p) => {
      setDownloadProgress(p.percentage);
    });

    setIsDownloading(false);
    if (res.success) {
      setIsYogaNidraCached(true);
      setDownloadError(null);
    } else {
      setDownloadError(res.error || "Failed to download track for offline practice");
    }
  };

  // Safe Active Session Flag for Service Worker update coordination
  const setActiveSessionFlag = (active: boolean) => {
    if (typeof window !== "undefined") {
      (window as unknown as { __PRANAYAMA_IS_ACTIVE_SESSION__?: boolean }).__PRANAYAMA_IS_ACTIVE_SESSION__ = active;
    }
  };

  // Screen Wake Lock API management
  const requestWakeLock = useCallback(async () => {
    if (typeof window !== "undefined" && "wakeLock" in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch {
        // WakeLock request blocked (e.g. low battery)
      }
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // Ignore
      }
      wakeLockRef.current = null;
    }
  }, []);

  // Re-synchronize and initialize TimerEngine when selectedRoutine changes
  useEffect(() => {
    const engine = new TimerEngine(selectedRoutine.phases, {
      onTick: (state) => {
        setCurrentPhaseIndex(state.currentPhaseIndex);
        setPhaseSecondsRemaining(state.currentPhaseSecondsRemaining);
      },
      onPhaseChange: (phase) => {
        webAudioPlayer.playPhaseAudio(phase, settings);
      },
      onComplete: async () => {
        setIsRunning(false);
        setSessionCompleted(true);
        setActiveSessionFlag(false);
        releaseWakeLock();

        // Play completion chime
        webAudioPlayer.playPhaseAudio(
          {
            id: "completion-bell",
            type: "ending",
            label: "Complete",
            durationSeconds: 0,
            audio: { file: COMPLETION_BELL, category: "ending", playOnce: true },
          },
          settings
        );

        // Persist session to IndexedDB
        const now = new Date();
        const startTime = sessionStartTimeRef.current
          ? new Date(sessionStartTimeRef.current).toISOString()
          : now.toISOString();

        const record: SessionRecord = {
          id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          routineId: selectedRoutine.id,
          routineName: selectedRoutine.name,
          startedAt: startTime,
          completedAt: now.toISOString(),
          durationSeconds: selectedRoutine.totalDurationSeconds,
          completed: true,
          completedPhases: selectedRoutine.phases.length,
          totalPhases: selectedRoutine.phases.length,
        };

        await recordCompletedSession(record);
        const updatedHistory = await loadSessionHistory();
        setHistory(updatedHistory);
      },
      onStatusChange: (status) => {
        setIsRunning(status === "RUNNING");
      },
    });

    timerEngineRef.current = engine;

    return () => {
      engine.reset();
      webAudioPlayer.stop();
      releaseWakeLock();
      setActiveSessionFlag(false);
    };
  }, [selectedRoutine, settings, releaseWakeLock]);

  // Handle visibility recovery (timestamp delta recalculation when tab re-enters focus)
  useEffect(() => {
    const handleVisibility = () => {
      const isVisible = !document.hidden;
      if (timerEngineRef.current) {
        timerEngineRef.current.handleVisibilityChange(isVisible);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Routine Switcher
  const handleSelectRoutine = (routine: Routine) => {
    if (timerEngineRef.current) {
      timerEngineRef.current.reset();
    }
    webAudioPlayer.stop();
    releaseWakeLock();
    setActiveSessionFlag(false);
    sessionStartTimeRef.current = null;
    setSelectedRoutine(routine);
    setCurrentPhaseIndex(0);
    setPhaseSecondsRemaining(routine.phases[0]?.durationSeconds || 0);
    setIsRunning(false);
    setSessionCompleted(false);
  };

  // Play / Pause / Resume
  const togglePlay = async () => {
    if (!timerEngineRef.current) return;

    if (sessionCompleted) {
      setSessionCompleted(false);
      setActiveSessionFlag(true);
      sessionStartTimeRef.current = Date.now();
      timerEngineRef.current.start();
      requestWakeLock();
      return;
    }

    if (isRunning) {
      timerEngineRef.current.pause();
      webAudioPlayer.pauseStreamingAudio();
      releaseWakeLock();
      setActiveSessionFlag(false);
    } else {
      setActiveSessionFlag(true);
      if (!sessionStartTimeRef.current) {
        sessionStartTimeRef.current = Date.now();
      }

      // Unlock AudioContext & play initial phase audio
      const currentPhase = selectedRoutine.phases[currentPhaseIndex];
      if (currentPhase) {
        webAudioPlayer.playPhaseAudio(currentPhase, settings);
      }

      if (selectedRoutine.audioFile) {
        webAudioPlayer.playStreamingAudio(selectedRoutine.audioFile);
      }

      timerEngineRef.current[currentPhaseIndex === 0 && phaseSecondsRemaining === selectedRoutine.phases[0].durationSeconds ? "start" : "resume"]();
      requestWakeLock();
    }
  };

  const skipNext = () => {
    if (!timerEngineRef.current) return;
    timerEngineRef.current.skipPhase();
  };

  const skipPrev = () => {
    if (!timerEngineRef.current) return;
    timerEngineRef.current.previousPhase();
  };

  const resetSession = () => {
    if (!timerEngineRef.current) return;
    timerEngineRef.current.reset();
    webAudioPlayer.stop();
    releaseWakeLock();
    setActiveSessionFlag(false);
    sessionStartTimeRef.current = null;
    setCurrentPhaseIndex(0);
    setPhaseSecondsRemaining(selectedRoutine.phases[0]?.durationSeconds || 0);
    setSessionCompleted(false);
    setIsRunning(false);
  };

  // Settings Handlers
  const toggleMuteTechniqueNames = async () => {
    const updated = { ...settings, muteTechniqueNames: !settings.muteTechniqueNames };
    setSettings(updated);
    await saveAppSettings(updated);
  };

  const toggleMuteAllAudio = async () => {
    const updated = { ...settings, muteAllAudio: !settings.muteAllAudio };
    setSettings(updated);
    await saveAppSettings(updated);
    if (updated.muteAllAudio) {
      webAudioPlayer.stop();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleClearHistory = async () => {
    await clearAllSessionHistory();
    setHistory([]);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const currentPhase = selectedRoutine.phases[currentPhaseIndex] || selectedRoutine.phases[0];
  const isWitness = currentPhase?.type === "witness";

  return (
    <div
      ref={containerRef}
      className={`bg-[#FAF7F2] border border-[#D6C6A5] rounded-3xl p-6 sm:p-10 shadow-xs max-w-4xl mx-auto space-y-8 relative ${
        isFullscreen ? "h-screen w-screen rounded-none p-12 flex flex-col justify-center overflow-y-auto" : ""
      }`}
    >
      {/* Top Header & Navigation Actions */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D6C6A5]/50">
          {/* Category Toggle (Pranayama vs Yoga Nidra) */}
          <div className="flex items-center gap-1 bg-[#EDE8DC] p-1 rounded-2xl border border-[#D6C6A5] self-start">
            <button
              onClick={() => {
                setActiveCategory("pranayama");
                handleSelectRoutine(PRANAYAMA_ROUTINES[2]); // default to 35 min
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeCategory === "pranayama"
                  ? "bg-[#263F35] text-[#FAF7F2] shadow-xs"
                  : "text-[#355245] hover:text-[#263F35]"
              }`}
            >
              Classical Pranayama
            </button>
            <button
              onClick={() => {
                setActiveCategory("yoga-nidra");
                handleSelectRoutine(YOGA_NIDRA_ROUTINES[0]);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeCategory === "yoga-nidra"
                  ? "bg-[#263F35] text-[#FAF7F2] shadow-xs"
                  : "text-[#355245] hover:text-[#263F35]"
              }`}
            >
              Yoga Nidra Rest
            </button>
          </div>

          {/* Right Action Icons (Audio Settings, History, Fullscreen) */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Audio Settings Popover Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsPopover(!showSettingsPopover)}
                title="Audio Cues & Mute Settings"
                aria-label="Audio settings"
                className={`p-2.5 rounded-xl border transition-colors ${
                  showSettingsPopover || settings.muteTechniqueNames || settings.muteAllAudio
                    ? "bg-[#263F35] text-[#FAF7F2] border-[#263F35]"
                    : "bg-[#EDE8DC] text-[#263F35] border-[#D6C6A5] hover:bg-[#E2E8DF]"
                }`}
              >
                {settings.muteAllAudio ? (
                  <VolumeX className="w-4 h-4 text-[#B97755]" />
                ) : (
                  <SlidersHorizontal className="w-4 h-4" />
                )}
              </button>

              {/* Popover Dropdown */}
              {showSettingsPopover && (
                <div className="absolute right-0 top-12 z-40 w-72 bg-[#FAF7F2] border border-[#D6C6A5] rounded-2xl p-4 shadow-xl space-y-3.5 text-xs">
                  <div className="flex items-center justify-between border-b border-[#D6C6A5]/50 pb-2">
                    <span className="font-serif font-bold text-sm text-[#263F35]">
                      Audio Cues & Bells
                    </span>
                    <button
                      onClick={() => setShowSettingsPopover(false)}
                      className="text-[#82947A] hover:text-[#263F35]"
                    >
                      &times;
                    </button>
                  </div>

                  <div className="space-y-2.5 text-[#355245]">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="leading-tight">
                        <strong>Mute Spoken Technique Names</strong>
                        <span className="block text-[10px] text-[#82947A]">
                          Transition bell chimes remain audible
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.muteTechniqueNames}
                        onChange={toggleMuteTechniqueNames}
                        className="rounded border-[#D6C6A5] text-[#263F35] focus:ring-[#263F35] ml-2"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-[#D6C6A5]/40">
                      <span className="leading-tight">
                        <strong>Mute All Audio Completely</strong>
                        <span className="block text-[10px] text-[#82947A]">
                          Silent visual countdown only
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.muteAllAudio}
                        onChange={toggleMuteAllAudio}
                        className="rounded border-[#D6C6A5] text-[#263F35] focus:ring-[#263F35] ml-2"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* History Modal Trigger */}
            <button
              onClick={() => setShowHistoryModal(true)}
              title="Practice Journal & History"
              aria-label="Practice history"
              className="p-2.5 rounded-xl bg-[#EDE8DC] hover:bg-[#E2E8DF] text-[#263F35] border border-[#D6C6A5] transition-colors relative"
            >
              <History className="w-4 h-4" />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#82947A]" />
              )}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen Practice"
              aria-label="Fullscreen practice"
              className="p-2.5 rounded-xl bg-[#EDE8DC] hover:bg-[#E2E8DF] text-[#263F35] border border-[#D6C6A5] transition-colors hidden sm:block"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Back to Pranayama Times Editorial Link */}
            <a
              href={siteConfig.url}
              title="Return to Pranayama Times editorial website"
              className="text-xs text-[#82947A] hover:text-[#263F35] font-medium px-2.5 py-1.5 rounded-xl border border-transparent hover:border-[#D6C6A5] transition-colors inline-flex items-center gap-1"
            >
              <span>&larr;</span>
              <span className="hidden sm:inline">Pranayama Times</span>
            </a>
          </div>
        </div>
      )}

      {/* Routine Selector Tabs (Responsive horizontal bar) */}
      {!isFullscreen && (
        <div className="flex flex-wrap gap-2">
          {activeCategory === "pranayama"
            ? PRANAYAMA_ROUTINES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectRoutine(r)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35] ${
                    selectedRoutine.id === r.id
                      ? "bg-[#263F35] text-[#FAF7F2] shadow-xs"
                      : "bg-[#EDE8DC] text-[#355245] border border-[#D6C6A5] hover:border-[#82947A]"
                  }`}
                >
                  {r.name}
                </button>
              ))
            : YOGA_NIDRA_ROUTINES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectRoutine(r)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35] ${
                    selectedRoutine.id === r.id
                      ? "bg-[#263F35] text-[#FAF7F2] shadow-xs"
                      : "bg-[#EDE8DC] text-[#355245] border border-[#D6C6A5] hover:border-[#82947A]"
                  }`}
                >
                  {r.name}
                </button>
              ))}
        </div>
      )}

      {/* Main Timer Display */}
      <div className="text-center space-y-6 max-w-lg mx-auto">
        <div className="space-y-1">
          <span className="text-xs uppercase font-medium tracking-widest text-[#82947A] block">
            {activeCategory === "pranayama"
              ? `Phase ${currentPhaseIndex + 1} of ${selectedRoutine.phases.length} • ${selectedRoutine.name}`
              : `Guided Audio • ${selectedRoutine.name}`}
          </span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#263F35]">
            {sessionCompleted ? "Practice Complete" : currentPhase?.label}
          </h2>
          <p className="text-xs sm:text-sm text-[#355245] max-w-sm mx-auto">
            {sessionCompleted
              ? "Take a moment of stillness before returning."
              : currentPhase?.description}
          </p>

          {/* Yoga Nidra Offline Readiness & Download Badge */}
          {activeCategory === "yoga-nidra" && !sessionCompleted && (
            <div className="flex flex-col items-center justify-center gap-1 pt-1.5 text-xs">
              {isOfflineReady ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#82947A]/15 text-[#263F35] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#263F35]" />
                  Available Offline
                </span>
              ) : isDownloading ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D6C6A5]/40 text-[#263F35] font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving offline... {downloadProgress}%
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleDownloadTrack}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D6C6A5] text-[#263F35] hover:bg-[#EDE8DC] transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#B97755]" />
                  Download for Offline Practice
                </button>
              )}
              {downloadError && (
                <span className="text-[11px] text-[#B97755]">{downloadError}</span>
              )}
            </div>
          )}
        </div>

        {/* Central Breathing Ring */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center my-6">
          {/* Subtle pulsating backdrop */}
          <div
            className={`absolute w-full h-full rounded-full transition-transform duration-1000 ${
              isRunning
                ? isWitness
                  ? "scale-95 bg-[#E2E8DF]/60"
                  : "scale-105 bg-[#D6C6A5]/30"
                : "bg-[#EDE8DC]/50"
            } border border-[#D6C6A5]`}
          />

          {/* Inner focus orb */}
          <div className="relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-[#263F35] border-2 border-[#355245] shadow-sm flex flex-col items-center justify-center text-[#EDE8DC] p-4 text-center">
            {currentPhase?.image && !sessionCompleted && (
              <div className="mb-1 w-8 h-8 relative opacity-85">
                <Image
                  src={currentPhase.image}
                  alt={currentPhase.label}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            <span className="text-4xl sm:text-5xl font-serif font-bold text-[#FAF7F2] tracking-tight">
              {sessionCompleted ? (
                <CheckCircle2 className="w-12 h-12 text-[#82947A]" />
              ) : (
                formatTime(phaseSecondsRemaining)
              )}
            </span>

            <span className="text-[11px] font-sans text-[#D6C6A5] uppercase tracking-wider mt-1 font-medium">
              {sessionCompleted
                ? "Namaste"
                : isWitness
                ? "Witness Silence"
                : isRunning
                ? "Eyes Closed"
                : "Ready"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={skipPrev}
            disabled={currentPhaseIndex === 0 || selectedRoutine.phases.length <= 1}
            aria-label="Previous phase"
            className="p-3 rounded-full bg-[#EDE8DC] hover:bg-[#E2E8DF] text-[#263F35] border border-[#D6C6A5] disabled:opacity-40 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            aria-label={isRunning ? "Pause session" : "Start session"}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#263F35] hover:bg-[#1A2D25] text-[#FAF7F2] border border-[#263F35] shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {isRunning ? (
              <Pause className="w-6 h-6 text-[#FAF7F2]" />
            ) : (
              <Play className="w-6 h-6 text-[#FAF7F2] fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={skipNext}
            disabled={
              currentPhaseIndex === selectedRoutine.phases.length - 1 ||
              selectedRoutine.phases.length <= 1
            }
            aria-label="Next phase"
            className="p-3 rounded-full bg-[#EDE8DC] hover:bg-[#E2E8DF] text-[#263F35] border border-[#D6C6A5] disabled:opacity-40 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={resetSession}
            aria-label="Reset routine"
            className="p-3 rounded-full bg-[#EDE8DC] hover:bg-[#E2E8DF] text-[#263F35] border border-[#D6C6A5] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-[#82947A] font-medium pt-2">
          {settings.muteAllAudio ? (
            <span className="text-[#B97755]">Audio is muted • Visual timer active</span>
          ) : settings.muteTechniqueNames ? (
            <span>Spoken cues muted • Temple bells active for transitions</span>
          ) : (
            <span>Temple bells and classical vocal cues guide transitions • Eyes closed practice</span>
          )}
        </p>
      </div>

      {/* Sequence List Progression */}
      {!isFullscreen && selectedRoutine.phases.length > 1 && (
        <div className="pt-6 border-t border-[#D6C6A5]/50 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#82947A] font-medium">
            <span>Sequence Progress</span>
            <span>{Math.round(selectedRoutine.totalDurationSeconds / 60)} minutes total</span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-2">
            {selectedRoutine.phases.map((p, idx) => {
              const isPast = idx < currentPhaseIndex;
              const isCurrent = idx === currentPhaseIndex;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentPhaseIndex(idx);
                    setPhaseSecondsRemaining(p.durationSeconds);
                    webAudioPlayer.playPhaseAudio(p, settings);
                  }}
                  className={`cursor-pointer px-2.5 py-1.5 rounded-lg text-[10px] font-medium shrink-0 border transition-colors ${
                    isCurrent
                      ? "bg-[#263F35] text-[#FAF7F2] border-[#263F35]"
                      : isPast
                      ? "bg-[#E2E8DF] text-[#263F35] border-[#82947A]/40"
                      : "bg-[#EDE8DC] text-[#82947A] border-[#D6C6A5]"
                  }`}
                >
                  {p.label} ({Math.round(p.durationSeconds / 60)}m)
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Practice History Modal */}
      <PracticeHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onImportHistory={async (imported) => {
          const updated = await importSessionHistory(imported);
          setHistory(updated);
        }}
      />
    </div>
  );
};
