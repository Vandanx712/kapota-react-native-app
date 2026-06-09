import { LoginFormData, SignupFormData } from "../validation/authScreen";

export interface AuthState {
  authUser: object | null;
  token: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;

  requestSignupOtp: (data:SignupFormData) => Promise<void>;
  login: (data:LoginFormData) => Promise<any>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}
