import React, { createContext, useEffect, useState, useContext } from "react";
import {
  Appearance,
  ColorSchemeName,
  useColorScheme as useDeviceColorScheme,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppTheme, Theme } from "../theme";

type ThemeContextType = {
  theme: Theme;
  colorScheme: "light" | "dark";
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>(
  {} as ThemeContextType,
);

const THEME_KEY = "APP_THEME";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [colorScheme, setColorScheme] = useState<"light" | "dark">(
    deviceColorScheme === "dark" ? "dark" : "light",
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (storedTheme === "light" || storedTheme === "dark") {
          setColorScheme(storedTheme);
        } else if (deviceColorScheme) {
          // If no stored preference, align with device
          setColorScheme(deviceColorScheme);
        }
      } catch (e) {
        console.warn("Failed to load theme preference", e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const nextScheme = colorScheme === "dark" ? "light" : "dark";
    setColorScheme(nextScheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, nextScheme);
    } catch (e) {
      console.warn("Failed to save theme preference", e);
    }
  };

  const theme = AppTheme[colorScheme];

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
