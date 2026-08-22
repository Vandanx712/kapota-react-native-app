import { themeNames, themePalettes } from "@/theme/tokens";
import type { ThemeName } from "@/types/theme";
import type { ChatThemePalette, HelpTopic, SettingsItem } from "../types/settings.types";

export const SUPPORT_EMAIL = "support@kapota.app";
export const APP_VERSION = "v1.0.0";

export const SETTINGS_ITEMS: SettingsItem[] = [
  {
    id: "account",
    label: "Account",
    description: "Security, devices, and account controls",
  },
  {
    id: "post",
    label: "Posts",
    description: "Your posts, visibility, and sharing",
  },
  {
    id: "chats",
    label: "Chats",
    description: "Theme and conversation settings",
  },
  {
    id: "help",
    label: "Help and feedback",
    description: "Support, privacy, and product feedback",
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

export const CHAT_THEMES = themeNames;
export type ChatThemeName = ThemeName;

export const CHAT_THEME_PALETTES = Object.fromEntries(
  themeNames.map((name) => {
    const palette = themePalettes[name];
    return [
      name,
      {
        incoming: palette.primaryContainer,
        outgoing: palette.surfaceContainerHigh,
        accent: palette.primary,
        background: palette.background,
      },
    ];
  }),
) as Record<ChatThemeName, ChatThemePalette>;

export const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going", isSent: false },
  {
    id: 2,
    content: "I'm doing great! just working on some new features",
    isSent: true,
  },
];
