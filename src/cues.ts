import * as Speech from 'expo-speech';
import { initBeeps, playBeep } from './beep';
import { CueMode, PhaseKind } from './types';

/**
 * A single cue layer that plays either audio beeps or spoken announcements,
 * chosen by the user's cueMode setting. Speech uses expo-speech (Web Speech
 * API on web, native TTS on iOS/Android) so it works on every platform.
 */

const phaseWord: Record<PhaseKind, string> = {
  getReady: 'Get ready',
  exercise: 'Go',
  rest: 'Rest',
};

export async function initCues(mode: CueMode): Promise<void> {
  // Priming audio also unlocks web playback from the Start-tap gesture; harmless
  // in voice mode and lets the user switch modes without another gesture.
  await initBeeps();
  if (mode === 'voice') {
    // A near-silent warm-up so the first real announcement has no cold-start lag.
    speak(' ');
  }
}

export function cuePhaseStart(mode: CueMode, kind: PhaseKind, lap?: number): void {
  if (mode === 'voice') {
    const text =
      kind === 'exercise' ? (lap ? `Exercise, lap ${lap}` : 'Exercise') : phaseWord[kind];
    speak(text);
    return;
  }
  if (kind === 'exercise') playBeep('go');
  else if (kind === 'rest') playBeep('rest');
  // getReady in beep mode stays silent until the 3-2-1 ticks.
}

export function cueCountdown(mode: CueMode, n: number): void {
  if (mode === 'voice') speak(String(n));
  else playBeep('tick');
}

export function cueComplete(mode: CueMode): void {
  if (mode === 'voice') speak('All laps completed. Great work!');
  else playBeep('done');
}

function speak(text: string): void {
  try {
    Speech.stop(); // interrupt any still-playing line so cues stay in sync
    Speech.speak(text, { rate: 1.0, pitch: 1.0 });
  } catch {
    // TTS unavailable — fail silently rather than break the workout
  }
}
