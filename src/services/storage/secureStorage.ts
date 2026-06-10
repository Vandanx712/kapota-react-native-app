import * as SecureStore from "expo-secure-store";

const TOKEN = "token";
const THEME = "theme";
const DEVICEID = "trustedDeviceId"

export const secureStorage = {
  setToken: (token: string) => SecureStore.setItemAsync(TOKEN, token),
  getToken: () => SecureStore.getItemAsync(TOKEN),
  deleteToken: () => SecureStore.deleteItemAsync(TOKEN),

  setDeviceId:(id:string)=> SecureStore.setItemAsync(DEVICEID,id.toString()),
  getDeviceId:()=>SecureStore.getItemAsync(DEVICEID),
  deleteDeviceId:()=>SecureStore.deleteItemAsync(DEVICEID), 

  setTheme: (theme: string) => SecureStore.setItemAsync(THEME, theme),
  getTheme: () => SecureStore.getItemAsync(THEME),
  deleteTheme: () => SecureStore.deleteItemAsync(THEME),
};
