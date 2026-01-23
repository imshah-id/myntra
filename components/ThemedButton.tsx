import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";

export type ThemedButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
};

export function ThemedButton({
  title,
  variant = "primary",
  loading = false,
  style,
  disabled,
  ...rest
}: ThemedButtonProps) {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.icon; // Using icon color as disabled placeholder
    switch (variant) {
      case "primary":
        return theme.tint;
      case "secondary":
        return theme.surface;
      case "outline":
        return "transparent";
      default:
        return theme.tint;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.background;
    switch (variant) {
      case "primary":
        return theme.background; // Usually white or dark gray depending on contrast
      case "secondary":
        return theme.text;
      case "outline":
        return theme.text;
      default:
        return theme.background;
    }
  };

  const getBorderColor = () => {
    if (variant === "outline") return theme.border;
    return "transparent";
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === "outline" ? 1 : 0,
        },
        style,
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
