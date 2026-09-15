import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { appStorage } from "@/services/storage/appStorage";
import type { Theme, ThemeName } from "../types/theme";
import {
  componentTypography,
  elevation,
  fonts,
  radius,
  spacing,
  splash,
  themeNames,
  themes,
  typography,
} from "./tokens";

interface ThemeContextValue {
  isHydrated: boolean;
  theme: Theme;
  themeName: ThemeName;
  availableThemes: readonly ThemeName[];
  setTheme: (name: ThemeName) => Promise<void>;
  setMode: (name: ThemeName) => Promise<void>;
  toggle: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeName(value: string | null): value is ThemeName {
  return Boolean(value && themeNames.includes(value as ThemeName));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const stored = appStorage.getTheme();
    return isThemeName(stored) ? stored : "default";
  });
  const [isHydrated] = useState(true);

  const setTheme = useCallback(async (name: ThemeName) => {
    setThemeName(name);
    appStorage.setTheme(name);
  }, []);

  const toggle = useCallback(async () => {
    await setTheme(themeName === "default" ? "dark" : "default");
  }, [setTheme, themeName]);

  const value = useMemo<ThemeContextValue>(() => {
    const selected = themes[themeName];
    const theme = {
      mode: selected.mode,
      name: selected.name,
      colors: selected.colors,
      componentTypography,
      elevation,
      fonts,
      radius,
      spacing,
      splash,
      typography,
    } as Theme;

    return {
      theme,
      themeName,
      availableThemes: themeNames,
      isHydrated,
      setTheme,
      setMode: setTheme,
      toggle,
    };
  }, [isHydrated, setTheme, themeName, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
