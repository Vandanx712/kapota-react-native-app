import { LoginFormData, SignupFormData } from "../validation/authScreen";
import { VerifySignup } from "./auth.types";
import { Socket } from "socket.io-client";

export interface AuthState {
  authUser: object | null;
  onlineUsers: [];
  token: string | null;
  socket: Socket | null;
  trustedDeviceId: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;

  requestSignupOtp: (data: SignupFormData) => Promise<any>;
  verifySignupOtp: (data: VerifySignup) => Promise<any>;
  login: (data: LoginFormData) => Promise<any>;
  checkAuth: () => Promise<any>;
  logout: () => any;

  connectSocket: () => any;
  disconnectSocket: () => any;
}
