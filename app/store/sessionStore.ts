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
}

// Module-level TimerEngine instance (D5: pure TS engine)
let timerEngine: TimerEngine | null = null;
let lastNotificationUpdateMs = 0;
// Platform split update interval (D16): 1.5s on Android for near-live tick feel, 5s on iOS
const NOTIFICATION_UPDATE_INTERVAL_MS = Platform.OS === 'android' ? 1500 : 5000;


export const useSessionStore = create<SessionStoreState>((set, get) => ({
  activeRoutine: ROUTINES[0],
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

    // Stop any existing audio before starting session
    audioService.stop();

    if (!timerEngine) {
      timerEngine = new TimerEngine();
    }

    lastNotificationUpdateMs = Date.now();

    // Request notification permission at session start (once, cached — D15).
    // Fire-and-forget: session starts regardless of permission outcome.
    console.log('[sessionStore] Requesting notification permission for startSession...');
    NotificationService.requestPermissions().then((granted) => {
      if (granted) {
        const firstPhase = targetRoutine.phases[0];
        NotificationService.showOrUpdate(
          firstPhase,
          firstPhase.durationSeconds,
          targetRoutine.totalDurationSeconds,
          false
        );
      }
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
        // Audio cue (D8) — stop active audio before attempting play for new phase
        audioService.stop();
        audioService.playPhaseAudio(phase, get().muteTechniqueNames, get().witnessSoundId);
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
      // Update notification immediately to show paused state with Resume action (D16)
      const { currentPhase, currentPhaseSecondsRemaining, totalSecondsRemaining } = get();
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
      // Update notification immediately back to active state with Pause action (D16)
      const { currentPhase, currentPhaseSecondsRemaining, totalSecondsRemaining } = get();
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
    // Dismiss notification on manual exit (D15/D16)
    NotificationService.dismiss();

    const routine = get().activeRoutine || ROUTINES[0];
    set({
      status: 'IDLE',
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
    }
  },
}));
