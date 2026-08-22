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
import { isAxiosError } from "axios";
import { router } from "expo-router";
import { secureStorage } from "@/services/storage/secureStorage";
import {
  DeleteAccount,
  RequestForgotPass,
  VerifyForgotPass,
  VerifySignup,
} from "../types/auth.types";
import { io } from "socket.io-client";
import { registerChatSocketListeners } from "@/services/socket/chatSocket";
import { registerAuthSocketSession } from "@/services/socket/authSocketSession";

const throwError = (error: any) => {
  if (isAxiosError(error)) {
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
  socket: null,
  isPhotoUploading: false,
  isDeletingAccount: false,
  isLoggingOutOthers: false,
  isSessionsLoading: false,
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
      set((state) =>
        state.authUser
          ? {
              authUser: {
                ...state.authUser,
                profilePic: resdata.user.profilePic,
              },
            }
          : state,
      );
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
    set({ isDeletingAccount: true, isLoading: true });
    try {
      const resdata = await deleteAccount(data);
      get().disconnectSocket();
      await Promise.all([
        secureStorage.deleteToken(),
        secureStorage.deleteDeviceId(),
      ]);
      set({
        activeSessions: [],
        authUser: null,
        canManageDevices: false,
        token: null,
        trustedDeviceId: null,
      });
      showSuccessToast(resdata?.message);
      router.replace("/(auth)/login");
    } catch (error) {
      showErrorToast(String(error));
    } finally {
      set({ isDeletingAccount: false, isLoading: false });
    }
  },

  fetchActiveSessions: async () => {
    set({ isSessionsLoading: true });
    try {
      const resdata = await getActiveSessions();
      set({
        activeSessions: resdata.sessions || [],
        canManageDevices: resdata?.canManageDevices,
      });
    } catch (error) {
      throwError(error);
    } finally {
      set({ isSessionsLoading: false });
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
    get().disconnectSocket();
    await Promise.all([
      secureStorage.deleteToken(),
      secureStorage.deleteDeviceId(),
    ]);
    set({
      authUser: null,
      token: null,
      trustedDeviceId: null,
      onlineUsers: [],
      activeSessions: [],
      canManageDevices: false,
    });
    showSuccessToast("Logout successfully");
    router.replace("/(auth)/login");
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

      const token = await secureStorage.getToken();
      if (!token) {
        set({
          authUser: null,
          token: null,
          canManageDevices: false,
        });
        return;
      }

      const data = await checkUser();
      set({ authUser: data.user, token });
    } catch (error) {
      set({ authUser: null, token: null, canManageDevices: false });
      await secureStorage.deleteToken();
      console.log("Check auth error:", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  connectSocket: async () => {
    const currentSocket = get().socket;
    if (currentSocket?.connected) return;
    if (currentSocket) {
      currentSocket.removeAllListeners();
      currentSocket.disconnect();
      set({ socket: null });
    }

    const token = await secureStorage.getToken();
    const socketUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!token || !socketUrl) return;

    const socket = io(socketUrl, {
      autoConnect: false,
      reconnection: true,
      transports: ["websocket"],
      auth: {
        token,
      },
    });

    set({ socket: socket });
    registerChatSocketListeners(socket);

    socket.on("force-logout", async () => {
      get().disconnectSocket();
      await Promise.all([
        secureStorage.deleteToken(),
        secureStorage.deleteDeviceId(),
      ]);

      set({
        authUser: null,
        token: null,
        trustedDeviceId: null,
        onlineUsers: [],
        activeSessions: [],
        canManageDevices: false,
      });
      showErrorToast("You were logged out from this device");
      router.replace("/(auth)/login");
    });

    socket.on("getonlineusers", (users: unknown) => {
      set({
        onlineUsers: Array.isArray(users)
          ? users.map((userId) => String(userId))
          : [],
      });
    });

    socket.connect();
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }
    set({ onlineUsers: [], socket: null });
  },
}));

registerAuthSocketSession(() => {
  const { authUser, socket } = useAuthStore.getState();
  return { authUser, socket };
});
