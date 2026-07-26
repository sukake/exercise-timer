import React, { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { colors, radius, spacing } from "./theme";

export function Button({
  label,
  onPress,
  variant = "primary",
  color,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost";
  color?: string;
  style?: ViewStyle;
}) {
  const bg = variant === "primary" ? (color ?? colors.primary) : "transparent";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: variant === "ghost" ? colors.border : "transparent",
          borderWidth: variant === "ghost" ? 1 : 0,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.btnLabel,
          { color: variant === "primary" ? colors.primaryText : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min = 1,
  max = 3600,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  // Local text state lets the user type freely; we cap `max` live but only
  // enforce `min` on blur, so a min of 5 doesn't turn "30" into "50" mid-typing.
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  const step = (delta: number) =>
    onChange(Math.min(max, Math.max(min, value + delta)));

  const commit = () => {
    const n = parseInt(text, 10);
    const v = Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
    onChange(v);
    setText(String(v));
  };

  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          onPress={() => step(-1)}
          style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <TextInput
          style={styles.numInput}
          value={text}
          keyboardType="number-pad"
          selectTextOnFocus
          onChangeText={(t) => {
            const digits = t.replace(/[^0-9]/g, "");
            setText(digits);
            const n = parseInt(digits, 10);
            if (Number.isFinite(n)) onChange(Math.min(max, n));
          }}
          onEndEditing={commit}
          onBlur={commit}
        />
        <Pressable
          onPress={() => step(1)}
          style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function SegmentedToggle<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.segment}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.segmentBtn, active && styles.segmentBtnActive]}
            >
              <Text
                style={[styles.segmentText, active && styles.segmentTextActive]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  btnLabel: { fontSize: 18, fontWeight: "700" },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    width: "100%",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  fieldLabel: { color: colors.text, fontSize: 16, flexShrink: 1 },
  stepper: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 24,
  },
  pressed: { opacity: 0.7 },
  numInput: {
    width: 64,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    color: colors.text,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  segment: {
    flexDirection: "row",
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 3,
    gap: 3,
  },
  segmentBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md - 3,
  },
  segmentBtnActive: { backgroundColor: colors.primary },
  segmentText: { color: colors.textMuted, fontSize: 14, fontWeight: "700" },
  segmentTextActive: { color: colors.primaryText },
});
