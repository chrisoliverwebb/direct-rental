import type { AuthUser } from "@repo/api-contracts";

export const SESSION_STORAGE_KEY = "direct-rental.dashboard.access-token";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const getStoredAccessToken = () => {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(SESSION_STORAGE_KEY);
};

export const setStoredAccessToken = (accessToken: string) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, accessToken);
};

export const clearStoredAccessToken = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const getUserDisplayName = (user: AuthUser | null | undefined) => {
  if (!user) {
    return "";
  }

  return `${user.firstName} ${user.lastName}`.trim();
};
