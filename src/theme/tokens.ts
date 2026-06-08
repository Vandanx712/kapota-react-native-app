import { Platform } from "react-native";

const preferredPrimaryFont = "Plus Jakarta Sans";
const preferredSecondaryFont = "Inter";

export const fonts = {
  primary: preferredPrimaryFont,
  secondary: preferredSecondaryFont,
  fallback: Platform.select({
    android: "sans-serif",
    ios: "System",
    default: "System",
  }),
} as const;

export const darkColors = {
  surface: "#051424",
  surfaceDim: "#051424",
  surfaceBright: "#2C3A4C",
  surfaceContainerLowest: "#010F1F",
  surfaceContainerLow: "#0D1C2D",
  surfaceContainer: "#122131",
  surfaceContainerHigh: "#1C2B3C",
  surfaceContainerHighest: "#273647",
  onSurface: "#D4E4FA",
  onSurfaceVariant: "#C8C4D7",
  inverseSurface: "#D4E4FA",
  inverseOnSurface: "#233143",
  outline: "#928EA0",
  outlineVariant: "#474554",
  surfaceTint: "#C6BFFF",
  primary: "#C6BFFF",
  onPrimary: "#2800A0",
  primaryContainer: "#8C80FF",
  onPrimaryContainer: "#22008D",
  inversePrimary: "#5845D9",
  secondary: "#CEBDFF",
  onSecondary: "#381385",
  secondaryContainer: "#4F319C",
  onSecondaryContainer: "#BEA8FF",
  tertiary: "#FFB2BB",
  onTertiary: "#670122",
  tertiaryContainer: "#E7677D",
  onTertiaryContainer: "#5A001C",
  error: "#FFB4AB",
  onError: "#690005",
  errorContainer: "#93000A",
  onErrorContainer: "#FFDAD6",
  background: "#051424",
  onBackground: "#D4E4FA",
  surfaceVariant: "#273647",
  accent: "#FF7A90",
  highlight: "#FFC857",
  success: "#2DD4BF",
  text: "#D4E4FA",
  mutedText: "#928EA0",
} as const;

export const lightColors = {
  surface: "#FFFFFF",
  surfaceDim: "#F0EFEC",
  surfaceBright: "#FFFFFF",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#F8F7F4",
  surfaceContainer: "#F1F0FA",
  surfaceContainerHigh: "#E9E7F6",
  surfaceContainerHighest: "#E1DFF1",
  onSurface: "#1A1A1A",
  onSurfaceVariant: "#6B7280",
  inverseSurface: "#233143",
  inverseOnSurface: "#F8FAFC",
  outline: "#7D778F",
  outlineVariant: "#D8D4E8",
  surfaceTint: "#5B4CF0",
  primary: "#5B4CF0",
  onPrimary: "#FFFFFF",
  primaryContainer: "#E4DFFF",
  onPrimaryContainer: "#22008D",
  inversePrimary: "#7C6CFF",
  secondary: "#8B5CF6",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#E8DDFF",
  onSecondaryContainer: "#21005E",
  tertiary: "#FF6B6B",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#FFD9DD",
  onTertiaryContainer: "#5A001C",
  error: "#BA1A1A",
  onError: "#FFFFFF",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#410002",
  background: "#F8F7F4",
  onBackground: "#1A1A1A",
  surfaceVariant: "#ECE8FF",
  accent: "#FF6B6B",
  highlight: "#FFB84D",
  success: "#2DD4BF",
  text: "#1A1A1A",
  mutedText: "#6B7280",
} as const;

export const themes = {
  light: {
    mode: "light",
    colors: lightColors,
  },
  dark: {
    mode: "dark",
    colors: darkColors,
  },
} as const;

export const colors = darkColors;

export const typography = {
  displayLg: {
    fontFamily: fonts.fallback,
    fontSize: 48,
    fontWeight: "700",
    lineHeight: 56,
    letterSpacing: 0,
  },
  headlineLg: {
    fontFamily: fonts.fallback,
    fontSize: 32,
    fontWeight: "600",
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineLgMobile: {
    fontFamily: fonts.fallback,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 32,
    letterSpacing: 0,
  },
  titleMd: {
    fontFamily: fonts.fallback,
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
    letterSpacing: 0,
  },
  bodyLg: {
    fontFamily: fonts.fallback,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodySm: {
    fontFamily: fonts.fallback,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    letterSpacing: 0,
  },
  labelMd: {
    fontFamily: fonts.fallback,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
    letterSpacing: 0.6,
  },
} as const;

export const spacing = {
  unit: 4,
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  gutter: 24,
  marginMobile: 16,
  marginDesktop: 40,
} as const;

export const radius = {
  sm: 4,
  default: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const componentTypography = {
  splashWordmark: {
    ...typography.displayLg,
    fontSize: 58,
    fontWeight: "800",
    lineHeight: 66,
  },
  splashTagline: {
    ...typography.labelMd,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: 7,
  },
  splashStatus: {
    ...typography.bodySm,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 28,
    letterSpacing: 1.4,
  },
} as const;

export const splash = {
  background: {
    top: "#071225",
    middle: "#111A32",
    lower: "#071424",
    bottom: "#031322",
  },
  glow: {
    primary: darkColors.primaryContainer,
    secondary: "#5A4E8D",
    base: darkColors.background,
  },
  logoShadow: darkColors.primaryContainer,
  progressTrack: "rgba(162, 166, 210, 0.52)",
  statusText: "rgba(156, 148, 181, 0.58)",
  tagline: "#9C96BE",
  wordmark: "#D8D3F2",
} as const;

export const elevation = {
  level0: {
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  level1: {
    shadowColor: "rgba(11, 16, 32, 0.4)",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  level2: {
    shadowColor: "rgba(91, 76, 240, 0.34)",
    shadowOpacity: 0.24,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  level3: {
    shadowColor: "rgba(11, 16, 32, 0.48)",
    shadowOpacity: 0.32,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
} as const;

export const design = {
  componentTypography,
  colors,
  darkColors,
  elevation,
  fonts,
  lightColors,
  radius,
  spacing,
  splash,
  themes,
  typography,
} as const;
