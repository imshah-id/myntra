import { Link, Stack } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedButton } from "@/components/ThemedButton";
import { AlertTriangle } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";

export default function NotFoundScreen() {
  const { theme } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemedView style={styles.container}>
        <AlertTriangle size={64} color={theme.primary} style={styles.icon} />

        <ThemedText type="title" style={styles.title}>
          Page Not Found
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          The page you’re looking for doesn’t exist or has been moved.
        </ThemedText>

        <Link href="/" asChild>
          <ThemedButton title="Go to Home" onPress={() => {}} />
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: 32,
    textAlign: "center",
    opacity: 0.7,
  },
});
