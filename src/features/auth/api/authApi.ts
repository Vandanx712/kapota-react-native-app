import { api } from "@/lib/api";
import { LoginFormData, SignupFormData } from "../validation/authScreen";
import { VerifySignup } from "../types/auth.types";

export const requestSignupOtp = async (data: SignupFormData) => {
  const response = await api.post("/auth/signup/request-otp", {
    fullname: `${data.firstname} ${data.lastname}`,
    email: data.email,
    gender: data.gender,
    password: data.password,
    location: data.location,
  });
  return response.data;
};

export const verifySignupOtp = async (data: VerifySignup) => {
  const response = await api.post("/auth/signup/verify", { data });
  return response.data;
};

export const loginuser = async (data: LoginFormData) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const logout = async (data) => {
  const response = await api.post("/auth/logout", data);
  return response.data;
};

export const checkUser = async () => {
  const response = await api.get("/auth/check");
  return response.data;
};

export const requestForgotPasswordOtp = async (data) => {
  const response = await api.post("/auth/forgot-password/request-otp", data);
  return response.data;
};

export const verifyForgotPasswordOtp = async (data) => {
  const response = await api.post("/auth/forgot-password/verify", data);
  return response.data;
};

export const getActiveSessions = async () => {
  const response = await api.get("/auth/sessions");
  return response.data;
};

export const logoutOneSession = async (id: string) => {
  const response = await api.delete(`/auth/sessions/${id}`);
  return response.data;
};

export const logoutOtherSessions = async () => {
  const response = await api.delete("/auth/sessions/others");
  return response.data;
};
