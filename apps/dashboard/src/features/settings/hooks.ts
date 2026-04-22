"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BrandingSettings,
  CompanySettings,
  MarketingSettings,
  SendingSettings,
  UpdatePropertyCalendarSettings,
  UpsertPropertySettings,
} from "@repo/api-contracts";
import { settingsApi } from "@/services/settings/settingsApi";
import { settingsKeys } from "@/features/settings/keys";

export const useSettings = () =>
  useQuery({
    queryKey: settingsKeys.overview(),
    queryFn: () => settingsApi.getSettings(),
  });

const invalidateSettings = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await queryClient.invalidateQueries({ queryKey: settingsKeys.all });
};

export const useUpdateCompanySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CompanySettings) => settingsApi.updateCompany(request),
    onSuccess: async () => invalidateSettings(queryClient),
  });
};

export const useUpdateBrandingSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BrandingSettings) => settingsApi.updateBranding(request),
    onSuccess: async () => invalidateSettings(queryClient),
  });
};

export const useUpdateMarketingSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: MarketingSettings) => settingsApi.updateMarketing(request),
    onSuccess: async () => invalidateSettings(queryClient),
  });
};

export const useUpdateSendingSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SendingSettings) => settingsApi.updateSending(request),
    onSuccess: async () => invalidateSettings(queryClient),
  });
};

export const useCreatePropertySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpsertPropertySettings) => settingsApi.createProperty(request),
    onSuccess: async () => invalidateSettings(queryClient),
  });
};

export const useUpdatePropertySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, request }: { propertyId: string; request: UpsertPropertySettings }) =>
      settingsApi.updateProperty(propertyId, request),
    onSuccess: async () => invalidateSettings(queryClient),
  });
};

export const useArchivePropertySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => settingsApi.archiveProperty(propertyId),
    onSuccess: async () => invalidateSettings(queryClient),
  });
};

export const useUpdatePropertyCalendarSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, request }: { propertyId: string; request: UpdatePropertyCalendarSettings }) =>
      settingsApi.updatePropertyCalendar(propertyId, request),
    onSuccess: async () => invalidateSettings(queryClient),
  });
};
