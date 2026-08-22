import type {
  elevation,
  fonts,
  radius,
  componentTypography,
  spacing,
  splash,
  typography,
  ThemeColorShape,
} from "@/theme/tokens";

export type ThemeName =
  | "default"
  | "dark"
  | "cupcake"
  | "coffee"
  | "luxury"
  | "valentine"
  | "emerald"
  | "corporate"
  | "nord"
  | "sunset";

export type ThemeMode = ThemeName;

export type ThemeColors = ThemeColorShape;

export type Theme = {
  mode: ThemeMode;
  name: ThemeName;
  colors: ThemeColors;
  componentTypography: typeof componentTypography;
  elevation: typeof elevation;
  fonts: typeof fonts;
  radius: typeof radius;
  spacing: typeof spacing;
  splash: typeof splash;
  typography: typeof typography;
};
