import { Phase } from './Phase';

export interface Routine {
  /** Unique routine identifier */
  id: string;
  /** Display name of the routine ("Pranayama" for v1) */
  name: string;
  /** Brief summary description of the routine */
  description: string;
  /** Calculated total duration in seconds */
  totalDurationSeconds: number;
  /** Ordered list of phases executing sequentially */
  phases: Phase[];
  /** Origin source of the routine */
  source: 'builtin' | 'custom';
}
