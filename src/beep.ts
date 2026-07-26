import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

export type BeepName = 'tick' | 'go' | 'rest' | 'done';

const sources: Record<BeepName, number> = {
  tick: require('../assets/beep.wav'),
  go: require('../assets/beep-go.wav'),
  rest: require('../assets/beep-rest.wav'),
  done: require('../assets/beep-done.wav'),
};

let players: Partial<Record<BeepName, AudioPlayer>> = {};
let initialized = false;

/**
 * Prime the audio players. Call once from a user gesture (e.g. the Start tap)
 * so browsers permit playback and there's no lag on the first cue.
 */
export async function initBeeps(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true, // still cue when the iOS ringer switch is silent
    });
  } catch {
    // non-fatal
  }
  (Object.keys(sources) as BeepName[]).forEach((name) => {
    try {
      players[name] = createAudioPlayer(sources[name]);
    } catch {
      // leave undefined; playBeep will no-op
    }
  });
}

export function playBeep(name: BeepName): void {
  const p = players[name];
  if (!p) return;
  try {
    p.seekTo(0);
    p.play();
  } catch {
    // ignore playback hiccups
  }
}

export function releaseBeeps(): void {
  (Object.values(players) as AudioPlayer[]).forEach((p) => {
    try {
      p?.remove();
    } catch {
      // ignore
    }
  });
  players = {};
  initialized = false;
}
