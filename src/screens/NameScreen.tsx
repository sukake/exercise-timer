import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../ui';
import { colors, radius, spacing } from '../theme';
import { NAME_MAX_LENGTH } from '../types';

export function NameScreen({
  initial,
  onSubmit,
}: {
  initial: string;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState(initial);
  const trimmed = name.trim();

  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>💪</Text>
      <Text style={styles.title}>Exercise Timer</Text>
      <Text style={styles.subtitle}>What should we call you?</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="words"
        maxLength={NAME_MAX_LENGTH}
        returnKeyType="done"
        onSubmitEditing={() => trimmed && onSubmit(trimmed)}
      />
      <Text style={styles.counter}>
        {name.length}/{NAME_MAX_LENGTH}
      </Text>
      <Button
        label="Continue"
        onPress={() => trimmed && onSubmit(trimmed)}
        style={{ opacity: trimmed ? 1 : 0.4, width: '100%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 420, gap: spacing.md, alignItems: 'center' },
  emoji: { fontSize: 56 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 16, marginBottom: spacing.sm },
  input: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 18,
    padding: spacing.md,
    textAlign: 'center',
  },
  counter: {
    color: colors.textMuted,
    fontSize: 13,
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
  },
});
