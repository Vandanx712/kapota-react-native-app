import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import type { Theme, ThemeMode } from "../types/theme";
import {
  componentTypography,
  elevation,
  fonts,
  radius,
  spacing,
  splash,
  themes,
  typography,
} from "./tokens";

interface ThemeContextValue {
  theme: Theme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(
    system === "light" ? "light" : "dark",
  );

  const value = useMemo<ThemeContextValue>(() => {
    const theme = {
      mode,
      colors: themes[mode].colors,
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
      setMode,
      toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
    };
  }, [mode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
