'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routine, AppSettings, SessionRecord } from '@/types/timer';
import { TimerEngine } from '@/lib/timer/TimerEngine';
import { webAudioPlayer } from '@/lib/timer/webAudioPlayer';
import { recordCompletedSession } from '@/lib/storage/indexedDB';
import { backgroundAudioCache } from '@/lib/storage/offlineAudio';
import { COMPLETION_BELL } from '@/data/routines';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';

interface ActivePracticeScreenProps {
  routine: Routine;
  settings: AppSettings;
  onSessionComplete: (record: SessionRecord) => void;
  onExit: () => void;
}

function getInitialPhaseState(routine: Routine): { index: number; remaining: number; startTime: number | null } {
  if (typeof window === 'undefined') {
    return { index: 0, remaining: routine.phases[0]?.durationSeconds || 0, startTime: null };
  }
  try {
    const raw = sessionStorage.getItem('pranayama_active_session');
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.routineId === routine.id && saved.sessionStartedAtMs) {
        const elapsedSinceStartSec = Math.floor((Date.now() - saved.sessionStartedAtMs) / 1000);
        if (elapsedSinceStartSec < routine.totalDurationSeconds) {
          let accumulatedSec = 0;
          for (let i = 0; i < routine.phases.length; i++) {
            const phaseDur = routine.phases[i].durationSeconds;
            if (elapsedSinceStartSec < accumulatedSec + phaseDur) {
              return {
                index: i,
                remaining: accumulatedSec + phaseDur - elapsedSinceStartSec,
                startTime: saved.sessionStartedAtMs,
              };
            }
            accumulatedSec += phaseDur;
          }
        }
      }
    }
  } catch {
    // Ignore
  }
  return { index: 0, remaining: routine.phases[0]?.durationSeconds || 0, startTime: null };
}

export function ActivePracticeScreen({
  routine,
  settings,
  onSessionComplete,
  onExit,
}: ActivePracticeScreenProps) {
  const [initialState] = useState(() => getInitialPhaseState(routine));
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(initialState.index);
  const [phaseSecondsRemaining, setPhaseSecondsRemaining] = useState(initialState.remaining);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localMute, setLocalMute] = useState(settings.muteAllAudio);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerEngineRef = useRef<TimerEngine | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const sessionStartTimeRef = useRef<number | null>(initialState.startTime);

  // Mutable refs for values that must NOT reset the timer session when modified
  const localMuteRef = useRef(localMute);
  const settingsRef = useRef(settings);
  const onSessionCompleteRef = useRef(onSessionComplete);

  useEffect(() => {
    localMuteRef.current = localMute;
    settingsRef.current = settings;
    onSessionCompleteRef.current = onSessionComplete;
  });

  // Active Session coordination flag for Service Worker
  const setActiveSessionFlag = (active: boolean) => {
    if (typeof window !== 'undefined') {
      (window as unknown as { __PRANAYAMA_IS_ACTIVE_SESSION__?: boolean }).__PRANAYAMA_IS_ACTIVE_SESSION__ = active;
    }
  };

  // Sync active state snapshot to sessionStorage for timestamp recovery
  const syncSessionStorage = useCallback((phaseIdx: number, paused: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      const snapshot = {
        routineId: routine.id,
        sessionStartedAtMs: sessionStartTimeRef.current || Date.now(),
        phaseIndex: phaseIdx,
        isPaused: paused,
        timestamp: Date.now(),
      };
      sessionStorage.setItem('pranayama_active_session', JSON.stringify(snapshot));
    } catch {
      // Ignore
    }
  }, [routine.id]);

  const clearSessionStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem('pranayama_active_session');
    } catch {
      // Ignore
    }
  }, []);

  // Screen Wake Lock API
  const requestWakeLock = useCallback(async () => {
    if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch {
        // Ignored
      }
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // Ignored
      }
      wakeLockRef.current = null;
    }
  }, []);

  // Initialize TimerEngine with recovery support (runs once per routine)
  useEffect(() => {
    const isYogaNidra = routine.category === 'yoga-nidra' || !!routine.audioFile;

    const engine = new TimerEngine(routine.phases, {
      onTick: (state) => {
        setCurrentPhaseIndex(state.currentPhaseIndex);
        setPhaseSecondsRemaining(state.currentPhaseSecondsRemaining);
        syncSessionStorage(state.currentPhaseIndex, false);
      },
      onPhaseChange: (phase) => {
        // Only trigger phase sound cues for pranayama routines; yoga nidra is a single continuous stream
        if (!isYogaNidra) {
          const currentSettings = { ...settingsRef.current, muteAllAudio: localMuteRef.current };
          webAudioPlayer.playPhaseAudio(phase, currentSettings);
        }
      },
      onComplete: async () => {
        setIsRunning(false);
        setSessionCompleted(true);
        setActiveSessionFlag(false);
        releaseWakeLock();
        clearSessionStorage();

        // Completion bell
        const currentSettings = { ...settingsRef.current, muteAllAudio: localMuteRef.current };
        webAudioPlayer.playPhaseAudio(
          {
            id: 'completion-bell',
            type: 'ending',
            label: 'Complete',
            durationSeconds: 0,
            audio: { file: COMPLETION_BELL, category: 'ending', playOnce: true },
          },
          currentSettings
        );

        // Record to IndexedDB
        const now = new Date();
        const startTime = sessionStartTimeRef.current
          ? new Date(sessionStartTimeRef.current).toISOString()
          : now.toISOString();

        const record: SessionRecord = {
          id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          routineId: routine.id,
          routineName: routine.name,
          startedAt: startTime,
          completedAt: now.toISOString(),
          durationSeconds: routine.totalDurationSeconds,
          completed: true,
          completedPhases: routine.phases.length,
          totalPhases: routine.phases.length,
        };

        await recordCompletedSession(record);
        onSessionCompleteRef.current(record);
      },
      onStatusChange: (status) => {
        setIsRunning(status === 'RUNNING');
      },
    });

    timerEngineRef.current = engine;

    // Start session
    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = Date.now();
    }
    setActiveSessionFlag(true);
    requestWakeLock();

    // Unified Audio Launch: Continuous Yoga Nidra streams through HTML5 pipeline;
    // Pranayama plays discrete phase audio and bell cues.
    const initialSettings = { ...settingsRef.current, muteAllAudio: localMuteRef.current };
    if (isYogaNidra && routine.audioFile) {
      const audioUrl = routine.audioFile;
      webAudioPlayer.playStreamingAudio(audioUrl, initialSettings, () => {
        // Automatic Background Caching: Triggers after live streaming playback successfully starts
        const isAutoCacheAllowed = settingsRef.current.autoCacheAudio !== false;
        if (isAutoCacheAllowed && typeof navigator !== 'undefined' && navigator.onLine) {
          setTimeout(() => {
            backgroundAudioCache.triggerBackgroundCache(audioUrl);
          }, 500);
        }
      });
    } else {
      const currentPhase = routine.phases[initialState.index];
      if (currentPhase) {
        webAudioPlayer.playPhaseAudio(currentPhase, initialSettings);
      }
    }
    engine.start();

    return () => {
      engine.reset();
      webAudioPlayer.stop();
      releaseWakeLock();
      setActiveSessionFlag(false);
    };
  }, [routine, initialState.index, releaseWakeLock, requestWakeLock, syncSessionStorage, clearSessionStorage]);

  // Tab visibility recovery
  useEffect(() => {
    const handleVisibility = () => {
      if (timerEngineRef.current) {
        timerEngineRef.current.handleVisibilityChange(!document.hidden);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Prevent accidental back navigation / unload when session is active
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning && !sessionCompleted) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRunning, sessionCompleted]);

  // Controls
  const togglePlay = () => {
    if (!timerEngineRef.current) return;
    if (sessionCompleted) return;

    const isYogaNidra = routine.category === 'yoga-nidra' || !!routine.audioFile;

    if (isRunning) {
      timerEngineRef.current.pause();
      if (isYogaNidra) {
        webAudioPlayer.pauseStreamingAudio();
      }
      releaseWakeLock();
      setActiveSessionFlag(false);
      syncSessionStorage(currentPhaseIndex, true);
    } else {
      setActiveSessionFlag(true);
      if (!sessionStartTimeRef.current) {
        sessionStartTimeRef.current = Date.now();
      }
      if (isYogaNidra) {
        webAudioPlayer.resumeStreamingAudio();
      }
      timerEngineRef.current.resume();
      requestWakeLock();
      syncSessionStorage(currentPhaseIndex, false);
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
    clearSessionStorage();
    setCurrentPhaseIndex(0);
    setPhaseSecondsRemaining(routine.phases[0]?.durationSeconds || 0);
    setSessionCompleted(false);
    setIsRunning(false);
  };

  const handleExitClick = () => {
    if (isRunning && !sessionCompleted) {
      setShowExitConfirm(true);
    } else {
      webAudioPlayer.stop();
      clearSessionStorage();
      onExit();
    }
  };

  const confirmExit = () => {
    clearSessionStorage();
    if (timerEngineRef.current) {
      timerEngineRef.current.reset();
    }
    webAudioPlayer.stop();
    releaseWakeLock();
    setActiveSessionFlag(false);
    setShowExitConfirm(false);
    onExit();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => { });
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentPhase = routine.phases[currentPhaseIndex] || routine.phases[0];
  const isWitness = currentPhase?.type === 'witness';

  const containerClasses = `flex flex-col h-full w-full overflow-hidden select-none overscroll-none touch-none ${isFullscreen ? 'fixed inset-0 z-50 bg-[#FAF7F2]' : ''
    }`;

  const auraClasses = isRunning
    ? isWitness
      ? 'scale-105 bg-[#E2E8DF]/60 border border-[#82947A]/30 breath-harmonic'
      : 'scale-110 bg-[#F5DFD5]/40 border border-[#B97755]/30 breath-harmonic'
    : 'scale-95 bg-[#EDE8DC]/40 border border-[#D6C6A5]/40';

  const haloClasses = isRunning
    ? isWitness
      ? 'border-[#82947A]/40 scale-100'
      : 'border-[#B97755]/40 scale-100'
    : 'border-[#D6C6A5]/50 scale-95';

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* 1. Fixed Top Header (Anchored at Top with Safe Area) */}
      <header className="app-anchor-bar pt-safe w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D6C6A5]/40 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between">
          <button
            onClick={handleExitClick}
            aria-label="Exit session"
            className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#D6C6A5]/60 flex items-center justify-center text-[#263F35] hover:bg-[#E2E8DF] active:scale-95 transition-all shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center px-4">
            <h1 className="font-serif font-bold text-lg sm:text-xl text-[#1A2D25] block truncate max-w-xs sm:max-w-md">
              {routine.name}
            </h1>
            <span className="text-[11px] font-sans font-semibold text-[#82947A] tracking-wider uppercase">
              Phase {currentPhaseIndex + 1} of {routine.phases.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const updated = !localMute;
                setLocalMute(updated);
                webAudioPlayer.setMuted(updated);
              }}
              aria-label="Toggle mute"
              className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#D6C6A5]/60 flex items-center justify-center text-[#263F35] hover:bg-[#E2E8DF] active:scale-95 transition-all shadow-2xs"
            >
              {localMute ? (
                <VolumeX className="w-4 h-4 text-[#B97755]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#263F35]" />
              )}
            </button>

            <button
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
              className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#D6C6A5]/60 hidden sm:flex items-center justify-center text-[#263F35] hover:bg-[#E2E8DF] active:scale-95 transition-all shadow-2xs"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Breathing Circle & Phase Display (Non-scrolling, Centered) */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-4 sm:py-8 space-y-4 sm:space-y-6 overflow-hidden">
        <div className="space-y-1.5 max-w-md px-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#82947A]">
            <Sparkles className="w-3.5 h-3.5 text-[#B97755]" />
            <span>{isWitness ? 'Stillness & Integration' : 'Active Rhythm'}</span>
          </div>

          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[#1A2D25] leading-tight">
            {sessionCompleted ? 'Practice Complete' : currentPhase?.label}
          </h2>

          <p className="text-xs sm:text-sm text-[#355245] leading-relaxed max-w-sm mx-auto line-clamp-2 sm:line-clamp-none">
            {sessionCompleted
              ? 'Remain in stillness to integrate your sadhana and internal quietude.'
              : currentPhase?.description}
          </p>
        </div>

        {/* Central Atmospheric Breathing Ring */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center my-2 select-none">
          {/* Outer Atmospheric Aura */}
          <div className={`absolute w-full h-full rounded-full transition-all duration-1000 ${auraClasses}`}></div>

          {/* Middle Harmonic Halo */}
          <div className={`absolute w-54 h-54 sm:w-68 sm:h-68 rounded-full border transition-all duration-700 ${haloClasses}`}></div>

          {/* Core Visualizer Dial */}
          <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-[#FAF7F2] border-2 border-[#D6C6A5] flex flex-col items-center justify-center shadow-md p-4 sm:p-6">
            {sessionCompleted ? (
              <div className="text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#82947A] mx-auto" />
                <span className="font-serif font-bold text-lg sm:text-xl text-[#263F35] block">
                  Peace &amp; Stillness
                </span>
                <span className="text-[11px] text-[#82947A] uppercase tracking-wider block">
                  Session Logged
                </span>
              </div>
            ) : (
              <>
                <span className="text-[10px] sm:text-[11px] font-sans font-bold text-[#82947A] tracking-widest uppercase block mb-0.5 sm:mb-1">
                  {isWitness ? 'Witness' : 'Technique'}
                </span>
                <span className="font-serif font-bold text-4xl sm:text-6xl text-[#263F35] tracking-tight">
                  {formatTime(phaseSecondsRemaining)}
                </span>
                <span className="text-[10px] sm:text-[11px] font-sans text-[#355245] font-semibold mt-1.5 sm:mt-2 px-2.5 sm:px-3 py-0.5 rounded-full bg-[#EDE8DC] border border-[#D6C6A5]">
                  Phase {currentPhaseIndex + 1} of {routine.phases.length}
                </span>
              </>
            )}
          </div>
        </div>
      </main>

      {/* 3. Fixed Bottom Action Bar (Anchored at Bottom with Safe Area) */}
      <footer className="app-anchor-bar pb-safe w-full bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#D6C6A5]/40 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-3.5 sm:py-5">
          {sessionCompleted ? (
            <button
              onClick={() => {
                clearSessionStorage();
                onExit();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#263F35] hover:bg-[#1A2D25] active:scale-[0.99] text-[#FAF7F2] font-sans font-bold text-sm sm:text-base transition-all shadow-md"
            >
              Return to Application Home
            </button>
          ) : (
            <div className="flex items-center justify-center gap-4 sm:gap-7">
              <button
                onClick={skipPrev}
                disabled={currentPhaseIndex === 0}
                aria-label="Previous Phase"
                className="w-12 h-12 rounded-2xl bg-[#FAF7F2] hover:bg-[#E2E8DF] active:bg-[#D6C6A5] text-[#263F35] border border-[#D6C6A5] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                aria-label={isRunning ? 'Pause' : 'Resume'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#B97755] hover:bg-[#985E40] active:scale-95 text-white flex items-center justify-center shadow-lg transition-all"
              >
                {isRunning ? (
                  <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-current stroke-none" />
                ) : (
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current stroke-none ml-1" />
                )}
              </button>

              <button
                onClick={skipNext}
                disabled={currentPhaseIndex >= routine.phases.length - 1}
                aria-label="Next Phase"
                className="w-12 h-12 rounded-2xl bg-[#FAF7F2] hover:bg-[#E2E8DF] active:bg-[#D6C6A5] text-[#263F35] border border-[#D6C6A5] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={resetSession}
                aria-label="Reset Session"
                className="w-12 h-12 rounded-2xl bg-[#FAF7F2] hover:bg-[#E2E8DF] active:bg-[#D6C6A5] text-[#263F35] border border-[#D6C6A5] flex items-center justify-center transition-all shadow-2xs"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </footer>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FAF7F2] border border-[#D6C6A5] rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-serif font-bold text-2xl text-[#263F35]">
              Leave Active Practice?
            </h3>
            <p className="text-xs sm:text-sm text-[#355245] leading-relaxed">
              Your breathing session is in progress. If you exit now, your incomplete progress will not be logged in your practice journal.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#263F35] text-[#FAF7F2] text-xs font-bold hover:bg-[#1A2D25] transition-colors shadow-2xs"
              >
                Stay in Session
              </button>
              <button
                onClick={confirmExit}
                className="py-3 px-4 rounded-xl border border-[#D6C6A5] text-[#B97755] hover:bg-[#EDE8DC] text-xs font-semibold transition-colors"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
