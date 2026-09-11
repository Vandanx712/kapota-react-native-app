export interface SplashStatusItem {
  id: number;
  label: string;
}

export interface MediaSettings {
  autoDownload?: boolean;
  maxAutoDownloadBytes?: number;
}

export interface AuthUser {
  _id: string;
  bio?: string;
  email?: string;
  fullname: string;
  gender?: string;
  location?: Record<string, unknown>;
  profilePic?: {
    key?: string;
    url: string;
  };
  mediaSettings?: MediaSettings;
}


export interface VerifySignup {
  fullname: string;
  email: string;
  password: string;
  gender: string;
  location: object;
  otp: string;
}

export interface RequestForgotPass {
  email: string;
}

export interface DeleteAccount {
  password: string;
}

export interface VerifyForgotPass {
  email: string;
  password: string;
  otp: string;
}
