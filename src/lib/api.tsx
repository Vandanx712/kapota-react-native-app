import { secureStorage } from "@/services/storage/secureStorage";
import axios, { isAxiosError } from "axios";

// eslint-disable-next-line import/no-named-as-default-member
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

let onUnauthorizedCallback: (() => Promise<void> | void) | null = null;

export const setOnUnauthorizedCallback = (
  callback: () => Promise<void> | void,
) => {
  onUnauthorizedCallback = callback;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      const isAuthCheck = error.config?.url?.includes("/auth/check");
      if (!isAuthCheck && onUnauthorizedCallback) {
        try {
          await onUnauthorizedCallback();
        } catch {
          // Ignore secondary logout errors
        }
      }
    }
    return Promise.reject(error);
  },
);