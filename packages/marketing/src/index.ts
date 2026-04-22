import type { GetCampaignsQuery, GetContactsQuery } from "@repo/api-contracts";
export * from "./email-editor";

export const marketingKeys = {
  all: ["marketing"] as const,
  dashboard: () => [...marketingKeys.all, "dashboard"] as const,
  contacts: (query: GetContactsQuery) => [...marketingKeys.all, "contacts", query] as const,
  contact: (contactId: string) => [...marketingKeys.all, "contact", contactId] as const,
  draftCampaigns: () => [...marketingKeys.all, "draft-campaigns"] as const,
  campaigns: (query: GetCampaignsQuery) => [...marketingKeys.all, "campaigns", query] as const,
  campaign: (campaignId: string) => [...marketingKeys.all, "campaign", campaignId] as const,
  savedBlocks: () => [...marketingKeys.all, "saved-blocks"] as const,
  templates: () => [...marketingKeys.all, "templates"] as const,
};

export const contactStatusLabel = (status: "SUBSCRIBED" | "UNSUBSCRIBED") =>
  status === "SUBSCRIBED" ? "Subscribed" : "Unsubscribed";

export const contactSourceLabel = (source: "MANUAL_ENTRY" | "DIRECT_BOOKING") =>
  source === "MANUAL_ENTRY" ? "Manual Entry" : "Direct Booking";

export const campaignStatusLabel = (status: "DRAFT" | "SCHEDULED" | "SENT") => {
  if (status === "DRAFT") {
    return "Draft";
  }

  if (status === "SCHEDULED") {
    return "Scheduled";
  }

  return "Sent";
};

export const draftCampaignStatusLabel = (_status: "DRAFT") => "Draft";

export const channelLabel = (channel: "EMAIL" | "SMS") => (channel === "EMAIL" ? "Email" : "SMS");

export const recipientSelectionLabel = (
  selection:
    | { type: "ALL" }
    | { type: "CONTACTS"; contactIds: string[] }
    | { type: "GROUPS"; groupIds: string[] },
) => {
  if (selection.type === "ALL") {
    return "All contacts";
  }

  if (selection.type === "CONTACTS") {
    return "Specific contacts";
  }

  return "Groups";
};
