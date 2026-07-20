import { create } from "zustand";
import { AuthState } from "../types/store.types";
import { LoginFormData, SignupFormData } from "../validation/authScreen";
import {
  checkUser,
  deleteAccount,
  getActiveSessions,
  loginuser,
  logoutOneSession,
  logoutOtherSessions,
  requestForgotPasswordOtp,
  requestSignupOtp,
  updatePic,
  updateProfile,
  verifyForgotPasswordOtp,
  verifySignupOtpRequest,
} from "../api/authApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import axios from "axios";
import { router } from "expo-router";
import { secureStorage } from "@/services/storage/secureStorage";
import {
  DeleteAccount,
  RequestForgotPass,
  VerifyForgotPass,
  VerifySignup,
} from "../types/auth.types";
import { io } from "socket.io-client";
import { useChatSocket } from "@/services/socket/chatSocket";

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
  canManageDevices: false,
  sessionActionId: null,
  activeSessions: [],
  onlineUsers: [],

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
      const res = await verifySignupOtpRequest(data);
      set({
        authUser: res.user,
        token: res.token,
        trustedDeviceId: res.trustedDeviceId,
        canManageDevices: true,
      });
      secureStorage.setToken(res.token);
      secureStorage.setDeviceId(res.trustedDeviceId);
      get().connectSocket();
      showSuccessToast(res.message);
      router.replace("/(tabs)/chat");
    } catch (error) {
      throwError(error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  requestForgotPasswordOtp: async (data: RequestForgotPass) => {
    try {
      set({ isLoading: true });
      const resdata = await requestForgotPasswordOtp(data);
      showSuccessToast(resdata?.message);
    } catch (error) {
      throwError(error);
    } finally {
      set({ isLoading: false });
    }
  },

  verifyForgotPasswordOtp: async (data: VerifyForgotPass) => {
    try {
      set({ isLoading: true });
      const resdata = await verifyForgotPasswordOtp(data);
      showSuccessToast(resdata?.message);
    } catch (error) {
      throwError(error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data: any) => {
    try {
      set({ isLoading: true, isPhotoUploading: true });
      const resdata = await updatePic(data);
      showSuccessToast(resdata?.message);
      set((state) => ({
        authUser: { ...state.authUser, profilePic: resdata.user.profilePic },
      }));
    } catch (error) {
      throwError(error);
    } finally {
      set({ isLoading: false, isPhotoUploading: false });
    }
  },

  updateDetails: async (data) => {
    try {
      set({ isLoading: true });
      const resdata = await updateProfile(data);
      set({ authUser: resdata.user });
      showSuccessToast(resdata?.message);
    } catch (error) {
      throwError(error);
    }
  },

  deleteAccount: async (data: DeleteAccount) => {
    set({ isLoading: true });
    try {
      const resdata = await deleteAccount(data);
      get().disconnectSocket();
      set({ authUser: null, activeSessions: [], canManageDevices: false });
      showSuccessToast(resdata?.message);
    } catch (error) {
      showErrorToast(error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchActiveSessions: async () => {
    set({ isLoading: true });
    try {
      const resdata = await getActiveSessions();
      set({
        activeSessions: resdata.sessions || [],
        canManageDevices: resdata?.canManageDevices,
      });
    } catch (error) {
      throwError(error);
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
        activeSessions: [],
        canManageDevices: false,
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
    set({
      authUser: null,
      token: null,
      activeSessions: [],
      canManageDevices: false,
    });
    get().disconnectSocket();
    showSuccessToast("Logout successfully");
  },

  logoutOneSession: async (sessionId: string) => {
    const targetSession = get().activeSessions.find(
      (session: any) => session._id === sessionId,
    );
    if (targetSession?.isCurrent) {
      await get().logout();
    }
    set({ sessionActionId: sessionId });
    try {
      const resdata = await logoutOneSession(sessionId);
      set((state: any) => ({
        activeSessions: state.activeSessions.filter(
          (session: any) => session._id !== sessionId,
        ),
      }));
      showSuccessToast(resdata?.message);
    } catch (error) {
      throwError(error);
    } finally {
      set({ sessionActionId: "" });
    }
  },

  logoutOtherSessions: async () => {
    try {
      set({ isLoggingOutOthers: true });
      const resdata = await logoutOtherSessions();
      set((state: any) => ({
        activeSessions: state.activeSessions.filter(
          (session: any) => session?.isCurrent,
        ),
      }));
      showSuccessToast(resdata?.message);
    } catch (error) {
      console.log("Logout other session error:", error);
      throwError(error);
    } finally {
      set({ isLoggingOutOthers: false });
    }
  },

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      const data = await checkUser();
      set({ authUser: data.user });
    } catch (error) {
      set({ authUser: null, token: null, canManageDevices: false });
      console.log("Check auth error:", error);
      throwError(error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  connectSocket: async () => {
    if (get().socket?.connected) return;

    const token = await secureStorage.getToken();

    const socket = io(process.env.EXPO_PUBLIC_API_URL, {
      transports: ["websocket"],
      auth: {
        token,
      },
    });
    socket.connect();

    useChatSocket(socket);

    set({ socket: socket });

    socket.on("force-logout", () => {
      get().disconnectSocket();

      set({
        authUser: null,
        onlineUsers: [],
        activeSessions: [],
        canManageDevices: false,
      });
      showErrorToast("You were logged out from this device");
    });

    socket.on("getonlineusers", (users) => {
      set({ onlineUsers: users });
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.removeAllListeners();
      socket.disconnect();
    }
    set({ socket: null });

    secureStorage.deleteToken();
    router.replace("/(auth)/login");
  },
}));
