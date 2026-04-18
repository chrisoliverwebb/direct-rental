"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateCampaignRequest,
  CreateContactRequest,
  GetContactsQuery,
  SendCampaignRequest,
  UpdateCampaignRequest,
} from "@repo/api-contracts";
import { marketingKeys } from "@repo/marketing";
import { marketingApi } from "@/services/marketing/marketingApi";

export const useMarketingDashboard = () =>
  useQuery({
    queryKey: marketingKeys.dashboard(),
    queryFn: () => marketingApi.getDashboard(),
  });

export const useContacts = (query: GetContactsQuery) =>
  useQuery({
    queryKey: marketingKeys.contacts(query),
    queryFn: () => marketingApi.getContacts(query),
  });

export const useContact = (contactId: string) =>
  useQuery({
    queryKey: marketingKeys.contact(contactId),
    queryFn: () => marketingApi.getContact(contactId),
  });

export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateContactRequest) => marketingApi.createContact(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: marketingKeys.all });
    },
  });
};

export const useImportContacts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => marketingApi.importContacts(formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: marketingKeys.all });
    },
  });
};

export const useCampaigns = () =>
  useQuery({
    queryKey: marketingKeys.campaigns(),
    queryFn: () => marketingApi.getCampaigns(),
  });

export const useCampaign = (campaignId: string) =>
  useQuery({
    queryKey: marketingKeys.campaign(campaignId),
    queryFn: () => marketingApi.getCampaign(campaignId),
  });

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCampaignRequest) => marketingApi.createCampaign(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: marketingKeys.campaigns() });
    },
  });
};

export const useUpdateCampaign = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateCampaignRequest) => marketingApi.updateCampaign(campaignId, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: marketingKeys.campaign(campaignId) });
      await queryClient.invalidateQueries({ queryKey: marketingKeys.campaigns() });
    },
  });
};

export const useSendCampaign = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SendCampaignRequest) => marketingApi.sendCampaign(campaignId, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: marketingKeys.campaign(campaignId) });
      await queryClient.invalidateQueries({ queryKey: marketingKeys.campaigns() });
      await queryClient.invalidateQueries({ queryKey: marketingKeys.dashboard() });
    },
  });
};

export const useTemplates = () =>
  useQuery({
    queryKey: marketingKeys.templates(),
    queryFn: () => marketingApi.getTemplates(),
  });
