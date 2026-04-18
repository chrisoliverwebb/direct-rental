import type { AuthUser, LoginResponse } from "@repo/api-contracts";

const mockUser: AuthUser = {
  id: "user_0001",
  email: "owner@directrental.test",
  firstName: "Alex",
  lastName: "Morgan",
};

let currentAccessToken: string | null = null;

export const createLoginResponse = (): LoginResponse => {
  currentAccessToken = "mock-access-token";

  return {
    user: mockUser,
    accessToken: currentAccessToken,
  };
};

export const getMockCurrentUser = (authorizationHeader: string | null) => {
  if (!currentAccessToken) {
    return null;
  }

  if (!authorizationHeader || authorizationHeader !== `Bearer ${currentAccessToken}`) {
    return null;
  }

  return mockUser;
};

export const clearMockSession = () => {
  currentAccessToken = null;
};

export const resetMockAuthState = () => {
  currentAccessToken = null;
};
