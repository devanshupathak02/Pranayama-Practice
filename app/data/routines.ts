import { Routine } from '../models/Routine';
import { PRANAYAMA_ROUTINE } from './pranayamaRoutine';

/**
 * Available routines registry.
 * v1 ships with exactly one fixed routine (ROUTINES[0]).
 * Structured as an array to prepare for future routines without breaking data plumbing (D10).
 */
export const ROUTINES: Routine[] = [PRANAYAMA_ROUTINE];

/**
 * Helper to look up a routine by its unique identifier.
 */
export const getRoutineById = (id: string): Routine | undefined => {
  return ROUTINES.find((routine) => routine.id === id);
};

/**
 * Primary routine used for v1.
 */
export const DEFAULT_ROUTINE: Routine = ROUTINES[0];
