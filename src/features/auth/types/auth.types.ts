export interface SplashStatusItem {
  id: number;
  label: string;
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

export interface DeleteAccount{
  password:string
}

export interface VerifyForgotPass {
  email: string;
  password: string;
  otp: string;
}
