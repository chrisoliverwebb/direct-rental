import { z } from "zod";
import { createPaginatedResponseSchema, isoDateStringSchema } from "@repo/shared";

export const campaignStatusSchema = z.enum(["DRAFT", "SCHEDULED", "SENT"]);
export const campaignChannelSchema = z.enum(["EMAIL", "SMS"]);
export const contactStatusSchema = z.enum(["SUBSCRIBED", "UNSUBSCRIBED"]);
export const contactSourceSchema = z.enum([
  "MANUAL_IMPORT",
  "CSV_IMPORT",
  "MANUAL_ENTRY",
  "WIFI_CAPTURE",
]);

export const campaignSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  status: campaignStatusSchema,
  channel: campaignChannelSchema,
  subject: z.string().nullable(),
  recipientCount: z.number().int().min(0),
  scheduledAt: isoDateStringSchema.nullable(),
  sentAt: isoDateStringSchema.nullable(),
  openRate: z.number().min(0).max(1).nullable(),
  clickRate: z.number().min(0).max(1).nullable(),
  createdAt: isoDateStringSchema,
});

export type CampaignSummary = z.infer<typeof campaignSummarySchema>;

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
  email: z.email(),
  phone: z.string().nullable(),
  status: contactStatusSchema,
  source: contactSourceSchema,
  propertyId: z.string(),
  propertyName: z.string(),
  createdAt: isoDateStringSchema,
  lastBookingAt: isoDateStringSchema.nullable(),
});

export type ContactSummary = z.infer<typeof contactSummarySchema>;

export const getContactsQuerySchema = z.object({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  search: z.string().trim().min(1).optional(),
  status: contactStatusSchema.optional(),
  source: contactSourceSchema.optional(),
  propertyId: z.string().trim().min(1).optional(),
});

export type GetContactsQuery = z.infer<typeof getContactsQuerySchema>;

export const contactConsentSchema = z.object({
  emailMarketing: z.boolean(),
  smsMarketing: z.boolean(),
  capturedAt: isoDateStringSchema,
});

export const contactDetailSchema = contactSummarySchema.extend({
  notes: z.string().nullable(),
  consents: contactConsentSchema,
});

export type ContactDetail = z.infer<typeof contactDetailSchema>;

export const createContactRequestSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.email("Enter a valid email address"),
  phone: z.string().trim().nullable().optional(),
  propertyId: z.string().trim().min(1),
  notes: z.string().trim().nullable().optional(),
  consents: z.object({
    emailMarketing: z.boolean(),
    smsMarketing: z.boolean(),
  }),
});

export type CreateContactRequest = z.infer<typeof createContactRequestSchema>;

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

export const campaignDetailSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  status: campaignStatusSchema,
  channel: campaignChannelSchema,
  subject: z.string().nullable(),
  previewText: z.string().nullable(),
  contentHtml: z.string().min(1),
  contentText: z.string().min(1),
  recipientSelection: z.object({
    type: z.literal("ALL_SUBSCRIBED"),
  }),
  scheduledAt: isoDateStringSchema.nullable(),
  sentAt: isoDateStringSchema.nullable(),
  createdAt: isoDateStringSchema,
});

export type CampaignDetail = z.infer<typeof campaignDetailSchema>;

export const createCampaignRequestSchema = z
  .object({
    name: z.string().trim().min(1, "Campaign name is required"),
    channel: campaignChannelSchema,
    subject: z.string().nullable(),
    previewText: z.string().nullable(),
    contentHtml: z.string().trim().min(1, "HTML content is required"),
    contentText: z.string().trim().min(1, "Plain text content is required"),
    recipientSelection: z.object({
      type: z.literal("ALL_SUBSCRIBED"),
    }),
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

export const sendCampaignRequestSchema = z.object({
  sendMode: z.literal("IMMEDIATE"),
});

export type SendCampaignRequest = z.infer<typeof sendCampaignRequestSchema>;

export const sendCampaignResponseSchema = z.object({
  id: z.string(),
  status: z.literal("SENT"),
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

export const contactListResponseSchema = createPaginatedResponseSchema(contactSummarySchema);
export const campaignListResponseSchema = createPaginatedResponseSchema(campaignSummarySchema);
