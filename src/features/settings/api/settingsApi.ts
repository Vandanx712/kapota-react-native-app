import { api } from "@/lib/api";

export const deleteAccount = async (password: string) => {
  const response = await api.delete("/auth/account", { data: { password } });
  return response.data;
};
