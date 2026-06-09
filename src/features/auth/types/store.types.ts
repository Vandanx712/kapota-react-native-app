import { LoginFormData } from "../validation/authScreen";

export interface AuthState {
  authUser: object | null;
  token: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;

  signup: () => Promise<void>;
  login: (data:LoginFormData) => Promise<any>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}
