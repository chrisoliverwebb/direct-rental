import { parse } from "yaml";
import { z } from "zod";
import { slugify } from "../../shared";
import type { CampaignTemplateDefinition } from "./CampaignTemplateDefinition";
import {
  bankHolidayReminderTemplateYaml,
  directBookingNudgeTemplateYaml,
  lastMinuteAvailabilityTemplateYaml,
  repeatGuestDiscountTemplateYaml,
  summerReturnOfferTemplateYaml,
} from "../../registry";

const campaignTemplateSchema = z.discriminatedUnion("channel", [
  z.object({
    name: z.string(),
    channel: z.literal("EMAIL"),
    description: z.string(),
    category: z.string().default("campaign"),
    tags: z.array(z.string()).default([]),
    subject: z.string(),
    previewText: z.string(),
    layoutId: z.string(),
    starterContent: z.record(z.string(), z.unknown()),
    previewThumbnail: z.string().nullable().optional(),
    audience: z.enum(["past-guests", "upcoming", "all"]).optional(),
    goal: z.enum(["rebook", "inform", "engage"]).optional(),
  }),
  z.object({
    name: z.string(),
    channel: z.literal("SMS"),
    description: z.string(),
    category: z.string().default("campaign"),
    tags: z.array(z.string()).default([]),
    subject: z.null().optional(),
    previewText: z.string().nullable().optional(),
    starterContent: z.record(z.string(), z.unknown()),
    previewThumbnail: z.string().nullable().optional(),
    audience: z.enum(["past-guests", "upcoming", "all"]).optional(),
    goal: z.enum(["rebook", "inform", "engage"]).optional(),
  }),
]);

const campaignTemplateSources = [
  lastMinuteAvailabilityTemplateYaml,
  summerReturnOfferTemplateYaml,
  repeatGuestDiscountTemplateYaml,
  bankHolidayReminderTemplateYaml,
  directBookingNudgeTemplateYaml,
];

const campaignTemplates: CampaignTemplateDefinition[] = campaignTemplateSources.map((source) => {
  const parsed = campaignTemplateSchema.parse(parse(source));

  return {
    id: slugify(parsed.name),
    name: parsed.name,
    description: parsed.description,
    category: parsed.category,
    tags: parsed.tags,
    channel: parsed.channel,
    layoutId: "layoutId" in parsed ? parsed.layoutId : undefined,
    starterContent: parsed.starterContent,
    previewThumbnail: parsed.previewThumbnail ?? null,
    audience: parsed.audience,
    goal: parsed.goal,
    subject: "subject" in parsed ? parsed.subject ?? null : null,
    previewText: parsed.previewText ?? null,
  };
});

export function getCampaignTemplates(channel?: CampaignTemplateDefinition["channel"]) {
  return channel ? campaignTemplates.filter((template) => template.channel === channel) : campaignTemplates;
}

export function getCampaignTemplateById(templateId: string) {
  return campaignTemplates.find((template) => template.id === templateId) ?? null;
}
