import { create } from "zustand";
import { appStorage } from "@/services/storage/appStorage";
import {
  CHAT_THEMES,
  type ChatThemeName,
} from "../constants/settings.constants";

interface ThemeState {
  chatTheme: ChatThemeName;
  isHydrated: boolean;
  setChatTheme: (theme: ChatThemeName) => Promise<void>;
  hydrateChatTheme: () => Promise<void>;
}

const getInitialTheme = (): ChatThemeName => {
  const stored = appStorage.getTheme();
  if (stored && CHAT_THEMES.includes(stored as ChatThemeName)) {
    return stored as ChatThemeName;
  }
  return "default";
};

export const useThemeStore = create<ThemeState>((set) => ({
  chatTheme: getInitialTheme(),
  isHydrated: true,

  hydrateChatTheme: async () => {
    const stored = appStorage.getTheme();
    if (stored && CHAT_THEMES.includes(stored as ChatThemeName)) {
      set({ chatTheme: stored as ChatThemeName, isHydrated: true });
      return;
    }
    set({ isHydrated: true });
  },

  setChatTheme: async (theme) => {
    set({ chatTheme: theme });
    appStorage.setTheme(theme);
  },
}));
