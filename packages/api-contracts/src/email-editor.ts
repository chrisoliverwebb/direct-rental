import { z } from "zod";

export const emailTextContentSchema = z.object({
  html: z.string(),
  text: z.string(),
});

export type EmailTextContent = z.infer<typeof emailTextContentSchema>;

export const emailTextStyleSchema = z.enum(["p", "h1", "h2", "h3"]);

export type EmailTextStyle = z.infer<typeof emailTextStyleSchema>;

export const emailBlockStylesSchema = z.object({
  paddingTop: z.number().int().min(0).optional(),
  paddingRight: z.number().int().min(0).optional(),
  paddingBottom: z.number().int().min(0).optional(),
  paddingLeft: z.number().int().min(0).optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  lineHeight: z.string().optional(),
  fontStyle: z.string().optional(),
  textDecoration: z.string().optional(),
  borderRadius: z.number().int().min(0).optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
});

export type EmailBlockStyles = z.infer<typeof emailBlockStylesSchema>;

const emailBaseBlockSchema = z.object({
  id: z.string().min(1),
  styles: emailBlockStylesSchema.optional(),
});

export const emailTextBlockSchema = emailBaseBlockSchema.extend({
  type: z.literal("text"),
  textStyle: emailTextStyleSchema.default("p"),
  content: emailTextContentSchema,
});

export type EmailTextBlock = z.infer<typeof emailTextBlockSchema>;

export const emailHeaderBlockSchema = emailBaseBlockSchema.extend({
  type: z.literal("header"),
  logoUrl: z.string().trim().nullable().optional(),
  title: emailTextContentSchema,
  subtitle: emailTextContentSchema,
});

export type EmailHeaderBlock = z.infer<typeof emailHeaderBlockSchema>;

export const emailImageBlockSchema = emailBaseBlockSchema.extend({
  type: z.literal("image"),
  sourceType: z.enum(["upload", "url"]).default("upload"),
  imageUrl: z.string().trim().nullable().optional(),
  uploadedImageData: z.string().trim().nullable().optional(),
  alt: z.string().trim(),
  href: z.string().trim().nullable().optional(),
  width: z.union([z.literal("full"), z.number().int().min(1)]).default("full"),
  height: z.number().int().min(1).nullable().optional(),
  fit: z.enum(["cover", "contain", "fill"]).default("cover"),
});

export type EmailImageBlock = z.infer<typeof emailImageBlockSchema>;

export const emailButtonBlockSchema = emailBaseBlockSchema.extend({
  type: z.literal("button"),
  label: emailTextContentSchema,
  href: z.string().trim(),
  alignment: z.enum(["left", "center", "right"]).default("center"),
  buttonBackgroundColor: z.string().optional(),
  buttonTextColor: z.string().optional(),
});

export type EmailButtonBlock = z.infer<typeof emailButtonBlockSchema>;

export const emailSpacerBlockSchema = emailBaseBlockSchema.extend({
  type: z.literal("spacer"),
  height: z.number().int().min(0),
});

export type EmailSpacerBlock = z.infer<typeof emailSpacerBlockSchema>;

export const emailDividerBlockSchema = emailBaseBlockSchema.extend({
  type: z.literal("divider"),
  color: z.string().optional(),
  thickness: z.number().int().min(1),
});

export type EmailDividerBlock = z.infer<typeof emailDividerBlockSchema>;

export type EmailColumn = {
  id: string;
  blocks: EmailBlock[];
};

export const emailColumnSchema = z.object({
  id: z.string().min(1),
  blocks: z.array(z.lazy(() => emailBlockSchema)),
}) as z.ZodType<EmailColumn>;

export type EmailColumnsBlock = {
  id: string;
  styles?: EmailBlockStyles;
  type: "columns";
  layout: "50-50" | "33-66" | "66-33";
  columns: EmailColumn[];
};

export const emailColumnsBlockSchema = emailBaseBlockSchema.extend({
  type: z.literal("columns"),
  layout: z.enum(["50-50", "33-66", "66-33"]),
  columns: z.array(emailColumnSchema).length(2),
}) as z.ZodType<EmailColumnsBlock>;

export const emailFooterBlockSchema = emailBaseBlockSchema.extend({
  type: z.literal("footer"),
  content: emailTextContentSchema,
});

export type EmailFooterBlock = z.infer<typeof emailFooterBlockSchema>;

export type EmailGroupBlock = {
  id: string;
  styles?: EmailBlockStyles;
  type: "group";
  blocks: EmailBlock[];
};

export const emailGroupBlockSchema = emailBaseBlockSchema.extend({
  type: z.literal("group"),
  blocks: z.array(z.lazy(() => emailBlockSchema)),
}) as z.ZodType<EmailGroupBlock>;

export type EmailBlock =
  | EmailTextBlock
  | EmailHeaderBlock
  | EmailImageBlock
  | EmailButtonBlock
  | EmailSpacerBlock
  | EmailDividerBlock
  | EmailColumnsBlock
  | EmailFooterBlock
  | EmailGroupBlock;

export const emailBlockSchema = z.discriminatedUnion("type", [
  emailTextBlockSchema,
  emailHeaderBlockSchema,
  emailImageBlockSchema,
  emailButtonBlockSchema,
  emailSpacerBlockSchema,
  emailDividerBlockSchema,
  emailColumnsBlockSchema,
  emailFooterBlockSchema,
  emailGroupBlockSchema,
  ] as any) as unknown as z.ZodType<EmailBlock>;

export const emailDocumentSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  subject: z.string(),
  previewText: z.string(),
  blocks: z.array(emailBlockSchema),
});

export type EmailDocument = z.infer<typeof emailDocumentSchema>;
