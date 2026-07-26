import { Phase } from '../models/Phase';
import { TimerCallbacks, TimerState, TimerStatus } from './types';

/**
 * Pure TypeScript TimerEngine state machine.
 * Uses Date.now() real-time deltas to calculate remaining phase seconds (D2).
 * Strictly decoupled — zero dependencies on React, audio libraries, or storage (D5).
 */
export class TimerEngine {
  private phases: Phase[] = [];
  private currentPhaseIndex: number = 0;
  private status: TimerStatus = 'IDLE';

  private sessionStartedAtMs: number | null = null;
  private phaseStartedAtMs: number | null = null;
  private pausedAtMs: number | null = null;
  private currentPhasePausedAccumulatedMs: number = 0;
  private totalPausedAccumulatedMs: number = 0;

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private callbacks: TimerCallbacks = {};

  constructor(phases: Phase[] = [], callbacks: TimerCallbacks = {}) {
    this.phases = phases;
    this.callbacks = callbacks;
  }

  public setPhases(phases: Phase[]): void {
    this.phases = phases;
  }

  public setCallbacks(callbacks: TimerCallbacks): void {
    this.callbacks = callbacks;
  }

  public start(): void {
    if (this.phases.length === 0) {
      return;
    }

    const now = Date.now();
    this.status = 'RUNNING';
    this.currentPhaseIndex = 0;
    this.sessionStartedAtMs = now;
    this.phaseStartedAtMs = now;
    this.pausedAtMs = null;
    this.currentPhasePausedAccumulatedMs = 0;
    this.totalPausedAccumulatedMs = 0;

    this.notifyStatusChange();
    this.notifyPhaseChange();
    this.startInterval();
    this.tick();
  }

  public pause(): void {
    if (this.status !== 'RUNNING') {
      return;
    }

    this.status = 'PAUSED';
    this.pausedAtMs = Date.now();
    this.stopInterval();
    this.notifyStatusChange();
    this.tick();
  }

  public resume(): void {
    if (this.status !== 'PAUSED' || !this.pausedAtMs) {
      return;
    }

    const now = Date.now();
    const pausedDuration = now - this.pausedAtMs;
    this.currentPhasePausedAccumulatedMs += pausedDuration;
    this.totalPausedAccumulatedMs += pausedDuration;
    this.pausedAtMs = null;
    this.status = 'RUNNING';

    this.notifyStatusChange();
    this.startInterval();
    this.tick();
  }

  public reset(): void {
    this.stopInterval();
    this.status = 'IDLE';
    this.currentPhaseIndex = 0;
    this.sessionStartedAtMs = null;
    this.phaseStartedAtMs = null;
    this.pausedAtMs = null;
    this.currentPhasePausedAccumulatedMs = 0;
    this.totalPausedAccumulatedMs = 0;

    this.notifyStatusChange();
    this.notifyTick();
  }

  public skipPhase(): void {
    if (this.status !== 'RUNNING' && this.status !== 'PAUSED') {
      return;
    }

    this.advanceToNextPhase();
  }

  public getState(): TimerState {
    const currentPhase = this.phases[this.currentPhaseIndex] || null;

    if (this.status === 'IDLE' || !this.phaseStartedAtMs || !currentPhase) {
      return {
        status: this.status,
        currentPhaseIndex: this.currentPhaseIndex,
        currentPhase,
        currentPhaseSecondsRemaining: currentPhase ? currentPhase.durationSeconds : 0,
        totalElapsedSeconds: 0,
      };
    }

    const now = this.status === 'PAUSED' && this.pausedAtMs ? this.pausedAtMs : Date.now();
    
    // Real-time delta calculations (D2)
    const phaseElapsedMs = Math.max(
      0,
      now - this.phaseStartedAtMs - this.currentPhasePausedAccumulatedMs
    );
    const totalElapsedMs = Math.max(
      0,
      now - (this.sessionStartedAtMs || now) - this.totalPausedAccumulatedMs
    );

    const remainingPhaseSeconds = Math.max(
      0,
      Math.ceil(currentPhase.durationSeconds - phaseElapsedMs / 1000)
    );

    return {
      status: this.status,
      currentPhaseIndex: this.currentPhaseIndex,
      currentPhase,
      currentPhaseSecondsRemaining: remainingPhaseSeconds,
      totalElapsedSeconds: Math.floor(totalElapsedMs / 1000),
    };
  }

  private tick(): void {
    if (this.status !== 'RUNNING') {
      this.notifyTick();
      return;
    }

    const currentPhase = this.phases[this.currentPhaseIndex];
    if (!currentPhase || !this.phaseStartedAtMs) {
      return;
    }

    const now = Date.now();
    const phaseElapsedMs = now - this.phaseStartedAtMs - this.currentPhasePausedAccumulatedMs;
    const remainingMs = currentPhase.durationSeconds * 1000 - phaseElapsedMs;

    if (remainingMs <= 0) {
      this.advanceToNextPhase();
    } else {
      this.notifyTick();
    }
  }

  private advanceToNextPhase(): void {
    const nextIndex = this.currentPhaseIndex + 1;

    if (nextIndex >= this.phases.length) {
      this.status = 'COMPLETED';
      this.stopInterval();
      this.notifyStatusChange();
      this.notifyTick();
      if (this.callbacks.onComplete) {
        this.callbacks.onComplete();
      }
      return;
    }

    this.currentPhaseIndex = nextIndex;
    this.phaseStartedAtMs = Date.now();
    this.currentPhasePausedAccumulatedMs = 0;

    this.notifyPhaseChange();
    this.notifyTick();
  }

  private startInterval(): void {
    this.stopInterval();
    this.intervalId = setInterval(() => {
      this.tick();
    }, 200);
  }

  private stopInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private notifyTick(): void {
    if (this.callbacks.onTick) {
      this.callbacks.onTick(this.getState());
    }
  }

  private notifyPhaseChange(): void {
    const currentPhase = this.phases[this.currentPhaseIndex];
    if (currentPhase && this.callbacks.onPhaseChange) {
      this.callbacks.onPhaseChange(currentPhase, this.currentPhaseIndex);
    }
  }

  private notifyStatusChange(): void {
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange(this.status);
    }
  }
}
