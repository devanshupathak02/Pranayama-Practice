import { create } from 'zustand';
import { Phase } from '../models/Phase';
import { Routine } from '../models/Routine';
import { TimerEngine } from '../timer/TimerEngine';
import { TimerStatus } from '../timer/types';
import { getRoutineById, ROUTINES } from '../data/routines';
import { audioService } from '../audio/AudioService';
import { loadSettings, saveSettings } from '../storage/db';
import { useHistoryStore } from './historyStore';
import { SessionRecord } from '../models/SessionHistory';

interface SessionStoreState {
  // Routine & Timer State
  activeRoutine: Routine | null;
  status: TimerStatus;
  currentPhaseIndex: number;
  currentPhase: Phase | null;
  currentPhaseSecondsRemaining: number;
  totalElapsedSeconds: number;

  // Settings State (D8, D9a)
  muteTechniqueNames: boolean;
  isSettingsLoaded: boolean;

  // Actions
  initSettings: () => Promise<void>;
  toggleMuteTechniqueNames: (value: boolean) => Promise<void>;
  startSession: (routineId?: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  resetSession: () => void;
  skipPhase: () => void;
}

// Module-level TimerEngine instance (D5: pure TS engine)
let timerEngine: TimerEngine | null = null;

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  activeRoutine: ROUTINES[0],
  status: 'IDLE',
  currentPhaseIndex: 0,
  currentPhase: ROUTINES[0]?.phases[0] || null,
  currentPhaseSecondsRemaining: ROUTINES[0]?.phases[0]?.durationSeconds || 0,
  totalElapsedSeconds: 0,

  muteTechniqueNames: false,
  isSettingsLoaded: false,

  initSettings: async () => {
    const settings = await loadSettings();
    set({
      muteTechniqueNames: settings.muteTechniqueNames,
      isSettingsLoaded: true,
    });
  },

  toggleMuteTechniqueNames: async (value: boolean) => {
    set({ muteTechniqueNames: value });
    await saveSettings({ muteTechniqueNames: value });
  },

  startSession: (routineId?: string) => {
    const targetRoutine = (routineId ? getRoutineById(routineId) : null) || ROUTINES[0];

    if (!targetRoutine || targetRoutine.phases.length === 0) {
      return;
    }

    if (!timerEngine) {
      timerEngine = new TimerEngine();
    }

    timerEngine.setPhases(targetRoutine.phases);
    timerEngine.setCallbacks({
      onTick: (state) => {
        set({
          status: state.status,
          currentPhaseIndex: state.currentPhaseIndex,
          currentPhase: state.currentPhase,
          currentPhaseSecondsRemaining: state.currentPhaseSecondsRemaining,
          totalElapsedSeconds: state.totalElapsedSeconds,
        });
      },
      onPhaseChange: (phase, _index) => {
        audioService.playPhaseAudio(phase, get().muteTechniqueNames);
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

        set({ status: 'COMPLETED' });
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
      totalElapsedSeconds: 0,
      status: 'RUNNING',
    });

    timerEngine.start();
  },

  pauseSession: () => {
    if (timerEngine) {
      timerEngine.pause();
    }
  },

  resumeSession: () => {
    if (timerEngine) {
      timerEngine.resume();
    }
  },

  resetSession: () => {
    if (timerEngine) {
      timerEngine.reset();
    }
    audioService.stopCurrentPlayer();
    const routine = get().activeRoutine || ROUTINES[0];
    set({
      status: 'IDLE',
      currentPhaseIndex: 0,
      currentPhase: routine.phases[0] || null,
      currentPhaseSecondsRemaining: routine.phases[0]?.durationSeconds || 0,
      totalElapsedSeconds: 0,
    });
  },

  skipPhase: () => {
    if (timerEngine) {
      timerEngine.skipPhase();
    }
  },
}));
