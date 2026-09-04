import type { Socket } from "socket.io-client";
import type { AuthUser } from "@/features/auth/types/auth.types";

type AuthSocketSession = {
  authUser: AuthUser | null;
  socket: Socket | null;
};

let sessionGetter: (() => AuthSocketSession) | null = null;

export const registerAuthSocketSession = (
  getSession: () => AuthSocketSession,
) => {
  sessionGetter = getSession;
};

export const getAuthSocketSession = (): AuthSocketSession => {
  return sessionGetter?.() ?? { authUser: null, socket: null };
};
