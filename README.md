# Exercise Timer 💪

A simple, cross-platform interval workout timer. Set your laps, exercise
duration, and rest gap — then follow the countdown with audio cues. One
codebase runs on **iOS, Android, Web, and Desktop** (Expo + React Native).

## Features

- **First-run onboarding** explaining the four steps (re-openable via "How it works").
- Captures **name** + workout **settings** (laps, exercise seconds, rest/interval seconds).
- **Persistent** on-device storage (survives reloads/relaunches).
- **5-second "get ready"** countdown before the first exercise.
- Loops **Exercise → Rest → …** through every lap, with **no trailing rest** on the final lap.
- **Selectable cues — Beeps or Voice** (chosen in Setup, saved per profile):
  - **🔊 Beeps** — a blip on the last 3 seconds of each phase, a distinct tone at each switch, and a finish chime.
  - **🗣️ Voice** — spoken announcements instead ("Exercise, lap 3", "Rest", the 3‑2‑1 count, and "All laps completed"), for fully eyes‑free workouts.
- **Pause / Resume / Stop** mid-workout (resume re-anchors the clock — no time lost).
- **Screen stays awake** during a workout.
- **Responsive** to every viewport — the hero countdown number scales to the device width.
- Installable as a **PWA** (Add to Home Screen / Install app) and works **offline**.

## Run it (development)

```bash
npm install
npm run web        # open in a browser
npm run ios        # iOS simulator (needs Xcode) or Expo Go on device
npm run android    # Android emulator/device or Expo Go
```

`npm start` shows a QR code — scan it with the **Expo Go** app to run on a physical phone instantly.

## Build & distribute

```bash
npm run build:web   # produces an installable PWA in dist/
npm run serve:web   # preview the built PWA locally
```

See **[DISTRIBUTION.md](DISTRIBUTION.md)** for the full matrix (PWA URL, Android `.apk`, iOS/TestFlight, desktop).

## Project structure

```
App.tsx                 # app-level screen state machine + layout shell
src/
  types.ts              # settings, segments, buildSegments()
  storage.ts            # AsyncStorage persistence (profile + intro flag)
  useTimer.ts           # drift-free timer engine (pause/resume, cue events)
  cues.ts               # cue layer that switches between beeps and voice
  beep.ts               # bundled audio tones (expo-audio)
  theme.ts, ui.tsx      # colors/spacing + shared Button/NumberField/Card
  screens/              # Intro, Name, Setup, Ready, Running
assets/                 # app icons, splash, PWA icons, beep .wav files
web/                    # PWA manifest + service worker (injected into dist/)
scripts/pwa-postbuild.mjs   # turns `expo export` output into an installable PWA
```

## Cues: Beeps vs Voice

Pick one in **Setup → Cues**; the choice is saved with your profile and shown on
the Ready screen.

| Cue point | 🔊 Beeps | 🗣️ Voice |
|---|---|---|
| Last 3 seconds of a phase | short blip each second | spoken "3", "2", "1" |
| Exercise starts | high "go" tone | "Exercise" (+ lap number) |
| Rest starts | low tone | "Rest" |
| Workout finished | finish chime | "All laps completed. Great work!" |

- **Beeps** are bundled `.wav` tones played via `expo-audio`.
- **Voice** uses `expo-speech` — the **Web Speech API** in browsers and the
  **native text‑to‑speech** engine on iOS/Android, so it needs no network and
  works on every platform. If a device has no TTS voice available, cues simply
  stay silent (the workout is never interrupted).
- Both modes need one initial user tap (the **Start** button) to unlock audio in
  browsers — which the flow already provides.

## How the timer works

`buildSegments()` flattens a workout into an ordered list:
`getReady(5s)` → for each lap: `exercise` then `rest` (rest omitted after the
last lap). `useTimer` anchors each segment's end to the *previous* segment's
ideal boundary (wall-clock), so drift never accumulates and a throttled
background tab self-corrects on the next tick. React re-renders only when the
displayed second changes (~1×/sec), keeping it light on every device.
