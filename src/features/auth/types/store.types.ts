import { LoginFormData, SignupFormData } from "../validation/authScreen";
import {
  DeleteAccount,
  RequestForgotPass,
  VerifyForgotPass,
  VerifySignup,
} from "./auth.types";
import { Socket } from "socket.io-client";

export interface AuthState {
  authUser: object | null;
  onlineUsers: [];
  token: string | null;
  socket: Socket | null;
  trustedDeviceId: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  sessionActionId: string | null;
  activeSessions: [];
  canManageDevices: boolean;
  isPhotoUploading: boolean;
  isLoggingOutOthers: boolean;

  requestSignupOtp: (data: SignupFormData) => any;
  verifySignupOtp: (data: VerifySignup) => any;
  requestForgotPasswordOtp: (data: RequestForgotPass) => any;
  verifyForgotPasswordOtp: (data: VerifyForgotPass) => any;
  updateProfile: (data: any) => any;
  updateDetails:(data:any)=>any
  deleteAccount: (data: DeleteAccount) => any;
  fetchActiveSessions: () => any;
  login: (data: LoginFormData) => any;
  checkAuth: () => any;
  logout: () => any;
  logoutOneSession: (sessionId: string) => any;
  logoutOtherSessions: () => any;

  connectSocket: () => any;
  disconnectSocket: () => any;
}
