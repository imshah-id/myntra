import React, { createContext, useEffect, useState, useContext } from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppTheme, Theme } from "../theme";

type ThemeContextType = {
  theme: Theme;
  colorScheme: "light" | "dark";
  toggleTheme: () => void;
  resetToSystem: () => void; // Optional: verify feature
};

export const ThemeContext = createContext<ThemeContextType>(
  {} as ThemeContextType,
);

const THEME_KEY = "APP_THEME";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const deviceColorScheme = useDeviceColorScheme();
  // userPreference: 'light' | 'dark' | null (null means follow system)
  const [userPreference, setUserPreference] = useState<"light" | "dark" | null>(
    null,
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (storedTheme === "light" || storedTheme === "dark") {
          setUserPreference(storedTheme);
        } else {
          setUserPreference(null);
        }
      } catch (e) {
        console.warn("Failed to load theme preference", e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Active scheme is user preference OR device default
  const activeColorScheme = userPreference ?? deviceColorScheme ?? "light";

  const toggleTheme = async () => {
    const nextScheme = activeColorScheme === "dark" ? "light" : "dark";
    setUserPreference(nextScheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, nextScheme);
    } catch (e) {
      console.warn("Failed to save theme preference", e);
    }
  };

  const resetToSystem = async () => {
    setUserPreference(null);
    try {
      await AsyncStorage.removeItem(THEME_KEY);
    } catch (e) {
      console.warn("Failed to reset theme", e);
    }
  };

  const theme = AppTheme[activeColorScheme];

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorScheme: activeColorScheme,
        toggleTheme,
        resetToSystem,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
