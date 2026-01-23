import { LightTheme } from "./light";
import { DarkTheme } from "./dark";

export type Theme = typeof LightTheme;

export const AppTheme = {
  light: LightTheme,
  dark: DarkTheme,
};
