import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS, LIMITS, NAME_MAX_LENGTH, Profile, WorkoutSettings } from './types';

const KEY = 'timer.profile.v1';
const INTRO_KEY = 'timer.introSeen.v1';

export async function loadIntroSeen(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(INTRO_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function saveIntroSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(INTRO_KEY, '1');
  } catch {
    // ignore
  }
}

/**
 * AsyncStorage maps to localStorage on web and the native key-value store on
 * iOS/Android, so a single implementation persists everywhere.
 */
export async function loadProfile(): Promise<Profile | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Profile>;
    if (typeof parsed?.name !== 'string') return null;
    return {
      name: parsed.name.slice(0, NAME_MAX_LENGTH),
      settings: sanitize(parsed.settings),
    };
  } catch {
    return null;
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // best-effort; a storage failure shouldn't crash the workout
  }
}

export async function clearProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/**
 * Wipe everything we persist — the saved profile (name + settings) and the
 * intro-seen flag — so the next launch behaves like a fresh install.
 */
export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([KEY, INTRO_KEY]);
  } catch {
    // ignore
  }
}

function sanitize(s?: Partial<WorkoutSettings>): WorkoutSettings {
  const clamp = (v: unknown, min: number, max: number, dflt: number) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : dflt;
  };
  return {
    laps: clamp(s?.laps, LIMITS.laps.min, LIMITS.laps.max, DEFAULT_SETTINGS.laps),
    intervalSecs: clamp(
      s?.intervalSecs,
      LIMITS.intervalSecs.min,
      LIMITS.intervalSecs.max,
      DEFAULT_SETTINGS.intervalSecs
    ),
    exerciseSecs: clamp(
      s?.exerciseSecs,
      LIMITS.exerciseSecs.min,
      LIMITS.exerciseSecs.max,
      DEFAULT_SETTINGS.exerciseSecs
    ),
    cueMode: s?.cueMode === 'voice' ? 'voice' : 'beep',
  };
}
