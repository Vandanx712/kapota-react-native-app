import type { ChatThemePalette, HelpTopic, SettingsItem } from "../types/settings.types";

export const SUPPORT_EMAIL = "support@kapota.app";
export const APP_VERSION = "v1.0.0";

export const SETTINGS_ITEMS: SettingsItem[] = [
  {
    id: "account",
    label: "Account",
    description: "Security notifications, account info",
  },
  {
    id: "post",
    label: "Post",
    description: "See posts, post setting",
  },
  {
    id: "chats",
    label: "Chats",
    description: "Theme, wallpaper, chat settings",
  },
  {
    id: "help",
    label: "Help and feedback",
    description: "Help centre, contact us, privacy policy",
  },
];

export const HELP_TOPICS: HelpTopic[] = [
  {
    title: "Account and profile",
    description: "Profile photo, bio, password help, and account controls.",
  },
  {
    title: "Chats and groups",
    description: "Theme, media, group actions, and conversation settings.",
  },
  {
    title: "Posts and sharing",
    description: "Explore feed, post settings, likes, shares, and archive help.",
  },
];

export const CHAT_THEMES = [
  "default",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
] as const;

export type ChatThemeName = (typeof CHAT_THEMES)[number];

export const CHAT_THEME_PALETTES: Record<ChatThemeName, ChatThemePalette> = {
  default: {
    incoming: "#8C80FF",
    outgoing: "#1C2B3C",
    accent: "#C6BFFF",
    background: "#051424",
  },
  dark: {
    incoming: "#5845D9",
    outgoing: "#122131",
    accent: "#7C6CFF",
    background: "#010F1F",
  },
  cupcake: {
    incoming: "#F472B6",
    outgoing: "#FDF2F8",
    accent: "#EC4899",
    background: "#FFF1F2",
  },
  bumblebee: {
    incoming: "#FBBF24",
    outgoing: "#FEF3C7",
    accent: "#F59E0B",
    background: "#FFFBEB",
  },
  emerald: {
    incoming: "#10B981",
    outgoing: "#D1FAE5",
    accent: "#059669",
    background: "#ECFDF5",
  },
  corporate: {
    incoming: "#3B82F6",
    outgoing: "#DBEAFE",
    accent: "#2563EB",
    background: "#EFF6FF",
  },
  synthwave: {
    incoming: "#E879F9",
    outgoing: "#312E81",
    accent: "#C026D3",
    background: "#1E1B4B",
  },
  retro: {
    incoming: "#EF4444",
    outgoing: "#FECACA",
    accent: "#DC2626",
    background: "#FEF2F2",
  },
  cyberpunk: {
    incoming: "#FACC15",
    outgoing: "#1F2937",
    accent: "#EAB308",
    background: "#111827",
  },
  valentine: {
    incoming: "#FB7185",
    outgoing: "#FFE4E6",
    accent: "#F43F5E",
    background: "#FFF1F2",
  },
  halloween: {
    incoming: "#F97316",
    outgoing: "#292524",
    accent: "#EA580C",
    background: "#1C1917",
  },
  garden: {
    incoming: "#4ADE80",
    outgoing: "#DCFCE7",
    accent: "#22C55E",
    background: "#F0FDF4",
  },
  forest: {
    incoming: "#16A34A",
    outgoing: "#14532D",
    accent: "#15803D",
    background: "#052E16",
  },
  aqua: {
    incoming: "#22D3EE",
    outgoing: "#CFFAFE",
    accent: "#06B6D4",
    background: "#ECFEFF",
  },
  lofi: {
    incoming: "#A78BFA",
    outgoing: "#EDE9FE",
    accent: "#8B5CF6",
    background: "#F5F3FF",
  },
  pastel: {
    incoming: "#FDA4AF",
    outgoing: "#FFE4E6",
    accent: "#FB7185",
    background: "#FFF7ED",
  },
  fantasy: {
    incoming: "#C084FC",
    outgoing: "#F3E8FF",
    accent: "#A855F7",
    background: "#FAF5FF",
  },
  wireframe: {
    incoming: "#6B7280",
    outgoing: "#F3F4F6",
    accent: "#4B5563",
    background: "#FFFFFF",
  },
  black: {
    incoming: "#FFFFFF",
    outgoing: "#262626",
    accent: "#D4D4D4",
    background: "#000000",
  },
  luxury: {
    incoming: "#D4AF37",
    outgoing: "#1C1917",
    accent: "#B8860B",
    background: "#0C0A09",
  },
  dracula: {
    incoming: "#BD93F9",
    outgoing: "#44475A",
    accent: "#FF79C6",
    background: "#282A36",
  },
  cmyk: {
    incoming: "#0891B2",
    outgoing: "#E0F2FE",
    accent: "#0E7490",
    background: "#F0F9FF",
  },
  autumn: {
    incoming: "#EA580C",
    outgoing: "#FFEDD5",
    accent: "#C2410C",
    background: "#FFF7ED",
  },
  business: {
    incoming: "#1D4ED8",
    outgoing: "#DBEAFE",
    accent: "#1E40AF",
    background: "#EFF6FF",
  },
  acid: {
    incoming: "#A3E635",
    outgoing: "#1A2E05",
    accent: "#84CC16",
    background: "#14532D",
  },
  lemonade: {
    incoming: "#FDE047",
    outgoing: "#FEF9C3",
    accent: "#EAB308",
    background: "#FEFCE8",
  },
  night: {
    incoming: "#6366F1",
    outgoing: "#1E1B4B",
    accent: "#4F46E5",
    background: "#0F172A",
  },
  coffee: {
    incoming: "#A16207",
    outgoing: "#FEF3C7",
    accent: "#854D0E",
    background: "#FFFBEB",
  },
  winter: {
    incoming: "#38BDF8",
    outgoing: "#E0F2FE",
    accent: "#0EA5E9",
    background: "#F0F9FF",
  },
};

export const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going", isSent: false },
  {
    id: 2,
    content: "I'm doing great! just working on some new features",
    isSent: true,
  },
];
