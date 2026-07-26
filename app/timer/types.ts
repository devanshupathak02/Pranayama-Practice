import { Phase } from '../models/Phase';

export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export interface TimerState {
  status: TimerStatus;
  currentPhaseIndex: number;
  currentPhase: Phase | null;
  currentPhaseSecondsRemaining: number;
  totalElapsedSeconds: number;
}

export interface TimerCallbacks {
  onTick?: (state: TimerState) => void;
  onPhaseChange?: (phase: Phase, phaseIndex: number) => void;
  onComplete?: () => void;
  onStatusChange?: (status: TimerStatus) => void;
}
