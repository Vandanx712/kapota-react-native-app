import { create } from "zustand";
import { secureStorage } from "@/services/storage/secureStorage";
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

export const useThemeStore = create<ThemeState>((set, get) => ({
  chatTheme: "default",
  isHydrated: false,

  hydrateChatTheme: async () => {
    const stored = await secureStorage.getTheme();
    if (stored && CHAT_THEMES.includes(stored as ChatThemeName)) {
      set({ chatTheme: stored as ChatThemeName, isHydrated: true });
      return;
    }
    set({ isHydrated: true });
  },

  setChatTheme: async (theme) => {
    set({ chatTheme: theme });
    await secureStorage.setTheme(theme);
  },
}));
