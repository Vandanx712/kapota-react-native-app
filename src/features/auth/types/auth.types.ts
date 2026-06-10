export interface SplashStatusItem {
  id: number;
  label: string;
}

export interface VerifySignup{
  fullname:string,
  email:string,
  password:string,
  gender:string,
  location:object,
  otp:string
}