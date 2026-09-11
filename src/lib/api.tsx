import { secureStorage } from "@/services/storage/secureStorage";
import axios from "axios";

export const api = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});
                                                                                    
api.interceptors.request.use((config) => {
  try {
    const token = secureStorage.getTokenSync();
    const deviceId = secureStorage.getDeviceIdSync();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (deviceId) {
      config.headers["X-Device-Id"] = deviceId;
    }

    return config;
  } catch (err) {
    console.log("Interceptor error:", err);
    return config;
  }
});