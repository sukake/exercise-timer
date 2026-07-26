import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { Button } from '../ui';
import { colors, phaseColor, phaseLabel, radius, spacing } from '../theme';
import { buildSegments, Segment, WorkoutSettings } from '../types';
import { useTimer } from '../useTimer';
import { cueComplete, cueCountdown, cuePhaseStart, initCues } from '../cues';

export function RunningScreen({
  settings,
  onExit,
  onFinished,
}: {
  settings: WorkoutSettings;
  onExit: () => void;
  /** Called once all laps are done, so the app can return to the home screen. */
  onFinished: () => void;
}) {
  // All hooks must run unconditionally and in a stable order on every render —
  // no early returns before this block.
  useKeepAwake(); // don't let the screen sleep mid-workout
  const { width } = useWindowDimensions();

  const segments = useMemo(() => buildSegments(settings), [settings]);
  const cueMode = settings.cueMode;

  const timer = useTimer(segments, {
    onSegmentStart: (seg: Segment) => cuePhaseStart(cueMode, seg.kind, seg.lap),
    onCountdown: (n) => cueCountdown(cueMode, n),
    onComplete: () => {
      cueComplete(cueMode);
      onFinished(); // hand off to the home screen (which shows the finish banner)
    },
  });

  // Auto-start once, right after the Start tap (a valid user gesture for web audio).
  useEffect(() => {
    let mounted = true;
    (async () => {
      await initCues(cueMode);
      if (mounted) timer.start();
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seg = timer.segment;
  const kind = seg?.kind ?? 'getReady';
  const accent = phaseColor[kind];
  const fraction = seg && seg.secs > 0 ? 1 - timer.remaining / seg.secs : 0;
  const nextSeg = segments[timer.index + 1];

  // Scale the hero number to the viewport so it never clips, regardless of
  // device width or how many digits the value has (tabular digit ≈ 0.62em).
  const avail = Math.min(width, 480) - 48;
  const digits = String(timer.remaining).length;
  const bigSize = Math.max(56, Math.min(120, avail / (digits * 0.62)));

  return (
    <View style={styles.wrap}>
      <Text style={styles.lap}>
        {seg?.lap ? `Lap ${seg.lap} of ${settings.laps}` : 'Get into position'}
      </Text>

      <View style={[styles.phaseTag, { backgroundColor: accent }]}>
        <Text style={styles.phaseTagText}>{phaseLabel[kind].toUpperCase()}</Text>
      </View>

      <Text style={[styles.big, { color: accent, fontSize: bigSize, lineHeight: bigSize * 1.1 }]}>
        {timer.remaining}
      </Text>
      <Text style={styles.unit}>seconds</Text>

      <View style={styles.barTrack}>
        <View
          style={[styles.barFill, { width: `${Math.min(100, fraction * 100)}%`, backgroundColor: accent }]}
        />
      </View>

      <Text style={styles.next}>
        {nextSeg
          ? `Next: ${phaseLabel[nextSeg.kind]}${nextSeg.lap ? ` (Lap ${nextSeg.lap})` : ''}`
          : 'Next: Finish 🎉'}
      </Text>

      <View style={styles.controls}>
        {timer.status === 'paused' ? (
          <Button label="Resume" onPress={timer.resume} color={accent} style={{ flex: 1 }} />
        ) : (
          <Button label="Pause" onPress={timer.pause} color={accent} style={{ flex: 1 }} />
        )}
        <Button label="Stop" variant="ghost" onPress={onExit} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 420, gap: spacing.md, alignItems: 'center' },
  lap: { color: colors.textMuted, fontSize: 18, fontWeight: '600' },
  phaseTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  phaseTagText: { color: '#0f172a', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  big: { fontWeight: '900', fontVariant: ['tabular-nums'] },
  unit: { color: colors.textMuted, fontSize: 16, marginTop: -spacing.sm },
  barTrack: {
    width: '100%',
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    overflow: 'hidden',
    marginVertical: spacing.md,
  },
  barFill: { height: '100%', borderRadius: radius.pill },
  next: { color: colors.textMuted, fontSize: 15 },
  controls: { flexDirection: 'row', gap: spacing.md, width: '100%', marginTop: spacing.md },
});
