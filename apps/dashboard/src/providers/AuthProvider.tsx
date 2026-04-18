"use client";

import { createContext, useContext } from "react";

type AuthContextValue = {
  enabled: true;
};

const AuthContext = createContext<AuthContextValue>({ enabled: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthContext.Provider value={{ enabled: true }}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);
