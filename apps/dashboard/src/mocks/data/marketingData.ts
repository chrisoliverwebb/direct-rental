import type {
  CampaignDetail,
  CampaignSummary,
  ContactDetail,
  ContactSummary,
  CreateCampaignRequest,
  CreateContactRequest,
  MarketingDashboard,
  ScheduledCampaignSummary,
  TemplateSummary,
} from "@repo/api-contracts";
import { createId, sortByCreatedAtDesc } from "@repo/shared";

const properties = [
  { id: "prop_001", name: "Seabrook Cottage" },
  { id: "prop_002", name: "Harbour View Loft" },
  { id: "prop_003", name: "Moorland House" },
];

const firstNames = ["Sarah", "Tom", "Emma", "Priya", "James", "Hannah", "Owen", "Lucy", "Daniel", "Grace"];
const lastNames = ["Walker", "Bennett", "Reed", "Patel", "Lewis", "Carter", "Evans", "Cole", "Turner", "Ward"];
const contactSources: ContactSummary["source"][] = ["MANUAL_IMPORT", "CSV_IMPORT", "MANUAL_ENTRY", "WIFI_CAPTURE"];
const contactStatuses: ContactSummary["status"][] = ["SUBSCRIBED", "UNSUBSCRIBED"];
const defaultProperty = properties[0]!;

const atIso = (date: string) => new Date(date).toISOString();

const seededContacts = Array.from({ length: 36 }, (_, index): ContactDetail => {
  const property = properties[index % properties.length] ?? defaultProperty;
  const firstName = firstNames[index % firstNames.length] ?? "Guest";
  const lastName = lastNames[index % lastNames.length] ?? "User";
  const status = contactStatuses[index % contactStatuses.length] ?? "SUBSCRIBED";
  const source = contactSources[index % contactSources.length] ?? "MANUAL_ENTRY";
  const createdAt = atIso(`2026-02-${String((index % 20) + 1).padStart(2, "0")}T10:00:00Z`);
  const lastBookingAt = index % 5 === 0 ? null : atIso(`2026-03-${String((index % 18) + 1).padStart(2, "0")}T12:00:00Z`);

  return {
    id: createId("contact", index + 1),
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@guestmail.test`,
    phone: index % 4 === 0 ? null : `+447700900${String(index).padStart(3, "0")}`,
    status,
    source,
    propertyId: property.id,
    propertyName: property.name,
    notes: index % 6 === 0 ? "Prefers short breaks and responds well to SMS reminders." : null,
    createdAt,
    lastBookingAt,
    consents: {
      emailMarketing: status === "SUBSCRIBED",
      smsMarketing: index % 3 !== 0,
      capturedAt: createdAt,
    },
  };
});

const seededCampaigns: CampaignDetail[] = [
  {
    id: "camp_0001",
    name: "Late spring direct-booking push",
    status: "DRAFT",
    channel: "EMAIL",
    subject: "Late spring weekends just opened up",
    previewText: "Offer returning guests first access to two open weekends.",
    contentHtml: "<p>We have two late spring weekends available.</p>",
    contentText: "We have two late spring weekends available.",
    recipientSelection: { type: "ALL_SUBSCRIBED" },
    scheduledAt: null,
    sentAt: null,
    createdAt: atIso("2026-04-01T09:00:00Z"),
  },
  {
    id: "camp_0002",
    name: "May bank holiday SMS reminder",
    status: "DRAFT",
    channel: "SMS",
    subject: null,
    previewText: null,
    contentHtml: "<p>May bank holiday dates are available for past guests.</p>",
    contentText: "May bank holiday dates are available for past guests.",
    recipientSelection: { type: "ALL_SUBSCRIBED" },
    scheduledAt: null,
    sentAt: null,
    createdAt: atIso("2026-04-03T09:00:00Z"),
  },
  {
    id: "camp_0003",
    name: "Summer return guest offer",
    status: "DRAFT",
    channel: "EMAIL",
    subject: "A summer offer for past guests",
    previewText: "Returning guest pricing for July stays.",
    contentHtml: "<p>Come back this summer with a returning guest rate.</p>",
    contentText: "Come back this summer with a returning guest rate.",
    recipientSelection: { type: "ALL_SUBSCRIBED" },
    scheduledAt: null,
    sentAt: null,
    createdAt: atIso("2026-04-05T09:00:00Z"),
  },
  {
    id: "camp_0004",
    name: "Easter follow-up",
    status: "SENT",
    channel: "EMAIL",
    subject: "Thanks for staying with us",
    previewText: "Invite recent guests back for summer.",
    contentHtml: "<p>Thanks for staying with us this Easter.</p>",
    contentText: "Thanks for staying with us this Easter.",
    recipientSelection: { type: "ALL_SUBSCRIBED" },
    scheduledAt: null,
    sentAt: atIso("2026-03-30T08:00:00Z"),
    createdAt: atIso("2026-03-27T09:00:00Z"),
  },
  {
    id: "camp_0005",
    name: "Weekend gap filler",
    status: "SENT",
    channel: "SMS",
    subject: null,
    previewText: null,
    contentHtml: "<p>Last-minute weekend availability for past guests.</p>",
    contentText: "Last-minute weekend availability for past guests.",
    recipientSelection: { type: "ALL_SUBSCRIBED" },
    scheduledAt: null,
    sentAt: atIso("2026-03-21T13:00:00Z"),
    createdAt: atIso("2026-03-21T11:00:00Z"),
  },
  {
    id: "camp_0006",
    name: "June half-term early access",
    status: "SCHEDULED",
    channel: "EMAIL",
    subject: "Early access for June half-term",
    previewText: "Past guests can book before public release.",
    contentHtml: "<p>June half-term is open for past guests first.</p>",
    contentText: "June half-term is open for past guests first.",
    recipientSelection: { type: "ALL_SUBSCRIBED" },
    scheduledAt: atIso("2026-04-25T09:30:00Z"),
    sentAt: null,
    createdAt: atIso("2026-04-10T08:00:00Z"),
  },
];

const seededTemplates: TemplateSummary[] = [
  {
    id: "template_001",
    name: "Last minute availability",
    channel: "EMAIL",
    subject: "A last minute stay has opened up",
    previewText: "Give recent guests first refusal on unexpected availability.",
    thumbnailUrl: null,
  },
  {
    id: "template_002",
    name: "Summer return offer",
    channel: "EMAIL",
    subject: "A summer return-guest offer",
    previewText: "Encourage repeat bookings with a direct-only incentive.",
    thumbnailUrl: null,
  },
  {
    id: "template_003",
    name: "Bank holiday reminder",
    channel: "SMS",
    subject: null,
    previewText: "Short reminder for upcoming long weekends.",
    thumbnailUrl: null,
  },
  {
    id: "template_004",
    name: "Repeat guest discount",
    channel: "EMAIL",
    subject: "A thank-you discount for returning guests",
    previewText: "A simple win-back campaign for your guest list.",
    thumbnailUrl: null,
  },
];

let contacts = [...seededContacts];
let campaigns = [...seededCampaigns];

const toCampaignSummary = (campaign: CampaignDetail): CampaignSummary => ({
  id: campaign.id,
  name: campaign.name,
  status: campaign.status,
  channel: campaign.channel,
  subject: campaign.subject,
  recipientCount: contacts.filter((contact) => contact.status === "SUBSCRIBED").length,
  scheduledAt: campaign.scheduledAt,
  sentAt: campaign.sentAt,
  openRate: campaign.status === "SENT" ? 0.42 : null,
  clickRate: campaign.status === "SENT" ? 0.11 : null,
  createdAt: campaign.createdAt,
});

export const getDashboard = (): MarketingDashboard => {
  const recentCampaigns = sortByCreatedAtDesc(campaigns).slice(0, 5).map(toCampaignSummary);
  const upcomingCampaigns: ScheduledCampaignSummary[] = campaigns
    .filter((campaign) => campaign.status === "SCHEDULED" && campaign.scheduledAt)
    .map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      status: "SCHEDULED",
      channel: campaign.channel,
      scheduledAt: campaign.scheduledAt as string,
    }));

  return {
    contactCount: contacts.length,
    subscribedContactCount: contacts.filter((contact) => contact.status === "SUBSCRIBED").length,
    unsubscribedContactCount: contacts.filter((contact) => contact.status === "UNSUBSCRIBED").length,
    campaignCount: campaigns.length,
    sentCampaignCount: campaigns.filter((campaign) => campaign.status === "SENT").length,
    draftCampaignCount: campaigns.filter((campaign) => campaign.status === "DRAFT").length,
    recentCampaigns,
    upcomingCampaigns,
  };
};

export const listContacts = ({
  page = 1,
  pageSize = 10,
  search,
  source,
  status,
  propertyId,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  source?: ContactSummary["source"];
  status?: ContactSummary["status"];
  propertyId?: string;
}) => {
  const normalizedSearch = search?.toLowerCase().trim();
  const filtered = contacts.filter((contact) => {
    if (status && contact.status !== status) {
      return false;
    }

    if (source && contact.source !== source) {
      return false;
    }

    if (propertyId && contact.propertyId !== propertyId) {
      return false;
    }

    if (normalizedSearch) {
      const haystack = `${contact.firstName} ${contact.lastName} ${contact.email} ${contact.propertyName}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    }

    return true;
  });

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map((contact) => ({
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    status: contact.status,
    source: contact.source,
    propertyId: contact.propertyId,
    propertyName: contact.propertyName,
    createdAt: contact.createdAt,
    lastBookingAt: contact.lastBookingAt,
  }));

  return {
    items,
    page,
    pageSize,
    totalItems: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
  };
};

export const getContactById = (contactId: string) => contacts.find((contact) => contact.id === contactId) ?? null;

export const createContact = (request: CreateContactRequest) => {
  const property = properties.find((entry) => entry.id === request.propertyId) ?? defaultProperty;
  const createdAt = new Date().toISOString();
  const contact: ContactDetail = {
    id: createId("contact", contacts.length + 1),
    firstName: request.firstName,
    lastName: request.lastName,
    email: request.email,
    phone: request.phone ?? null,
    status: request.consents.emailMarketing || request.consents.smsMarketing ? "SUBSCRIBED" : "UNSUBSCRIBED",
    source: "MANUAL_ENTRY",
    propertyId: property.id,
    propertyName: property.name,
    notes: request.notes ?? null,
    createdAt,
    lastBookingAt: null,
    consents: {
      ...request.consents,
      capturedAt: createdAt,
    },
  };

  contacts = [contact, ...contacts];
  return { id: contact.id };
};

export const importContacts = () => ({
  importId: "import_0001",
  status: "COMPLETED" as const,
  totalRows: 12,
  importedRows: 11,
  failedRows: 1,
  errors: [{ rowNumber: 7, message: "Email address is invalid" }],
});

export const listCampaigns = () => ({
  items: sortByCreatedAtDesc(campaigns).map(toCampaignSummary),
  page: 1,
  pageSize: campaigns.length,
  totalItems: campaigns.length,
  totalPages: 1,
});

export const getCampaignById = (campaignId: string) => campaigns.find((campaign) => campaign.id === campaignId) ?? null;

export const createCampaign = (request: CreateCampaignRequest) => {
  const campaign: CampaignDetail = {
    id: createId("camp", campaigns.length + 1),
    status: "DRAFT",
    createdAt: new Date().toISOString(),
    scheduledAt: null,
    sentAt: null,
    ...request,
  };

  campaigns = [campaign, ...campaigns];
  return { id: campaign.id };
};

export const updateCampaign = (campaignId: string, request: CreateCampaignRequest) => {
  campaigns = campaigns.map((campaign) =>
    campaign.id === campaignId
      ? {
          ...campaign,
          ...request,
        }
      : campaign,
  );

  return { id: campaignId };
};

export const sendCampaign = (campaignId: string) => {
  campaigns = campaigns.map((campaign) =>
    campaign.id === campaignId
      ? {
          ...campaign,
          status: "SENT",
          sentAt: new Date().toISOString(),
          scheduledAt: null,
        }
      : campaign,
  );

  return { id: campaignId, status: "SENT" as const };
};

export const listTemplates = () => ({ items: seededTemplates });

export const resetMarketingState = () => {
  contacts = [...seededContacts];
  campaigns = [...seededCampaigns];
};
