import { create } from 'zustand';
import { Platform } from 'react-native';
import { Phase } from '../models/Phase';
import { Routine } from '../models/Routine';
import { TimerEngine } from '../timer/TimerEngine';
import { TimerStatus } from '../timer/types';
import { getRoutineById, ROUTINES } from '../data/routines';
import { audioService } from '../audio/AudioService';
import { loadSettings, saveSettings } from '../storage/db';
import { DEFAULT_WITNESS_SOUND_ID } from '../constants/sounds';
import { useHistoryStore } from './historyStore';
import { SessionRecord } from '../models/SessionHistory';
import { NotificationService } from '../notifications/NotificationService';

interface SessionStoreState {
  // Routine & Timer State
  activeRoutine: Routine | null;
  sessionId: string | null;
  status: TimerStatus;
  currentPhaseIndex: number;
  currentPhase: Phase | null;
  currentPhaseSecondsRemaining: number;
  totalSecondsRemaining: number;
  totalElapsedSeconds: number;

  // Settings State (D8, D9a)
  muteTechniqueNames: boolean;
  witnessSoundId: string;
  isSettingsLoaded: boolean;

  // Actions
  initSettings: () => Promise<void>;
  toggleMuteTechniqueNames: (value: boolean) => Promise<void>;
  setWitnessSound: (soundId: string) => Promise<void>;
  startSession: (routineId?: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  resetSession: () => void;
  skipPhase: () => void;
  previousPhase: () => void;
}

// Module-level TimerEngine instance (D5: pure TS engine)
let timerEngine: TimerEngine | null = null;
let lastNotificationUpdateMs = 0;
// Platform split update interval (D16): 1.5s on Android for near-live tick feel, 5s on iOS
const NOTIFICATION_UPDATE_INTERVAL_MS = Platform.OS === 'android' ? 1500 : 5000;


export const useSessionStore = create<SessionStoreState>((set, get) => ({
  activeRoutine: ROUTINES[0],
  sessionId: null,
  status: 'IDLE',
  currentPhaseIndex: 0,
  currentPhase: ROUTINES[0]?.phases[0] || null,
  currentPhaseSecondsRemaining: ROUTINES[0]?.phases[0]?.durationSeconds || 0,
  totalSecondsRemaining: ROUTINES[0]?.totalDurationSeconds || 0,
  totalElapsedSeconds: 0,

  muteTechniqueNames: false,
  witnessSoundId: DEFAULT_WITNESS_SOUND_ID,
  isSettingsLoaded: false,

  initSettings: async () => {
    const settings = await loadSettings();
    set({
      muteTechniqueNames: settings.muteTechniqueNames,
      witnessSoundId: settings.witnessSoundId || DEFAULT_WITNESS_SOUND_ID,
      isSettingsLoaded: true,
    });
  },

  toggleMuteTechniqueNames: async (value: boolean) => {
    set({ muteTechniqueNames: value });
    await saveSettings({
      muteTechniqueNames: value,
      witnessSoundId: get().witnessSoundId,
    });
  },

  setWitnessSound: async (soundId: string) => {
    set({ witnessSoundId: soundId });
    await saveSettings({
      muteTechniqueNames: get().muteTechniqueNames,
      witnessSoundId: soundId,
    });
  },

  startSession: (routineId?: string) => {
    const targetRoutine = (routineId ? getRoutineById(routineId) : null) || ROUTINES[0];

    if (!targetRoutine || targetRoutine.phases.length === 0) {
      return;
    }

    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Stop any existing audio before starting session
    audioService.stop();

    // D18: Play session-start bell once at session lifecycle start
    audioService.playStartBell();

    if (!timerEngine) {
      timerEngine = new TimerEngine();
    }

    lastNotificationUpdateMs = Date.now();

    // Request notification permission at session start (once, cached — D15).
    console.log('[sessionStore] Requesting notification permission for startSession...');
    NotificationService.requestPermissions().then((granted: boolean) => {
      if (granted) {
        const firstPhase = targetRoutine.phases[0];
        NotificationService.showOrUpdate(
          firstPhase,
          firstPhase.durationSeconds,
          targetRoutine.totalDurationSeconds,
          false
        );
        // Schedule Web Push notifications for upcoming phase boundaries & completion (D20)
        NotificationService.schedulePushes(
          targetRoutine,
          0,
          firstPhase.durationSeconds,
          newSessionId
        );
      }
    }).catch((err: any) => {
      console.warn('[sessionStore] NotificationService requestPermissions failed silently:', err);
    });

    timerEngine.setPhases(targetRoutine.phases);
    timerEngine.setCallbacks({
      onTick: (state) => {
        set({
          status: state.status,
          currentPhaseIndex: state.currentPhaseIndex,
          currentPhase: state.currentPhase,
          currentPhaseSecondsRemaining: state.currentPhaseSecondsRemaining,
          totalSecondsRemaining: state.totalSecondsRemaining,
          totalElapsedSeconds: state.totalElapsedSeconds,
        });

        // Periodic live updates (every 5 seconds per D16) while RUNNING
        if (state.currentPhase && state.status === 'RUNNING') {
          const now = Date.now();
          if (now - lastNotificationUpdateMs >= NOTIFICATION_UPDATE_INTERVAL_MS) {
            lastNotificationUpdateMs = now;
            NotificationService.showOrUpdate(
              state.currentPhase,
              state.currentPhaseSecondsRemaining,
              state.totalSecondsRemaining,
              false
            );
          }
        }
      },
      onPhaseChange: (phase, _index) => {
        // Audio cue (D8) — play audio for phase if defined
        if (phase.audio?.file) {
          audioService.playPhaseAudio(phase, get().muteTechniqueNames, get().witnessSoundId);
        }
        // Immediate notification update on phase change (D15/D16)
        const state = get();
        lastNotificationUpdateMs = Date.now();
        NotificationService.showOrUpdate(
          phase,
          phase.durationSeconds,
          state.totalSecondsRemaining,
          false
        );
      },
      onComplete: () => {
        const activeRoutine = get().activeRoutine;
        const totalElapsedSeconds = get().totalElapsedSeconds;

        if (activeRoutine) {
          const record: SessionRecord = {
            id: `session_${Date.now()}`,
            routineId: activeRoutine.id,
            routineName: activeRoutine.name,
            completedAt: new Date().toISOString(),
            totalDurationSeconds: totalElapsedSeconds || activeRoutine.totalDurationSeconds,
            completedPhasesCount: activeRoutine.phases.length,
          };
          useHistoryStore.getState().addRecord(record);
        }

        audioService.playCompletionBell();
        lastNotificationUpdateMs = 0;
        set({ status: 'COMPLETED' });
        // Dismiss notification on session complete (D15/D16)
        NotificationService.dismiss();
      },
      onStatusChange: (status) => {
        set({ status });
      },
    });

    set({
      activeRoutine: targetRoutine,
      sessionId: newSessionId,
      currentPhaseIndex: 0,
      currentPhase: targetRoutine.phases[0],
      currentPhaseSecondsRemaining: targetRoutine.phases[0].durationSeconds,
      totalSecondsRemaining: targetRoutine.totalDurationSeconds,
      totalElapsedSeconds: 0,
      status: 'RUNNING',
    });

    timerEngine.start();
  },

  pauseSession: () => {
    if (timerEngine) {
      timerEngine.pause();
      audioService.pause();
      // Cancel pending Web Push messages while paused (D20)
      const { sessionId, currentPhase, currentPhaseSecondsRemaining, totalSecondsRemaining } = get();
      if (sessionId) {
        NotificationService.cancelPushes(sessionId, 'PAUSED');
      }
      // Update notification immediately to show paused state with Resume action (D16)
      if (currentPhase) {
        lastNotificationUpdateMs = Date.now();
        NotificationService.showOrUpdate(
          currentPhase,
          currentPhaseSecondsRemaining,
          totalSecondsRemaining,
          true
        );
      }
    }
  },

  resumeSession: () => {
    if (timerEngine) {
      timerEngine.resume();
      audioService.resume();
      // Reschedule pending Web Push messages with updated remaining times (D20)
      const { activeRoutine, currentPhaseIndex, currentPhaseSecondsRemaining, sessionId, currentPhase, totalSecondsRemaining } = get();
      if (activeRoutine && sessionId) {
        NotificationService.schedulePushes(
          activeRoutine,
          currentPhaseIndex,
          currentPhaseSecondsRemaining,
          sessionId
        );
      }
      // Update notification immediately back to active state with Pause action (D16)
      if (currentPhase) {
        lastNotificationUpdateMs = Date.now();
        NotificationService.showOrUpdate(
          currentPhase,
          currentPhaseSecondsRemaining,
          totalSecondsRemaining,
          false
        );
      }
    }
  },

  resetSession: () => {
    if (timerEngine) {
      timerEngine.reset();
    }
    audioService.stop();
    lastNotificationUpdateMs = 0;
    // Dismiss notification & cancel server pushes on manual exit (D15/D16/D20)
    NotificationService.dismiss();

    const routine = get().activeRoutine || ROUTINES[0];
    set({
      status: 'IDLE',
      sessionId: null,
      currentPhaseIndex: 0,
      currentPhase: routine.phases[0] || null,
      currentPhaseSecondsRemaining: routine.phases[0]?.durationSeconds || 0,
      totalSecondsRemaining: routine?.totalDurationSeconds || 0,
      totalElapsedSeconds: 0,
    });
  },

  skipPhase: () => {
    audioService.stop();
    if (timerEngine) {
      timerEngine.skipPhase();
      const { activeRoutine, currentPhaseIndex, currentPhaseSecondsRemaining, sessionId } = get();
      if (activeRoutine && sessionId) {
        NotificationService.schedulePushes(
          activeRoutine,
          currentPhaseIndex,
          currentPhaseSecondsRemaining,
          sessionId
        );
      }
    }
  },

  previousPhase: () => {
    audioService.stop();
    if (timerEngine) {
      timerEngine.previousPhase();
      const { activeRoutine, currentPhaseIndex, currentPhaseSecondsRemaining, sessionId } = get();
      if (activeRoutine && sessionId) {
        NotificationService.schedulePushes(
          activeRoutine,
          currentPhaseIndex,
          currentPhaseSecondsRemaining,
          sessionId
        );
      }
    }
  },
}));
