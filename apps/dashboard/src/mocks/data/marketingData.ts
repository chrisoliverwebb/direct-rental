import type {
  CampaignDetail,
  CampaignSummary,
  ContactDetail,
  ContactSummary,
  CreateSavedEmailBlockRequest,
  CreateCampaignRequest,
  CreateContactRequest,
  CreateContactsRequest,
  MarketingDashboard,
  SavedEmailBlock,
  SendCampaignRequest,
  ScheduledCampaignSummary,
  DraftCampaignDetail,
  DraftCampaignSummary,
  GetCampaignsQuery,
  TemplateSummary,
} from "@repo/api-contracts";
import { createContactRequestSchema } from "@repo/api-contracts";
import { templateLibrary } from "@repo/email-templates";
import {
  createEmailDocumentFromCampaignContent,
} from "@repo/marketing";
import { createId, sortByCreatedAtDesc } from "@repo/shared";

type LiveCampaign = Extract<CampaignDetail, { status: "SCHEDULED" | "SENT" }>;

const firstNames = ["Sarah", "Tom", "Emma", "Priya", "James", "Hannah", "Owen", "Lucy", "Daniel", "Grace"];
const lastNames = ["Walker", "Bennett", "Reed", "Patel", "Lewis", "Carter", "Evans", "Cole", "Turner", "Ward"];
const contactSources: ContactSummary["source"][] = ["MANUAL_ENTRY", "DIRECT_BOOKING"];
const atIso = (date: string) => new Date(date).toISOString();
const seedEmailDocument = (name: string, subject: string | null, previewText: string | null, contentText: string) =>
  createEmailDocumentFromCampaignContent({
    name,
    subject,
    previewText,
    contentText,
  });

const seededContacts = Array.from({ length: 36 }, (_, index): ContactDetail => {
  const firstName = firstNames[index % firstNames.length] ?? "Guest";
  const lastName = lastNames[index % lastNames.length] ?? "User";
  const source = contactSources[index % contactSources.length] ?? "MANUAL_ENTRY";
  const createdAt = atIso(`2026-02-${String((index % 20) + 1).padStart(2, "0")}T10:00:00Z`);
  const lastContactedAt =
    index % 4 === 0 ? null : atIso(`2026-04-${String((index % 15) + 1).padStart(2, "0")}T15:30:00Z`);
  const lastBookingAt = index % 5 === 0 ? null : atIso(`2026-03-${String((index % 18) + 1).padStart(2, "0")}T12:00:00Z`);
  const emailMarketing = index % 4 !== 1;
  const smsMarketing = index % 3 !== 0;
  const status: ContactSummary["status"] = emailMarketing || smsMarketing ? "SUBSCRIBED" : "UNSUBSCRIBED";
  const emailUnsubscribedAt =
    !emailMarketing && index % 2 === 1 ? atIso(`2026-04-${String((index % 10) + 6).padStart(2, "0")}T09:15:00Z`) : null;
  const smsUnsubscribedAt =
    !smsMarketing && index % 2 === 0 ? atIso(`2026-03-${String((index % 12) + 8).padStart(2, "0")}T14:00:00Z`) : null;

  return {
    id: createId("contact", index + 1),
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@guestmail.test`,
    phone: index % 4 === 0 ? null : `+447700900${String(index).padStart(3, "0")}`,
    status,
    emailMarketing,
    smsMarketing,
    source,
    createdAt,
    lastContactedAt,
    lastBookingAt,
    consents: {
      emailMarketing,
      smsMarketing,
      capturedAt: createdAt,
      emailUnsubscribedAt,
      smsUnsubscribedAt,
    },
  };
});

const seededDraftCampaigns: DraftCampaignDetail[] = [
  {
    id: "camp_0001",
    name: "Late spring direct-booking push",
    status: "DRAFT",
    channel: "EMAIL",
    subject: "Late spring weekends just opened up",
    previewText: "Offer returning guests first access to two open weekends.",
    contentHtml: "<p>We have two late spring weekends available.</p>",
    contentText: "We have two late spring weekends available.",
    contentDocument: seedEmailDocument(
      "Late spring direct-booking push",
      "Late spring weekends just opened up",
      "Offer returning guests first access to two open weekends.",
      "We have two late spring weekends available.",
    ),
    recipientSelection: { type: "ALL" },
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
    contentDocument: null,
    recipientSelection: { type: "ALL" },
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
    contentDocument: seedEmailDocument(
      "Summer return guest offer",
      "A summer offer for past guests",
      "Returning guest pricing for July stays.",
      "Come back this summer with a returning guest rate.",
    ),
    recipientSelection: { type: "ALL" },
    scheduledAt: null,
    sentAt: null,
    createdAt: atIso("2026-04-05T09:00:00Z"),
  },
];

const seededCampaigns: LiveCampaign[] = [
  {
    id: "camp_0004",
    name: "Easter follow-up",
    status: "SENT",
    channel: "EMAIL",
    subject: "Thanks for staying with us",
    previewText: "Invite recent guests back for summer.",
    contentHtml: "<p>Thanks for staying with us this Easter.</p>",
    contentText: "Thanks for staying with us this Easter.",
    contentDocument: seedEmailDocument(
      "Easter follow-up",
      "Thanks for staying with us",
      "Invite recent guests back for summer.",
      "Thanks for staying with us this Easter.",
    ),
    recipientSelection: { type: "ALL" },
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
    contentDocument: null,
    recipientSelection: { type: "ALL" },
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
    contentDocument: seedEmailDocument(
      "June half-term early access",
      "Early access for June half-term",
      "Past guests can book before public release.",
      "June half-term is open for past guests first.",
    ),
    recipientSelection: { type: "ALL" },
    scheduledAt: atIso("2026-04-25T09:30:00Z"),
    sentAt: null,
    createdAt: atIso("2026-04-10T08:00:00Z"),
  },
];

const seededTemplates: TemplateSummary[] = templateLibrary;

const STORAGE_KEY_DRAFTS = "mock:draftCampaigns";
const STORAGE_KEY_BLOCKS = "mock:savedBlocks";

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    return fallback;
  }
  return fallback;
}

function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

let contacts = [...seededContacts];
let draftCampaigns = loadFromStorage<DraftCampaignDetail>(STORAGE_KEY_DRAFTS, seededDraftCampaigns);
let campaigns = [...seededCampaigns];
let savedBlocks = loadFromStorage<SavedEmailBlock>(STORAGE_KEY_BLOCKS, []);

const toCampaignSummary = (campaign: LiveCampaign): CampaignSummary => ({
  id: campaign.id,
  name: campaign.name,
  status: campaign.status,
  channel: campaign.channel,
  subject: campaign.subject,
  recipientCount: countRecipients(campaign.recipientSelection),
  recipientSelection: campaign.recipientSelection,
  scheduledAt: campaign.scheduledAt,
  sentAt: campaign.sentAt,
  openRate: campaign.status === "SENT" ? 0.42 : null,
  clickRate: campaign.status === "SENT" ? 0.11 : null,
  createdAt: campaign.createdAt,
});

const toDraftCampaignAsCampaignSummary = (campaign: DraftCampaignDetail): CampaignSummary => ({
  id: campaign.id,
  name: campaign.name,
  status: "DRAFT",
  channel: campaign.channel,
  subject: campaign.subject,
  recipientCount: countRecipients(campaign.recipientSelection),
  recipientSelection: campaign.recipientSelection,
  scheduledAt: null,
  sentAt: null,
  openRate: null,
  clickRate: null,
  createdAt: campaign.createdAt,
});

const countRecipients = (selection: CampaignDetail["recipientSelection"]) => {
  if (selection.type === "ALL") {
    return contacts.length;
  }

  if (selection.type === "CONTACTS") {
    return selection.contactIds.length;
  }

  return selection.groupIds.length;
};

const toDraftCampaignSummary = (campaign: DraftCampaignDetail): DraftCampaignSummary => ({
  id: campaign.id,
  name: campaign.name,
  status: "DRAFT",
  channel: campaign.channel,
  subject: campaign.subject,
  previewText: campaign.previewText,
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
    draftCampaignCount: draftCampaigns.length,
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
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  source?: ContactSummary["source"];
  status?: ContactSummary["status"];
}) => {
  const normalizedSearch = search?.toLowerCase().trim();
  const filtered = contacts.filter((contact) => {
    if (status && contact.status !== status) {
      return false;
    }

    if (source && contact.source !== source) {
      return false;
    }

    if (normalizedSearch) {
      const haystack = `${contact.firstName} ${contact.lastName} ${contact.email ?? ""} ${contact.phone ?? ""}`.toLowerCase();
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
    emailMarketing: contact.emailMarketing,
    smsMarketing: contact.smsMarketing,
    source: contact.source,
    createdAt: contact.createdAt,
    lastContactedAt: contact.lastContactedAt,
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
  const createdAt = new Date().toISOString();
  const contact: ContactDetail = {
    id: createId("contact", contacts.length + 1),
    firstName: request.firstName,
    lastName: request.lastName,
    email: request.email ?? null,
    phone: request.phone ?? null,
    status: request.consents.emailMarketing || request.consents.smsMarketing ? "SUBSCRIBED" : "UNSUBSCRIBED",
    emailMarketing: request.consents.emailMarketing,
    smsMarketing: request.consents.smsMarketing,
    source: "MANUAL_ENTRY",
    createdAt,
    lastContactedAt: null,
    lastBookingAt: null,
    consents: {
      ...request.consents,
      capturedAt: createdAt,
      emailUnsubscribedAt: null,
      smsUnsubscribedAt: null,
    },
  };

  contacts = [contact, ...contacts];
  return { id: contact.id };
};

export const importContacts = (requests: CreateContactsRequest["contacts"]) => {
  if (requests.length === 0) {
    return {
      importId: "import_0001",
      status: "FAILED" as const,
      totalRows: 0,
      importedRows: 0,
      failedRows: 0,
      errors: [{ rowNumber: 1, message: "No contacts were provided" }],
    };
  }

  const errors: Array<{ rowNumber: number; message: string }> = [];
  const importedContacts: ContactDetail[] = [];

  requests.forEach((request, index) => {
    const rowNumber = index + 2;
    const parsed = createContactRequestSchema.safeParse(request);

    if (!parsed.success) {
      errors.push({ rowNumber, message: parsed.error.issues[0]?.message ?? "Contact row is invalid" });
      return;
    }

    const validRequest = parsed.data;
    const email = validRequest.email ?? null;
    const phone = validRequest.phone ?? null;
    const emailMarketing = validRequest.consents.emailMarketing;
    const smsMarketing = validRequest.consents.smsMarketing;

    const createdAt = new Date().toISOString();
    importedContacts.push({
      id: createId("contact", contacts.length + importedContacts.length + 1),
      firstName: validRequest.firstName.trim(),
      lastName: validRequest.lastName.trim(),
      email,
      phone,
      status: emailMarketing || smsMarketing ? "SUBSCRIBED" : "UNSUBSCRIBED",
      emailMarketing,
      smsMarketing,
      source: "MANUAL_ENTRY",
      createdAt,
      lastContactedAt: null,
      lastBookingAt: null,
      consents: {
        emailMarketing,
        smsMarketing,
        capturedAt: createdAt,
        emailUnsubscribedAt: null,
        smsUnsubscribedAt: null,
      },
    });
  });

  if (errors.length === 0) {
    contacts = [...importedContacts, ...contacts];
  }

  return {
    importId: "import_0001",
    status: errors.length > 0 ? ("FAILED" as const) : ("COMPLETED" as const),
    totalRows: requests.length,
    importedRows: errors.length > 0 ? 0 : importedContacts.length,
    failedRows: errors.length > 0 ? requests.length : 0,
    errors,
  };
};

export const listDraftCampaigns = () => ({
  items: sortByCreatedAtDesc(draftCampaigns).map(toDraftCampaignSummary),
  page: 1,
  pageSize: draftCampaigns.length,
  totalItems: draftCampaigns.length,
  totalPages: 1,
});

export const listCampaigns = ({
  page = 1,
  pageSize = 10,
  channel,
  status,
  sortDirection = "desc",
}: GetCampaignsQuery = {}) => {
  const sourceItems =
    status === "DRAFT"
      ? draftCampaigns.map(toDraftCampaignAsCampaignSummary)
      : campaigns.map(toCampaignSummary);

  const filtered = sourceItems
    .filter((campaign) => (channel ? campaign.channel === channel : true))
    .filter((campaign) => (status ? campaign.status === status : true))
    .sort((left, right) => {
      const leftDate = left.sentAt ?? left.scheduledAt ?? left.createdAt;
      const rightDate = right.sentAt ?? right.scheduledAt ?? right.createdAt;
      return sortDirection === "desc" ? rightDate.localeCompare(leftDate) : leftDate.localeCompare(rightDate);
    });

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    items,
    page,
    pageSize,
    totalItems: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
  };
};

export const getCampaignById = (campaignId: string) =>
  draftCampaigns.find((campaign) => campaign.id === campaignId) ??
  campaigns.find((campaign) => campaign.id === campaignId) ??
  null;

export const createCampaign = (request: CreateCampaignRequest) => {
  const campaign: DraftCampaignDetail = {
    id: createId("camp", draftCampaigns.length + campaigns.length + 1),
    status: "DRAFT",
    createdAt: new Date().toISOString(),
    scheduledAt: null,
    sentAt: null,
    ...request,
  };

  draftCampaigns = [campaign, ...draftCampaigns];
  persist(STORAGE_KEY_DRAFTS, draftCampaigns);
  return { id: campaign.id };
};

export const deleteCampaign = (campaignId: string) => {
  draftCampaigns = draftCampaigns.filter((c) => c.id !== campaignId);
  persist(STORAGE_KEY_DRAFTS, draftCampaigns);
};

export const updateCampaign = (campaignId: string, request: CreateCampaignRequest) => {
  draftCampaigns = draftCampaigns.map((campaign) =>
    campaign.id === campaignId
      ? {
          ...campaign,
          ...request,
        }
      : campaign,
  );

  persist(STORAGE_KEY_DRAFTS, draftCampaigns);
  return { id: campaignId };
};

export const sendCampaign = (campaignId: string, request: SendCampaignRequest) => {
  const draft = draftCampaigns.find((campaign) => campaign.id === campaignId);

  if (draft) {
    const nextCampaign: LiveCampaign = {
      ...draft,
      status: request.sendMode === "IMMEDIATE" ? "SENT" : "SCHEDULED",
      sentAt: request.sendMode === "IMMEDIATE" ? new Date().toISOString() : null,
      scheduledAt: request.sendMode === "SCHEDULED" ? request.scheduledAt ?? null : null,
    };

    draftCampaigns = draftCampaigns.filter((campaign) => campaign.id !== campaignId);
    campaigns = [nextCampaign, ...campaigns];
    persist(STORAGE_KEY_DRAFTS, draftCampaigns);

    return {
      id: campaignId,
      status: nextCampaign.status,
      scheduledAt: nextCampaign.scheduledAt,
    };
  }

  return {
    id: campaignId,
    status: request.sendMode === "IMMEDIATE" ? ("SENT" as const) : ("SCHEDULED" as const),
    scheduledAt: request.sendMode === "SCHEDULED" ? request.scheduledAt ?? null : null,
  };
};

export const listSavedBlocks = () => ({
  items: [...savedBlocks].sort((left, right) => right.savedAt.localeCompare(left.savedAt)),
});

export const createSavedBlock = (request: CreateSavedEmailBlockRequest) => {
  const savedBlock: SavedEmailBlock = {
    id: createId("saved_block", savedBlocks.length + 1),
    name: request.name.trim(),
    block: request.block,
    savedAt: new Date().toISOString(),
  };

  savedBlocks = [savedBlock, ...savedBlocks];
  persist(STORAGE_KEY_BLOCKS, savedBlocks);
  return { id: savedBlock.id };
};

export const deleteSavedBlock = (savedBlockId: string) => {
  savedBlocks = savedBlocks.filter((savedBlock) => savedBlock.id !== savedBlockId);
  persist(STORAGE_KEY_BLOCKS, savedBlocks);
};

export const listTemplates = () => ({ items: seededTemplates });

export const resetMarketingState = () => {
  contacts = [...seededContacts];
  draftCampaigns = [...seededDraftCampaigns];
  campaigns = [...seededCampaigns];
  savedBlocks = [];
  try {
    localStorage.removeItem(STORAGE_KEY_DRAFTS);
    localStorage.removeItem(STORAGE_KEY_BLOCKS);
  } catch {
    return;
  }
};
