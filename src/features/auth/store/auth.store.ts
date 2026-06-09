import { create } from "zustand";
import { AuthState } from "../types/store.types";
import { LoginFormData } from "../validation/authScreen";
import { checkUser, loginuser } from "../api/authApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import axios from "axios";

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  token: null,
  isLoading: false,
  isCheckingAuth: false,

  signup: async () => {},
  login: async (data: LoginFormData) => {
    try {
      set({ isLoading: true });
      const res = await loginuser(data);

      return res;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showErrorToast(error.response?.data?.message);
      } else {
        showErrorToast("Something went wrong");
      }
    } finally {
      set({ isLoading: false });
    }
  },
  checkAuth: async () => {
  try {
    set({ isCheckingAuth: true });

    const data = await checkUser();
    set({ authUser: data.user });
  } catch (error) {
    set({ authUser: null, token: null });
  } finally {
    set({ isCheckingAuth: false });
  }
},
}));
