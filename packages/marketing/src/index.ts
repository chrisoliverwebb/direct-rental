import type { GetContactsQuery } from "@repo/api-contracts";
export * from "./email-editor";

export const marketingKeys = {
  all: ["marketing"] as const,
  dashboard: () => [...marketingKeys.all, "dashboard"] as const,
  contacts: (query: GetContactsQuery) => [...marketingKeys.all, "contacts", query] as const,
  contact: (contactId: string) => [...marketingKeys.all, "contact", contactId] as const,
  draftCampaigns: () => [...marketingKeys.all, "draft-campaigns"] as const,
  campaigns: () => [...marketingKeys.all, "campaigns"] as const,
  campaign: (campaignId: string) => [...marketingKeys.all, "campaign", campaignId] as const,
  templates: () => [...marketingKeys.all, "templates"] as const,
};

export const contactStatusLabel = (status: "SUBSCRIBED" | "UNSUBSCRIBED") =>
  status === "SUBSCRIBED" ? "Subscribed" : "Unsubscribed";

export const contactSourceLabel = (source: "MANUAL_ENTRY" | "DIRECT_BOOKING") =>
  source === "MANUAL_ENTRY" ? "Manual Entry" : "Direct Booking";

export const campaignStatusLabel = (status: "SCHEDULED" | "SENT") => {
  if (status === "SCHEDULED") {
    return "Scheduled";
  }

  return "Sent";
};

export const draftCampaignStatusLabel = (_status: "DRAFT") => "Draft";

export const channelLabel = (channel: "EMAIL" | "SMS") => (channel === "EMAIL" ? "Email" : "SMS");
