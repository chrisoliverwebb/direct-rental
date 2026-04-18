"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginRequest } from "@repo/api-contracts";
import { clearStoredAccessToken, setStoredAccessToken } from "@repo/auth";
import { authApi } from "@/services/auth/authApi";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export const useCurrentUser = () =>
  useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authApi.getCurrentUser(),
  });

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LoginRequest) => authApi.login(request),
    onSuccess: async (response) => {
      setStoredAccessToken(response.accessToken);
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: authKeys.me() });
      clearStoredAccessToken();
      queryClient.setQueryData(authKeys.me(), null);
      queryClient.removeQueries({ queryKey: authKeys.me() });
    },
  });
};
