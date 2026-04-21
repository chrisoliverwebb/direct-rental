import {
  emailBlockStylesSchema,
  templateSummarySchema,
  type EmailBlock,
  type EmailColumn,
  type EmailDocument,
  type TemplateSummary,
} from "@repo/api-contracts";
import { renderEmailDocumentToHtml, renderEmailDocumentToText } from "@repo/marketing";
import { parse } from "yaml";
import { z } from "zod";
import {
  bankHolidayReminderTemplateYaml,
  directBookingNudgeTemplateYaml,
  lastMinuteAvailabilityTemplateYaml,
  repeatGuestDiscountTemplateYaml,
  summerReturnOfferTemplateYaml,
} from "./registry";

const repoTextValueSchema = z.object({
  text: z.string(),
});

type RepoBlock =
  | RepoTextBlock
  | RepoImageBlock
  | RepoButtonBlock
  | RepoSpacerBlock
  | RepoDividerBlock
  | RepoColumnsBlock
  | RepoGroupBlock;

type RepoColumn = {
  blocks: RepoBlock[];
};

type RepoTextBlock = {
  type: "text";
  textStyle: "p" | "h1" | "h2" | "h3";
  styles?: z.infer<typeof emailBlockStylesSchema>;
  content: z.infer<typeof repoTextValueSchema>;
};

const repoTextBlockSchema = z.object({
  type: z.literal("text"),
  textStyle: z.enum(["p", "h1", "h2", "h3"]).default("p"),
  styles: emailBlockStylesSchema.optional(),
  content: repoTextValueSchema,
}) as z.ZodType<RepoTextBlock>;

type RepoImageBlock = {
  type: "image";
  styles?: z.infer<typeof emailBlockStylesSchema>;
  sourceType: "upload" | "url";
  imageUrl?: string | null;
  uploadedImageData?: string | null;
  alt: string;
  href?: string | null;
  width: "full" | number;
  height?: number | null;
  fit: "cover" | "contain" | "fill";
};

const repoImageBlockSchema = z.object({
  type: z.literal("image"),
  styles: emailBlockStylesSchema.optional(),
  sourceType: z.enum(["upload", "url"]).default("upload"),
  imageUrl: z.string().trim().nullable().optional(),
  uploadedImageData: z.string().trim().nullable().optional(),
  alt: z.string().default(""),
  href: z.string().trim().nullable().optional(),
  width: z.union([z.literal("full"), z.number().int().min(1)]).default("full"),
  height: z.number().int().min(1).nullable().optional(),
  fit: z.enum(["cover", "contain", "fill"]).default("cover"),
}) as z.ZodType<RepoImageBlock>;

type RepoButtonBlock = {
  type: "button";
  styles?: z.infer<typeof emailBlockStylesSchema>;
  label: z.infer<typeof repoTextValueSchema>;
  href: string;
  alignment: "left" | "center" | "right";
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
};

const repoButtonBlockSchema = z.object({
  type: z.literal("button"),
  styles: emailBlockStylesSchema.optional(),
  label: repoTextValueSchema,
  href: z.string().trim(),
  alignment: z.enum(["left", "center", "right"]).default("center"),
  buttonBackgroundColor: z.string().optional(),
  buttonTextColor: z.string().optional(),
}) as z.ZodType<RepoButtonBlock>;

type RepoSpacerBlock = {
  type: "spacer";
  styles?: z.infer<typeof emailBlockStylesSchema>;
  height: number;
};

const repoSpacerBlockSchema = z.object({
  type: z.literal("spacer"),
  styles: emailBlockStylesSchema.optional(),
  height: z.number().int().min(0),
}) as z.ZodType<RepoSpacerBlock>;

type RepoDividerBlock = {
  type: "divider";
  styles?: z.infer<typeof emailBlockStylesSchema>;
  color?: string;
  thickness: number;
};

const repoDividerBlockSchema = z.object({
  type: z.literal("divider"),
  styles: emailBlockStylesSchema.optional(),
  color: z.string().optional(),
  thickness: z.number().int().min(1),
}) as z.ZodType<RepoDividerBlock>;

type RepoColumnsBlock = {
  type: "columns";
  styles?: z.infer<typeof emailBlockStylesSchema>;
  layout: "50-50" | "33-66" | "66-33";
  columns: [RepoColumn, RepoColumn];
};

type RepoGroupBlock = {
  type: "group";
  styles?: z.infer<typeof emailBlockStylesSchema>;
  blocks: RepoBlock[];
};

const repoBlockSchema: z.ZodType<RepoBlock> = z.lazy(() =>
  z.union([
    repoTextBlockSchema,
    repoImageBlockSchema,
    repoButtonBlockSchema,
    repoSpacerBlockSchema,
    repoDividerBlockSchema,
    z.object({
      type: z.literal("columns"),
      styles: emailBlockStylesSchema.optional(),
      layout: z.enum(["50-50", "33-66", "66-33"]),
      columns: z.tuple([
        z.object({ blocks: z.array(z.lazy(() => repoBlockSchema)) }),
        z.object({ blocks: z.array(z.lazy(() => repoBlockSchema)) }),
      ]),
    }),
    z.object({
      type: z.literal("group"),
      styles: emailBlockStylesSchema.optional(),
      blocks: z.array(z.lazy(() => repoBlockSchema)),
    }),
  ]),
) as z.ZodType<RepoBlock>;

const repoColumnSchema = z.object({
  blocks: z.array(z.lazy(() => repoBlockSchema)),
}) as z.ZodType<RepoColumn>;

const repoColumnsBlockSchema = z.object({
  type: z.literal("columns"),
  styles: emailBlockStylesSchema.optional(),
  layout: z.enum(["50-50", "33-66", "66-33"]),
  columns: z.tuple([repoColumnSchema, repoColumnSchema]),
}) as z.ZodType<RepoColumnsBlock>;

const repoGroupBlockSchema = z.object({
  type: z.literal("group"),
  styles: emailBlockStylesSchema.optional(),
  blocks: z.array(z.lazy(() => repoBlockSchema)),
}) as z.ZodType<RepoGroupBlock>;

const repoEmailDocumentSchema = z.object({
  name: z.string(),
  subject: z.string(),
  previewText: z.string(),
  blocks: z.array(repoBlockSchema),
});

const repoTemplateDefinitionSchema = z.discriminatedUnion("channel", [
  z.object({
    name: z.string(),
    channel: z.literal("EMAIL"),
    description: z.string(),
    subject: z.string(),
    previewText: z.string(),
    thumbnailUrl: z.string().nullable().default(null),
    contentDocument: repoEmailDocumentSchema,
  }),
  z.object({
    name: z.string(),
    channel: z.literal("SMS"),
    description: z.string(),
    subject: z.null(),
    previewText: z.string(),
    thumbnailUrl: z.string().nullable().default(null),
    contentText: z.string().min(1),
  }),
]);

type RepoTemplateDefinition = z.infer<typeof repoTemplateDefinitionSchema>;

const repoTemplateSources = [
  lastMinuteAvailabilityTemplateYaml,
  summerReturnOfferTemplateYaml,
  bankHolidayReminderTemplateYaml,
  repeatGuestDiscountTemplateYaml,
  directBookingNudgeTemplateYaml,
];

export const templateLibrary: TemplateSummary[] = repoTemplateSources.map((source) => {
  const parsed = repoTemplateDefinitionSchema.parse(parse(source)) as RepoTemplateDefinition;
  const id = slugify(parsed.name);

  if (parsed.channel === "EMAIL") {
    const contentDocument = buildEmailDocument(parsed.contentDocument);

    return templateSummarySchema.parse({
      id,
      name: parsed.name,
      channel: parsed.channel,
      description: parsed.description,
      subject: parsed.subject,
      previewText: parsed.previewText,
      contentDocument,
      contentHtml: renderEmailDocumentToHtml(contentDocument),
      contentText: renderEmailDocumentToText(contentDocument),
      thumbnailUrl: parsed.thumbnailUrl,
    });
  }

  return templateSummarySchema.parse({
    id,
    name: parsed.name,
    channel: parsed.channel,
    description: parsed.description,
    subject: parsed.subject,
    previewText: parsed.previewText,
    contentDocument: null,
    contentHtml: `<p>${escapeHtml(parsed.contentText)}</p>`,
    contentText: parsed.contentText,
    thumbnailUrl: parsed.thumbnailUrl,
  });
});

function buildEmailDocument(document: z.infer<typeof repoEmailDocumentSchema>): EmailDocument {
  return {
    id: createId("email"),
    name: document.name,
    subject: document.subject,
    previewText: document.previewText,
    blocks: document.blocks.map((block) => buildBlock(block)),
  };
}

function buildColumn(column: RepoColumn): EmailColumn {
  return {
    id: createId("column"),
    blocks: column.blocks.map((block) => buildBlock(block)),
  };
}

function buildBlock(block: RepoBlock): EmailBlock {
  switch (block.type) {
    case "text":
      return {
        id: createId("text"),
        type: "text",
        textStyle: block.textStyle,
        styles: block.styles,
        content: {
          text: block.content.text,
          html: `<p>${escapeHtml(block.content.text)}</p>`,
        },
      };
    case "image":
      return {
        id: createId("image"),
        type: "image",
        styles: block.styles,
        sourceType: block.sourceType,
        imageUrl: block.imageUrl ?? null,
        uploadedImageData: block.uploadedImageData ?? null,
        alt: block.alt,
        href: block.href ?? null,
        width: block.width,
        height: block.height ?? null,
        fit: block.fit,
      };
    case "button":
      return {
        id: createId("button"),
        type: "button",
        styles: block.styles,
        label: {
          text: block.label.text,
          html: `<p>${escapeHtml(block.label.text)}</p>`,
        },
        href: block.href,
        alignment: block.alignment,
        buttonBackgroundColor: block.buttonBackgroundColor,
        buttonTextColor: block.buttonTextColor,
      };
    case "spacer":
      return {
        id: createId("spacer"),
        type: "spacer",
        styles: block.styles,
        height: block.height,
      };
    case "divider":
      return {
        id: createId("divider"),
        type: "divider",
        styles: block.styles,
        color: block.color,
        thickness: block.thickness,
      };
    case "columns":
      return {
        id: createId("columns"),
        type: "columns",
        styles: block.styles,
        layout: block.layout,
        columns: [buildColumn(block.columns[0]), buildColumn(block.columns[1])],
      };
    case "group":
      return {
        id: createId("group"),
        type: "group",
        styles: block.styles,
        blocks: block.blocks.map((child) => buildBlock(child)),
      };
  }
}

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
