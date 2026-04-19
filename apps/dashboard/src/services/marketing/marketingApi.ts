import {
  campaignDetailSchema,
  campaignListResponseSchema,
  contactDetailSchema,
  contactImportResultSchema,
  contactListResponseSchema,
  createCampaignRequestSchema,
  createContactRequestSchema,
  createContactsRequestSchema,
  createEntityResponseSchema,
  draftCampaignListResponseSchema,
  getContactsQuerySchema,
  marketingDashboardSchema,
  sendCampaignRequestSchema,
  sendCampaignResponseSchema,
  templateListResponseSchema,
  updateCampaignRequestSchema,
  type CampaignDetail,
  type CampaignSummary,
  type ContactDetail,
  type ContactImportResult,
  type ContactSummary,
  type DraftCampaignSummary,
  type CreateCampaignRequest,
  type CreateContactRequest,
  type CreateContactsRequest,
  type CreateEntityResponse,
  type GetContactsQuery,
  type MarketingDashboard,
  type SendCampaignRequest,
  type SendCampaignResponse,
  type TemplateListResponse,
  type UpdateCampaignRequest,
} from "@repo/api-contracts";
import type { PaginatedResponse } from "@repo/shared";
import { fetcher } from "@/lib/fetcher";

const buildQueryString = (query: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const built = searchParams.toString();
  return built ? `?${built}` : "";
};

export interface MarketingApi {
  getDashboard(): Promise<MarketingDashboard>;
  getContacts(query: GetContactsQuery): Promise<PaginatedResponse<ContactSummary>>;
  getContact(contactId: string): Promise<ContactDetail>;
  createContact(request: CreateContactRequest): Promise<CreateEntityResponse>;
  importContacts(request: CreateContactsRequest): Promise<ContactImportResult>;
  getDraftCampaigns(): Promise<PaginatedResponse<DraftCampaignSummary>>;
  getCampaigns(): Promise<PaginatedResponse<CampaignSummary>>;
  getCampaign(campaignId: string): Promise<CampaignDetail>;
  createCampaign(request: CreateCampaignRequest): Promise<CreateEntityResponse>;
  updateCampaign(campaignId: string, request: UpdateCampaignRequest): Promise<CreateEntityResponse>;
  sendCampaign(campaignId: string, request: SendCampaignRequest): Promise<SendCampaignResponse>;
  getTemplates(): Promise<TemplateListResponse>;
}

export const marketingApi: MarketingApi = {
  getDashboard: async () =>
    fetcher<MarketingDashboard>("/v1/marketing/dashboard", {
      schema: marketingDashboardSchema,
    }),
  getContacts: async (query) => {
    const parsed = getContactsQuerySchema.parse(query);
    return fetcher<PaginatedResponse<ContactSummary>>(
      `/v1/marketing/contacts${buildQueryString(parsed)}`,
      { schema: contactListResponseSchema },
    );
  },
  getContact: async (contactId) =>
    fetcher<ContactDetail>(`/v1/marketing/contacts/${contactId}`, {
      schema: contactDetailSchema,
    }),
  createContact: async (request) =>
    fetcher<CreateEntityResponse>("/v1/marketing/contacts", {
      method: "POST",
      body: JSON.stringify(createContactRequestSchema.parse(request)),
      schema: createEntityResponseSchema,
    }),
  importContacts: async (request) =>
    fetcher<ContactImportResult>("/v1/marketing/contacts/import", {
      method: "POST",
      body: JSON.stringify(createContactsRequestSchema.parse(request)),
      schema: contactImportResultSchema,
    }),
  getDraftCampaigns: async () =>
    fetcher<PaginatedResponse<DraftCampaignSummary>>("/v1/marketing/campaigns/drafts", {
      schema: draftCampaignListResponseSchema,
    }),
  getCampaigns: async () =>
    fetcher<PaginatedResponse<CampaignSummary>>("/v1/marketing/campaigns", {
      schema: campaignListResponseSchema,
    }),
  getCampaign: async (campaignId) =>
    fetcher<CampaignDetail>(`/v1/marketing/campaigns/${campaignId}`, {
      schema: campaignDetailSchema,
    }),
  createCampaign: async (request) =>
    fetcher<CreateEntityResponse>("/v1/marketing/campaigns", {
      method: "POST",
      body: JSON.stringify(createCampaignRequestSchema.parse(request)),
      schema: createEntityResponseSchema,
    }),
  updateCampaign: async (campaignId, request) =>
    fetcher<CreateEntityResponse>(`/v1/marketing/campaigns/${campaignId}`, {
      method: "PUT",
      body: JSON.stringify(updateCampaignRequestSchema.parse(request)),
      schema: createEntityResponseSchema,
    }),
  sendCampaign: async (campaignId, request) =>
    fetcher<SendCampaignResponse>(`/v1/marketing/campaigns/${campaignId}/send`, {
      method: "POST",
      body: JSON.stringify(sendCampaignRequestSchema.parse(request)),
      schema: sendCampaignResponseSchema,
    }),
  getTemplates: async () =>
    fetcher<TemplateListResponse>("/v1/marketing/templates", {
      schema: templateListResponseSchema,
    }),
};
