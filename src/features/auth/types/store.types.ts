import { LoginFormData, SignupFormData } from "../validation/authScreen";
import { VerifySignup } from "./auth.types";

export interface AuthState {
  authUser: object | null;
  token: string | null;
  trustedDeviceId: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;

  requestSignupOtp: (data: SignupFormData) => Promise<any>;
  verifySignupOtp: (data: VerifySignup) => Promise<any>;
  login: (data: LoginFormData) => Promise<any>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}
