import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Logo, NumberField, SegmentedToggle } from '../ui';
import { colors, spacing } from '../theme';
import { LIMITS, WorkoutSettings } from '../types';

export function SetupScreen({
  name,
  initial,
  onDone,
  onBack,
}: {
  name: string;
  initial: WorkoutSettings;
  onDone: (s: WorkoutSettings) => void;
  onBack: () => void;
}) {
  const [s, setS] = useState<WorkoutSettings>(initial);
  const set = (k: keyof WorkoutSettings) => (n: number) =>
    setS((prev) => ({ ...prev, [k]: n }));

  // Enforce minimums on save, in case a field is still mid-edit when tapped.
  const clamp = (v: number, { min, max }: { min: number; max: number }) =>
    Math.min(max, Math.max(min, v));
  const save = () =>
    onDone({
      ...s,
      laps: clamp(s.laps, LIMITS.laps),
      exerciseSecs: clamp(s.exerciseSecs, LIMITS.exerciseSecs),
      intervalSecs: clamp(s.intervalSecs, LIMITS.intervalSecs),
    });

  const totalSecs =
    s.laps * s.exerciseSecs + Math.max(0, s.laps - 1) * s.intervalSecs + 5;
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;

  return (
    <View style={styles.wrap}>
      <Logo size={56} />
      <Text style={styles.hi}>Hi {name} 👋</Text>
      <Text style={styles.title}>Set up your workout</Text>
      <Card>
        <NumberField
          label="Laps"
          value={s.laps}
          onChange={set('laps')}
          min={LIMITS.laps.min}
          max={LIMITS.laps.max}
        />
        <NumberField
          label="Exercise (sec)"
          value={s.exerciseSecs}
          onChange={set('exerciseSecs')}
          min={LIMITS.exerciseSecs.min}
          max={LIMITS.exerciseSecs.max}
        />
        <NumberField
          label="Interval / rest (sec)"
          value={s.intervalSecs}
          onChange={set('intervalSecs')}
          min={LIMITS.intervalSecs.min}
          max={LIMITS.intervalSecs.max}
        />
        <SegmentedToggle
          label="Cues"
          value={s.cueMode}
          onChange={(cueMode) => setS((prev) => ({ ...prev, cueMode }))}
          options={[
            { value: 'beep', label: '🔊 Beeps' },
            { value: 'voice', label: '🗣️ Voice' },
          ]}
        />
      </Card>
      <Text style={styles.total}>
        Total ≈ {mins}m {secs.toString().padStart(2, '0')}s
      </Text>
      <Button label="Save & Continue" onPress={save} style={{ width: '100%' }} />
      <Button label="Back" variant="ghost" onPress={onBack} style={{ width: '100%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 420, gap: spacing.md, alignItems: 'center' },
  hi: { color: colors.textMuted, fontSize: 16 },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: spacing.sm },
  total: { color: colors.textMuted, fontSize: 15 },
});
