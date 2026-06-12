import { create } from "zustand";
import { AuthState } from "../types/store.types";
import { LoginFormData, SignupFormData } from "../validation/authScreen";
import {
  checkUser,
  loginuser,
  requestSignupOtp,
  verifySignupOtp,
} from "../api/authApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import axios from "axios";
import { router } from "expo-router";
import { secureStorage } from "@/services/storage/secureStorage";
import { VerifySignup } from "../types/auth.types";
import { io } from "socket.io-client";

const throwError = (error: any) => {
  if (axios.isAxiosError(error)) {
    showErrorToast(error.response?.data?.message);
  } else {
    showErrorToast("Something went wrong");
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  token: null,
  trustedDeviceId: null,
  isLoading: false,
  isCheckingAuth: false,

  requestSignupOtp: async (data: SignupFormData) => {
    set({ isLoading: true });
    try {
      const res = await requestSignupOtp(data);
      showSuccessToast(res.message);
    } catch (error) {
      console.log("Request signup error:", error);
      throwError(error);
    } finally {
      set({ isLoading: false });
    }
  },

  verifySignupOtp: async (data: VerifySignup) => {
    set({ isLoading: true });
    try {
      const res = await verifySignupOtp(data);
      set({
        authUser: res.user,
        token: res.token,
        trustedDeviceId: res.trustedDeviceId,
      });
      secureStorage.setToken(res.token);
      secureStorage.setDeviceId(res.trustedDeviceId);
      showSuccessToast(res.message);
      router.replace("/(tabs)/chat");
    } catch (error) {
      throwError(error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (data: LoginFormData) => {
    try {
      set({ isLoading: true });
      const res = await loginuser(data);
      set({
        authUser: res.user,
        token: res.token,
        trustedDeviceId: res.trustedDeviceId,
      });
      secureStorage.setToken(res.token);
      secureStorage.setDeviceId(res.trustedDeviceId);
      get().connectSocket();
      showSuccessToast(res?.message);
      router.replace("/(tabs)/chat");
    } catch (error) {
      console.log("Login error:", error);
      get().disconnectSocket();
      throwError(error);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    secureStorage.deleteToken();
    set({ authUser: null, token: null });
  },

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });

      const data = await checkUser();
      set({ authUser: data.user });
    } catch (error) {
      set({ authUser: null, token: null });
      console.log("Check auth error:", error);
      throwError(error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  connectSocket: () => {
    if (get().socket?.connected) return;

    const token = secureStorage.getToken();

    const socket = io(process.env.EXPO_PUBLIC_API_URL, {
      transports: ["websocket"],
      auth: {
        token,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getonlineusers", (users) => {
      set({ onlineUsers: users });
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) socket.disconnect();
    set({ socket: null });
  },
}));
