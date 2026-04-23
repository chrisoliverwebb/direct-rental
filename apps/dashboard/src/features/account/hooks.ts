"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "@/services/account/accountApi";

export const accountKeys = {
  all: ["account"] as const,
  overview: () => [...accountKeys.all, "overview"] as const,
};

export const useAccount = () =>
  useQuery({
    queryKey: accountKeys.overview(),
    queryFn: () => accountApi.getAccount(),
    retry: false,
  });

export const usePortalMutation = () =>
  useMutation({
    mutationFn: () => accountApi.getPortalUrl(),
    onSuccess: (data) => {
      window.open(data.url, "_blank", "noopener,noreferrer");
    },
  });

export const useCancelSubscriptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => accountApi.cancelSubscription(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
};

export const useChangePasswordMutation = () =>
  useMutation({
    mutationFn: (request: import("@repo/api-contracts").ChangePasswordRequest) =>
      accountApi.changePassword(request),
  });
