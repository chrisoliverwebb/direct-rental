import { z } from "zod";
import { createPaginatedResponseSchema, isoDateStringSchema } from "@repo/shared";
import { emailBlockSchema, emailDocumentSchema } from "./email-editor";

export const campaignStatusSchema = z.enum(["DRAFT", "SCHEDULED", "SENT"]);
export const draftCampaignStatusSchema = z.literal("DRAFT");
export const publishedCampaignStatusSchema = z.enum(["SCHEDULED", "SENT"]);
export const campaignChannelSchema = z.enum(["EMAIL", "SMS"]);
export const contactStatusSchema = z.enum(["SUBSCRIBED", "UNSUBSCRIBED"]);
export const contactSourceSchema = z.enum([
  "MANUAL_ENTRY",
  "DIRECT_BOOKING",
]);

export const campaignRecipientSelectionSchema = z.union([
  z.object({
    type: z.literal("ALL"),
  }),
  z.object({
    type: z.literal("CONTACTS"),
    contactIds: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    type: z.literal("GROUPS"),
    groupIds: z.array(z.string().min(1)).min(1),
  }),
]);

export type CampaignRecipientSelection = z.infer<typeof campaignRecipientSelectionSchema>;

export const campaignSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  status: publishedCampaignStatusSchema,
  channel: campaignChannelSchema,
  subject: z.string().nullable(),
  recipientCount: z.number().int().min(0),
  recipientSelection: campaignRecipientSelectionSchema,
  scheduledAt: isoDateStringSchema.nullable(),
  sentAt: isoDateStringSchema.nullable(),
  openRate: z.number().min(0).max(1).nullable(),
  clickRate: z.number().min(0).max(1).nullable(),
  createdAt: isoDateStringSchema,
});

export type CampaignSummary = z.infer<typeof campaignSummarySchema>;

export const draftCampaignSummarySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  status: draftCampaignStatusSchema,
  channel: campaignChannelSchema,
  subject: z.string().nullable(),
  previewText: z.string().nullable(),
  createdAt: isoDateStringSchema,
});

export type DraftCampaignSummary = z.infer<typeof draftCampaignSummarySchema>;

export const scheduledCampaignSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.literal("SCHEDULED"),
  channel: campaignChannelSchema,
  scheduledAt: isoDateStringSchema,
});

export type ScheduledCampaignSummary = z.infer<typeof scheduledCampaignSummarySchema>;

export const marketingDashboardSchema = z.object({
  contactCount: z.number().int().min(0),
  subscribedContactCount: z.number().int().min(0),
  unsubscribedContactCount: z.number().int().min(0),
  campaignCount: z.number().int().min(0),
  sentCampaignCount: z.number().int().min(0),
  draftCampaignCount: z.number().int().min(0),
  recentCampaigns: z.array(campaignSummarySchema),
  upcomingCampaigns: z.array(scheduledCampaignSummarySchema),
});

export type MarketingDashboard = z.infer<typeof marketingDashboardSchema>;

export const contactSummarySchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email().nullable(),
  phone: z.string().nullable(),
  status: contactStatusSchema,
  emailMarketing: z.boolean(),
  smsMarketing: z.boolean(),
  source: contactSourceSchema,
  createdAt: isoDateStringSchema,
  lastContactedAt: isoDateStringSchema.nullable(),
  lastBookingAt: isoDateStringSchema.nullable(),
});

export type ContactSummary = z.infer<typeof contactSummarySchema>;

export const getContactsQuerySchema = z.object({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  search: z.string().trim().min(1).optional(),
  status: contactStatusSchema.optional(),
  source: contactSourceSchema.optional(),
});

export type GetContactsQuery = z.infer<typeof getContactsQuerySchema>;

export const getCampaignsQuerySchema = z.object({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  channel: campaignChannelSchema.optional(),
  status: publishedCampaignStatusSchema.optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export type GetCampaignsQuery = z.infer<typeof getCampaignsQuerySchema>;

export const contactConsentSchema = z.object({
  emailMarketing: z.boolean(),
  smsMarketing: z.boolean(),
  capturedAt: isoDateStringSchema,
  emailUnsubscribedAt: isoDateStringSchema.nullable(),
  smsUnsubscribedAt: isoDateStringSchema.nullable(),
});

export const contactDetailSchema = contactSummarySchema.extend({
  consents: contactConsentSchema,
});

export type ContactDetail = z.infer<typeof contactDetailSchema>;

export const createContactRequestSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.email("Enter a valid email address").nullable().optional(),
  ),
  phone: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().nullable().optional(),
  ),
  consents: z.object({
    emailMarketing: z.boolean(),
    smsMarketing: z.boolean(),
  }),
}).superRefine((value, ctx) => {
  if (!value.email && !value.phone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["email"],
      message: "Enter at least an email or phone number",
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phone"],
      message: "Enter at least an email or phone number",
    });
  }

  if (value.consents.emailMarketing && !value.email) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["consents", "emailMarketing"],
      message: "Email marketing requires a valid email address",
    });
  }

  if (value.consents.smsMarketing && !value.phone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["consents", "smsMarketing"],
      message: "SMS marketing requires a phone number",
    });
  }
});

export type CreateContactRequest = z.infer<typeof createContactRequestSchema>;

export const createContactsRequestSchema = z.object({
  contacts: z.array(createContactRequestSchema).min(1, "At least one contact is required"),
});

export type CreateContactsRequest = z.infer<typeof createContactsRequestSchema>;

export const createEntityResponseSchema = z.object({
  id: z.string().min(1),
});

export type CreateEntityResponse = z.infer<typeof createEntityResponseSchema>;

export const contactImportErrorSchema = z.object({
  rowNumber: z.number().int().min(1),
  message: z.string(),
});

export const contactImportResultSchema = z.object({
  importId: z.string(),
  status: z.enum(["COMPLETED", "FAILED"]),
  totalRows: z.number().int().min(0),
  importedRows: z.number().int().min(0),
  failedRows: z.number().int().min(0),
  errors: z.array(contactImportErrorSchema),
});

export type ContactImportResult = z.infer<typeof contactImportResultSchema>;

const draftCampaignDetailSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  status: draftCampaignStatusSchema,
  channel: campaignChannelSchema,
  subject: z.string().nullable(),
  previewText: z.string().nullable(),
  contentHtml: z.string().min(1),
  contentText: z.string().min(1),
  contentDocument: emailDocumentSchema.nullable().optional(),
  recipientSelection: campaignRecipientSelectionSchema,
  scheduledAt: isoDateStringSchema.nullable(),
  sentAt: isoDateStringSchema.nullable(),
  createdAt: isoDateStringSchema,
});

export type DraftCampaignDetail = z.infer<typeof draftCampaignDetailSchema>;

const publishedCampaignDetailSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  status: publishedCampaignStatusSchema,
  channel: campaignChannelSchema,
  subject: z.string().nullable(),
  previewText: z.string().nullable(),
  contentHtml: z.string().min(1),
  contentText: z.string().min(1),
  contentDocument: emailDocumentSchema.nullable().optional(),
  recipientSelection: campaignRecipientSelectionSchema,
  scheduledAt: isoDateStringSchema.nullable(),
  sentAt: isoDateStringSchema.nullable(),
  createdAt: isoDateStringSchema,
});

export const campaignDetailSchema = z.union([draftCampaignDetailSchema, publishedCampaignDetailSchema]);

export type CampaignDetail = z.infer<typeof campaignDetailSchema>;

export const createCampaignRequestSchema = z
  .object({
    name: z.string().trim().min(1, "Campaign name is required"),
    channel: campaignChannelSchema,
    subject: z.string().nullable(),
    previewText: z.string().nullable(),
    contentHtml: z.string().trim().min(1, "HTML content is required"),
    contentText: z.string().trim().min(1, "Plain text content is required"),
    contentDocument: emailDocumentSchema.nullable().optional(),
    recipientSelection: campaignRecipientSelectionSchema,
  })
  .superRefine((value, ctx) => {
    if (value.channel === "EMAIL" && !value.subject?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subject"],
        message: "Subject is required for email campaigns",
      });
    }
  });

export type CreateCampaignRequest = z.infer<typeof createCampaignRequestSchema>;

export const updateCampaignRequestSchema = createCampaignRequestSchema;

export type UpdateCampaignRequest = z.infer<typeof updateCampaignRequestSchema>;

export const sendCampaignRequestSchema = z
  .object({
    sendMode: z.enum(["IMMEDIATE", "SCHEDULED"]),
    scheduledAt: isoDateStringSchema.nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.sendMode === "SCHEDULED" && !value.scheduledAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledAt"],
        message: "Choose a scheduled send time",
      });
    }
  });

export type SendCampaignRequest = z.infer<typeof sendCampaignRequestSchema>;

export const sendCampaignResponseSchema = z.object({
  id: z.string(),
  status: z.enum(["SENT", "SCHEDULED"]),
  scheduledAt: isoDateStringSchema.nullable().optional(),
});

export type SendCampaignResponse = z.infer<typeof sendCampaignResponseSchema>;

export const templateSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  channel: campaignChannelSchema,
  subject: z.string().nullable(),
  previewText: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
});

export type TemplateSummary = z.infer<typeof templateSummarySchema>;

export const templateListResponseSchema = z.object({
  items: z.array(templateSummarySchema),
});

export type TemplateListResponse = z.infer<typeof templateListResponseSchema>;

export const savedEmailBlockSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  block: emailBlockSchema,
  savedAt: isoDateStringSchema,
});

export type SavedEmailBlock = z.infer<typeof savedEmailBlockSchema>;

export const createSavedEmailBlockRequestSchema = z.object({
  name: z.string().trim().min(1, "Saved block name is required"),
  block: emailBlockSchema,
});

export type CreateSavedEmailBlockRequest = z.infer<typeof createSavedEmailBlockRequestSchema>;

export const savedEmailBlockListResponseSchema = z.object({
  items: z.array(savedEmailBlockSchema),
});

export type SavedEmailBlockListResponse = z.infer<typeof savedEmailBlockListResponseSchema>;

export const contactListResponseSchema = createPaginatedResponseSchema(contactSummarySchema);
export const campaignListResponseSchema = createPaginatedResponseSchema(campaignSummarySchema);
export const draftCampaignListResponseSchema = createPaginatedResponseSchema(draftCampaignSummarySchema);
