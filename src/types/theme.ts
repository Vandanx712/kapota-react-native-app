import type {
  darkColors,
  elevation,
  fonts,
  radius,
  componentTypography,
  spacing,
  splash,
  typography,
} from "@/theme/tokens";

export type ThemeMode = "light" | "dark";

export type ThemeColors = typeof darkColors;

export type Theme = {
  mode: ThemeMode;
  colors: ThemeColors;
  componentTypography: typeof componentTypography;
  elevation: typeof elevation;
  fonts: typeof fonts;
  radius: typeof radius;
  spacing: typeof spacing;
  splash: typeof splash;
  typography: typeof typography;
};
