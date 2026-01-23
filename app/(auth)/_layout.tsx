import { Stack } from "expo-router";
import React from "react";
import { useTheme } from "@/hooks/useTheme";

export default function AuthLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: "bold" },
      }}
    />
  );
}
