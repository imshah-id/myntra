/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useTheme } from "@/context/ThemeContext";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof import("@/theme/light").LightTheme,
) {
  const { theme, colorScheme } = useTheme();
  const colorFromProps = props[colorScheme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return theme[colorName];
  }
}
