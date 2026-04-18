import {
  getCurrentUserResponseSchema,
  loginRequestSchema,
  loginResponseSchema,
  type GetCurrentUserResponse,
  type LoginRequest,
  type LoginResponse,
} from "@repo/api-contracts";
import { fetcher } from "@/lib/fetcher";

export interface AuthApi {
  login(request: LoginRequest): Promise<LoginResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<GetCurrentUserResponse>;
}

export const authApi: AuthApi = {
  login: async (request) => {
    const payload = loginRequestSchema.parse(request);
    return fetcher<LoginResponse>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      schema: loginResponseSchema,
    });
  },
  logout: async () => {
    await fetcher<void>("/v1/auth/logout", {
      method: "POST",
    });
  },
  getCurrentUser: async () =>
    fetcher<GetCurrentUserResponse>("/v1/auth/me", {
      method: "GET",
      schema: getCurrentUserResponseSchema,
    }),
};
