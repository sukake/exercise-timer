import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../ui';
import { colors, radius, spacing } from '../theme';

const STEPS: { icon: string; title: string; body: string }[] = [
  {
    icon: '📝',
    title: 'Set it up',
    body: 'Enter your name, then choose your laps, seconds per exercise, and the rest gap between them.',
  },
  {
    icon: '⏱️',
    title: 'Get ready',
    body: 'Tap Start and you get a 5-second countdown to move into position before the first exercise.',
  },
  {
    icon: '🔊',
    title: 'Exercise → Rest → Repeat',
    body: 'Each exercise counts down, then a rest interval, looping through every lap. Beeps cue the last 3 seconds and each switch, so you don’t have to watch the screen.',
  },
  {
    icon: '🎉',
    title: 'Finish & repeat',
    body: 'After the final lap you’ll see “All laps completed!” — tap Restart to go again. Your settings are saved on this device.',
  },
];

export function IntroScreen({
  firstTime,
  onDone,
}: {
  firstTime: boolean;
  onDone: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>💪</Text>
      <Text style={styles.title}>{firstTime ? 'Welcome!' : 'How it works'}</Text>
      <Text style={styles.subtitle}>Your interval workout timer in four steps.</Text>

      <View style={styles.steps}>
        {STEPS.map((s, i) => (
          <View key={i} style={styles.step}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepIcon}>{s.icon}</Text>
            <View style={styles.stepTextWrap}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepBody}>{s.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <Button
        label={firstTime ? "Let's go" : 'Got it'}
        onPress={onDone}
        style={{ width: '100%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 460, gap: spacing.md, alignItems: 'center' },
  emoji: { fontSize: 52 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  steps: { width: '100%', gap: spacing.sm },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.primaryText, fontWeight: '800', fontSize: 14 },
  stepIcon: { fontSize: 26 },
  stepTextWrap: { flex: 1 },
  stepTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  stepBody: { color: colors.textMuted, fontSize: 14, marginTop: 2, lineHeight: 19 },
});
