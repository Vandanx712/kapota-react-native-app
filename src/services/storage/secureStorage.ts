import * as SecureStore from "expo-secure-store";

const TOKEN = "token";
const THEME = "theme";

export const secureStorage = {
  setToken: (token: string) => SecureStore.setItemAsync(TOKEN, token),
  getToken: () => SecureStore.getItemAsync(TOKEN),
  deleteToken: () => SecureStore.deleteItemAsync(TOKEN),

  setTheme: (theme: string) => SecureStore.setItemAsync(THEME, theme),
  getTheme: () => SecureStore.getItemAsync(THEME),
  deleteTheme: () => SecureStore.deleteItemAsync(THEME),
};
