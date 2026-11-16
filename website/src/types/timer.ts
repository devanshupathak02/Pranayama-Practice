export type PhaseType =
  | 'preparation'
  | 'meditation'
  | 'pranayama'
  | 'witness'
  | 'ending'
  | 'chant'
  | 'shavasana'
  | 'custom';

export type AudioCategory = 'technique-name' | 'bell' | 'ending' | 'custom';

export interface PhaseAudio {
  file?: string;
  category: AudioCategory;
  playOnce: boolean;
}

export interface Phase {
  id: string;
  type: PhaseType;
  label: string;
  durationSeconds: number;
  description?: string;
  image?: string;
  audio?: PhaseAudio;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  totalDurationSeconds: number;
  phases: Phase[];
  source: 'builtin' | 'custom';
  category: 'pranayama' | 'yoga-nidra';
  audioFile?: string;
}

export interface SessionRecord {
  id: string;
  routineId: string;
  routineName: string;
  startedAt: string; // ISO string
  completedAt?: string;
  durationSeconds: number;
  completed: boolean;
  completedPhases: number;
  totalPhases: number;
}

export interface AppSettings {
  muteTechniqueNames: boolean;
  muteAllAudio: boolean;
  witnessSoundId: string;
  autoCacheAudio?: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  muteTechniqueNames: false,
  muteAllAudio: false,
  witnessSoundId: 'bell-1',
  autoCacheAudio: true,
};
