import * as SecureStore from "expo-secure-store";

const TOKEN = "token";
const THEME = "theme";
const DEVICEID = "trustedDeviceId";
const SUGGESTED_PLACES = "suggested_places";
                                                                                               
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

  setTheme: (theme: string) => SecureStore.setItemAsync(THEME, theme),
  getTheme: () => SecureStore.getItemAsync(THEME),
  deleteTheme: () => SecureStore.deleteItemAsync(THEME),
                                                                                                                                            
  setSuggestedPlaces: (places: unknown) =>
    SecureStore.setItemAsync(SUGGESTED_PLACES, JSON.stringify(places)),

  getSuggestedPlaces: async <T = unknown>(): Promise<T | null> => {
    try {
      const raw = await SecureStore.getItemAsync(SUGGESTED_PLACES);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  deleteSuggestedPlaces: () => SecureStore.deleteItemAsync(SUGGESTED_PLACES),

  warmupTokenCache: async () => {
    const [token, deviceId] = await Promise.all([
      SecureStore.getItemAsync(TOKEN),
      SecureStore.getItemAsync(DEVICEID),
    ]);
    cachedToken = token;
    cachedDeviceId = deviceId;
  },
};