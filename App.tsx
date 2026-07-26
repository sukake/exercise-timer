import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors, spacing } from "./src/theme";
import { DEFAULT_SETTINGS, Profile, WorkoutSettings } from "./src/types";
import {
  clearAll,
  loadIntroSeen,
  loadProfile,
  saveIntroSeen,
  saveProfile,
} from "./src/storage";
import { IntroScreen } from "./src/screens/IntroScreen";
import { NameScreen } from "./src/screens/NameScreen";
import { SetupScreen } from "./src/screens/SetupScreen";
import { ReadyScreen } from "./src/screens/ReadyScreen";
import { RunningScreen } from "./src/screens/RunningScreen";

type Screen = "loading" | "intro" | "name" | "setup" | "ready" | "running";

export default function App() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [name, setName] = useState("");
  const [settings, setSettings] = useState<WorkoutSettings>(DEFAULT_SETTINGS);
  const [firstTime, setFirstTime] = useState(true);
  const [justCompleted, setJustCompleted] = useState(false);

  // Restore any saved profile + intro state on launch.
  useEffect(() => {
    (async () => {
      const [p, introSeen] = await Promise.all([
        loadProfile(),
        loadIntroSeen(),
      ]);
      if (p) {
        setName(p.name);
        setSettings(p.settings);
      }
      if (!introSeen) {
        setFirstTime(true);
        setScreen("intro");
      } else {
        setScreen(p ? "ready" : "name");
      }
    })();
  }, []);

  const persist = (next: Profile) => {
    setName(next.name);
    setSettings(next.settings);
    void saveProfile(next);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.stage}>
            {screen === "loading" && (
              <ActivityIndicator color={colors.primary} size="large" />
            )}

            {screen === "intro" && (
              <IntroScreen
                firstTime={firstTime}
                onDone={() => {
                  if (firstTime) {
                    void saveIntroSeen();
                    setScreen(name ? "ready" : "name");
                  } else {
                    setScreen("ready");
                  }
                }}
              />
            )}

            {screen === "name" && (
              <NameScreen
                initial={name}
                onSubmit={(n) => {
                  persist({ name: n, settings });
                  setScreen("setup");
                }}
              />
            )}

            {screen === "setup" && (
              <SetupScreen
                name={name}
                initial={settings}
                onBack={() => setScreen(name ? "ready" : "name")}
                onDone={(s) => {
                  persist({ name, settings: s });
                  setScreen("ready");
                }}
              />
            )}

            {screen === "ready" && (
              <ReadyScreen
                name={name}
                settings={settings}
                justCompleted={justCompleted}
                onEdit={() => {
                  setJustCompleted(false);
                  setScreen("setup");
                }}
                onStart={() => {
                  setJustCompleted(false);
                  setScreen("running");
                }}
                onHelp={() => {
                  setJustCompleted(false);
                  setFirstTime(false);
                  setScreen("intro");
                }}
                onReset={() => {
                  void clearAll();
                  setName("");
                  setSettings(DEFAULT_SETTINGS);
                  setJustCompleted(false);
                  setFirstTime(true);
                  setScreen("intro");
                }}
              />
            )}

            {screen === "running" && (
              <RunningScreen
                settings={settings}
                onExit={() => setScreen("ready")}
                onFinished={() => {
                  setJustCompleted(true);
                  setScreen("ready");
                }}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  stage: {
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
});
