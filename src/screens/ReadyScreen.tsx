import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Card, Logo } from "../ui";
import { colors, radius, spacing } from "../theme";
import { WorkoutSettings } from "../types";

export function ReadyScreen({
  name,
  settings,
  justCompleted,
  onStart,
  onEdit,
  onHelp,
  onReset,
}: {
  name: string;
  settings: WorkoutSettings;
  justCompleted?: boolean;
  onStart: () => void;
  onEdit: () => void;
  onHelp: () => void;
  onReset: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <View style={styles.wrap}>
      <Logo size={64} />
      {justCompleted && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            🎉 All laps completed! Great work, {name}.
          </Text>
        </View>
      )}
      <Text style={styles.title}>
        {justCompleted ? "Go again?" : `Ready, ${name}?`}
      </Text>
      <Card>
        <Row label="Laps" value={`${settings.laps}`} />
        <Row label="Exercise" value={`${settings.exerciseSecs}s each`} />
        <Row label="Rest between" value={`${settings.intervalSecs}s`} />
        <Row
          label="Cues"
          value={settings.cueMode === "voice" ? "🗣️ Voice" : "🔊 Beeps"}
        />
      </Card>
      <Text style={styles.hint}>
        You'll get a 5-second countdown to get into position.
      </Text>
      <Button label="▶  Start" onPress={onStart} style={{ width: "100%" }} />
      <Button
        label="Edit settings"
        variant="ghost"
        onPress={onEdit}
        style={{ width: "100%" }}
      />
      <View style={styles.linkRow}>
        <Text style={styles.help} onPress={onHelp}>
          How it works
        </Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.reset} onPress={() => setConfirmReset(true)}>
          Reset
        </Text>
      </View>

      <Modal
        visible={confirmReset}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmReset(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setConfirmReset(false)}
        >
          <Pressable style={styles.dialog} onPress={() => {}}>
            <Text style={styles.dialogTitle}>Reset app?</Text>
            <Text style={styles.dialogBody}>
              This clears your name and all workout settings, then returns to
              the initial setup. This can't be undone.
            </Text>
            <Button
              label="Reset everything"
              color={colors.danger}
              onPress={() => {
                setConfirmReset(false);
                onReset();
              }}
              style={{ width: "100%" }}
            />
            <Button
              label="Cancel"
              variant="ghost"
              onPress={() => setConfirmReset(false)}
              style={{ width: "100%" }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", maxWidth: 420, gap: spacing.md, alignItems: "center" },
  title: { color: colors.text, fontSize: 28, fontWeight: "800" },
  banner: {
    width: "100%",
    backgroundColor: "rgba(168,85,247,0.15)",
    borderColor: colors.done,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  bannerText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  hint: { color: colors.textMuted, fontSize: 14, textAlign: "center" },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  dot: { color: colors.textMuted, fontSize: 15, paddingHorizontal: spacing.xs },
  help: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
    padding: spacing.sm,
  },
  reset: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: "600",
    padding: spacing.sm,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  dialog: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  dialogTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
  dialogBody: { color: colors.textMuted, fontSize: 15, lineHeight: 21 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: { color: colors.textMuted, fontSize: 16 },
  rowValue: { color: colors.text, fontSize: 18, fontWeight: "700" },
});
