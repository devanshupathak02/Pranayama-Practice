export interface SessionRecord {
  /** Unique session log entry ID */
  id: string;
  /** Routine identifier (D10: for multi-routine future proofing) */
  routineId: string;
  /** Routine display name */
  routineName: string;
  /** ISO timestamp string of session completion */
  completedAt: string;
  /** Actual total session duration in seconds */
  totalDurationSeconds: number;
  /** Number of completed phases */
  completedPhasesCount: number;
}
