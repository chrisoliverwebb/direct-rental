import {
  companySettingsSchema,
  brandingSettingsSchema,
  marketingSettingsSchema,
  propertySettingsSchema,
  sendingSettingsSchema,
  settingsOverviewSchema,
  updatePropertyCalendarSettingsSchema,
  upsertPropertySettingsSchema,
  type BrandingSettings,
  type CompanySettings,
  type MarketingSettings,
  type PropertySettings,
  type SendingSettings,
  type SettingsOverview,
  type UpdatePropertyCalendarSettings,
  type UpsertPropertySettings,
} from "@repo/api-contracts";
import { fetcher } from "@/lib/fetcher";

export interface SettingsApi {
  getSettings(): Promise<SettingsOverview>;
  updateCompany(request: CompanySettings): Promise<CompanySettings>;
  updateBranding(request: BrandingSettings): Promise<BrandingSettings>;
  updateMarketing(request: MarketingSettings): Promise<MarketingSettings>;
  updateSending(request: SendingSettings): Promise<SendingSettings>;
  createProperty(request: UpsertPropertySettings): Promise<PropertySettings>;
  updateProperty(propertyId: string, request: UpsertPropertySettings): Promise<PropertySettings>;
  archiveProperty(propertyId: string): Promise<PropertySettings>;
  updatePropertyCalendar(propertyId: string, request: UpdatePropertyCalendarSettings): Promise<void>;
}

export const settingsApi: SettingsApi = {
  getSettings: async () =>
    fetcher<SettingsOverview>("/v1/settings", {
      schema: settingsOverviewSchema,
    }),
  updateCompany: async (request) =>
    fetcher<CompanySettings>("/v1/settings/company", {
      method: "PUT",
      body: JSON.stringify(companySettingsSchema.parse(request)),
      schema: companySettingsSchema,
    }),
  updateBranding: async (request) =>
    fetcher<BrandingSettings>("/v1/settings/branding", {
      method: "PUT",
      body: JSON.stringify(brandingSettingsSchema.parse(request)),
      schema: brandingSettingsSchema,
    }),
  updateMarketing: async (request) =>
    fetcher<MarketingSettings>("/v1/settings/marketing", {
      method: "PUT",
      body: JSON.stringify(marketingSettingsSchema.parse(request)),
      schema: marketingSettingsSchema,
    }),
  updateSending: async (request) =>
    fetcher<SendingSettings>("/v1/settings/sending", {
      method: "PUT",
      body: JSON.stringify(sendingSettingsSchema.parse(request)),
      schema: sendingSettingsSchema,
    }),
  createProperty: async (request) =>
    fetcher<PropertySettings>("/v1/settings/properties", {
      method: "POST",
      body: JSON.stringify(upsertPropertySettingsSchema.parse(request)),
      schema: propertySettingsSchema,
    }),
  updateProperty: async (propertyId, request) =>
    fetcher<PropertySettings>(`/v1/settings/properties/${propertyId}`, {
      method: "PUT",
      body: JSON.stringify(upsertPropertySettingsSchema.parse(request)),
      schema: propertySettingsSchema,
    }),
  archiveProperty: async (propertyId) =>
    fetcher<PropertySettings>(`/v1/settings/properties/${propertyId}/archive`, {
      method: "POST",
      schema: propertySettingsSchema,
    }),
  updatePropertyCalendar: async (propertyId, request) =>
    fetcher<void>(`/v1/settings/properties/${propertyId}/calendar`, {
      method: "PUT",
      body: JSON.stringify(updatePropertyCalendarSettingsSchema.parse(request)),
    }),
};
