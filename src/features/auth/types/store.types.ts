import { LoginFormData, SignupFormData } from "../validation/authScreen";
import {
  AuthUser,
  DeleteAccount,
  RequestForgotPass,
  VerifyForgotPass,
  VerifySignup,
} from "./auth.types";
import { Socket } from "socket.io-client";

export interface AuthState {
  authUser: AuthUser | null;
  onlineUsers: string[];
  token: string | null;
  socket: Socket | null;
  trustedDeviceId: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  sessionActionId: string | null;
  activeSessions: any[];
  canManageDevices: boolean;
  isPhotoUploading: boolean;
  isDeletingAccount: boolean;
  isLoggingOutOthers: boolean;
  isSessionsLoading: boolean;

  requestSignupOtp: (data: SignupFormData) => any;
  verifySignupOtp: (data: VerifySignup) => any;
  requestForgotPasswordOtp: (data: RequestForgotPass) => any;
  verifyForgotPasswordOtp: (data: VerifyForgotPass) => any;
  updateProfile: (data: any) => any;
  updateDetails: (data: any) => any;
  deleteAccount: (data: DeleteAccount) => any;
  fetchActiveSessions: () => any;
  login: (data: LoginFormData) => any;
  checkAuth: () => any;
  logout: () => Promise<void>;
  logoutOneSession: (sessionId: string) => any;
  logoutOtherSessions: () => any;

  connectSocket: () => Promise<void>;
  disconnectSocket: () => void;
}
