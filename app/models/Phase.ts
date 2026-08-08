import { ImageSourcePropType } from 'react-native';

/**
 * Supported phase categories within a pranayama session.
 * Visual and audio rendering depends on phase type:
 * - 'pranayama': renders full-screen image, plays technique name audio once
 * - 'witness': calm view, plays witness bell audio (always active)
 * - 'preparation' / 'meditation': calm view, silent/timer only
 * - 'ending': instant 0s phase, plays completion chime audio (always active)
 */
export type PhaseType =
  | 'preparation'
  | 'meditation'
  | 'pranayama'
  | 'witness'
  | 'ending'
  | 'custom';

/**
 * Category of audio attached to a phase.
 * Determines mute behavior (D8, D9a):
 * - 'technique-name': mutable via muteTechniqueNames setting
 * - 'bell': always plays, non-mutable
 * - 'ending': always plays, non-mutable
 * - 'custom': user-provided audio, always plays, non-mutable
 */
export type AudioCategory = 'technique-name' | 'bell' | 'ending' | 'custom';

export interface PhaseAudio {
  /** Reference to audio asset */
  file?: number | string;
  /** Audio category determining scoped mute behavior */
  category: AudioCategory;
  /** Whether the audio plays once at start or loops (always true for v1) */
  playOnce: boolean;
}

export interface Phase {
  /** Unique phase identifier */
  id: string;
  /** Structural phase type */
  type: PhaseType;
  /** Display title (e.g. "Kapalbhati Pranayam", "Normal Breath / Witness") */
  label: string;
  /** Phase duration in seconds */
  durationSeconds: number;
  /** Full-screen background image (used only when type === 'pranayama' or when custom routine has an image) */
  image?: ImageSourcePropType | string;
  /** Audio cue configuration for phase start */
  audio?: PhaseAudio;
}
