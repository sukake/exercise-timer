export type CueMode = "beep" | "voice";

export type WorkoutSettings = {
  laps: number;
  intervalSecs: number;
  exerciseSecs: number;
  cueMode: CueMode;
};

export type Profile = {
  name: string;
  settings: WorkoutSettings;
};

export type PhaseKind = "getReady" | "exercise" | "rest";

export type Segment = {
  kind: PhaseKind;
  secs: number;
  /** 1-based lap number this segment belongs to (undefined for getReady). */
  lap?: number;
};

export const GET_READY_SECS = 5;

/** Max characters accepted for the user's name (keeps the UI from breaking). */
export const NAME_MAX_LENGTH = 15;

export const DEFAULT_SETTINGS: WorkoutSettings = {
  laps: 10,
  intervalSecs: 20,
  exerciseSecs: 60,
  cueMode: "beep",
};

/** Accepted ranges for each numeric setting (shared by the form and storage). */
export const LIMITS = {
  laps: { min: 1, max: 999 },
  exerciseSecs: { min: 5, max: 3600 },
  intervalSecs: { min: 3, max: 3600 },
} as const;

/**
 * Flattens a workout into an ordered list of timed segments.
 * getReady -> (exercise, rest) x laps, with NO trailing rest after the final exercise.
 */
export function buildSegments(s: WorkoutSettings): Segment[] {
  const segs: Segment[] = [{ kind: "getReady", secs: GET_READY_SECS }];
  for (let lap = 1; lap <= s.laps; lap++) {
    segs.push({ kind: "exercise", secs: s.exerciseSecs, lap });
    if (lap < s.laps) {
      segs.push({ kind: "rest", secs: s.intervalSecs, lap });
    }
  }
  return segs;
}
