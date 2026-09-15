import * as SecureStore from "expo-secure-store";
import { appStorage } from "./appStorage";

const TOKEN = "token";
const DEVICEID = "trustedDeviceId";
                                                                                               
let cachedToken: string | null = null;
let cachedDeviceId: string | null = null;

export const secureStorage = {
  setToken: async (token: string) => {
    cachedToken = token;                                                                                                                        
    await SecureStore.setItemAsync(TOKEN, token);
  },

  getToken: async () => {                                                                              
    if (cachedToken) return cachedToken;
    const token = await SecureStore.getItemAsync(TOKEN);
    cachedToken = token;
    return token;
  },

  getTokenSync: () => cachedToken,

  deleteToken: async () => {
    cachedToken = null;                                                                                                       
    await SecureStore.deleteItemAsync(TOKEN);
  },

  setDeviceId: async (id: string) => {
    const stringId = id.toString();
    cachedDeviceId = stringId;                                                                                                              
    await SecureStore.setItemAsync(DEVICEID, stringId);
  },

  getDeviceId: async () => {
    if (cachedDeviceId) return cachedDeviceId;
    const id = await SecureStore.getItemAsync(DEVICEID);
    cachedDeviceId = id;
    return id;
  },

  getDeviceIdSync: () => cachedDeviceId,

  deleteDeviceId: async () => {
    cachedDeviceId = null;
    await SecureStore.deleteItemAsync(DEVICEID);
  },

  setTheme: (theme: string) => {
    appStorage.setTheme(theme);
    return Promise.resolve();
  },
  getTheme: () => Promise.resolve(appStorage.getTheme()),
  getThemeSync: () => appStorage.getTheme(),
  deleteTheme: () => {
    appStorage.deleteTheme();
    return Promise.resolve();
  },

  setSuggestedPlaces: (places: unknown) => {
    appStorage.setSuggestedPlaces(places);
    return Promise.resolve();
  },

  getSuggestedPlaces: async <T = unknown>(): Promise<T | null> => {
    return appStorage.getSuggestedPlaces<T>();
  },
  getSuggestedPlacesSync: <T = unknown>(): T | null => {
    return appStorage.getSuggestedPlaces<T>();
  },
  deleteSuggestedPlaces: () => {
    appStorage.deleteSuggestedPlaces();
    return Promise.resolve();
  },

  warmupTokenCache: async () => {
    const [token, deviceId] = await Promise.all([
      SecureStore.getItemAsync(TOKEN),
      SecureStore.getItemAsync(DEVICEID),
    ]);
    cachedToken = token;
    cachedDeviceId = deviceId;
  },
};