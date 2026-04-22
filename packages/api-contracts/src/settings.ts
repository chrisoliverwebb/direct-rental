import { z } from "zod";

const blankToNull = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const nullableStringField = z.preprocess(blankToNull, z.string().trim().min(1).nullable().optional());
const nullableUrlField = z.preprocess(blankToNull, z.string().trim().url().nullable().optional());
const nullableEmailField = z.preprocess(blankToNull, z.email().nullable().optional());
const nullableIntField = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().int().min(0).nullable().optional(),
);

export const propertyStatusSchema = z.enum(["ACTIVE", "ARCHIVED"]);
export const propertyTypeSchema = z.enum(["COTTAGE", "LODGE", "APARTMENT", "HOUSE", "B_AND_B", "OTHER"]);
export const themeSourceSchema = z.enum(["company", "property"]);
export const buttonStyleSchema = z.enum(["rounded", "soft", "square"]);
export const cornerRadiusSchema = z.enum(["small", "medium", "large"]);
export const spacingScaleSchema = z.enum(["compact", "comfortable", "spacious"]);

export const addressSchema = z.object({
  addressLine1: nullableStringField,
  addressLine2: nullableStringField,
  city: nullableStringField,
  region: nullableStringField,
  postcode: nullableStringField,
  country: nullableStringField,
});

export type Address = z.infer<typeof addressSchema>;

export const companySettingsSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  tradingName: nullableStringField,
  contactEmail: nullableEmailField,
  contactPhone: nullableStringField,
  websiteUrl: nullableUrlField,
  address: addressSchema,
  defaultSenderName: nullableStringField,
  defaultReplyToEmail: nullableEmailField,
  defaultCurrency: nullableStringField,
  defaultTimezone: nullableStringField,
});

export type CompanySettings = z.infer<typeof companySettingsSchema>;

export const propertySettingsSchema = z.object({
  id: z.string().min(1),
  status: propertyStatusSchema,
  name: z.string().trim().min(1, "Property name is required"),
  shortName: nullableStringField,
  propertyType: propertyTypeSchema.nullable().optional(),
  sleeps: nullableIntField,
  bedrooms: nullableIntField,
  bathrooms: nullableIntField,
  bookingEmail: nullableEmailField,
  bookingPhone: nullableStringField,
  websiteUrl: nullableUrlField,
  directBookingUrl: nullableUrlField,
  checkInTime: nullableStringField,
  checkOutTime: nullableStringField,
  address: addressSchema,
  shortDescription: nullableStringField,
  longDescription: nullableStringField,
  heroImageUrl: nullableUrlField,
  galleryImageUrls: z.array(z.string().trim().url()).default([]),
  themeId: nullableStringField,
});

export type PropertySettings = z.infer<typeof propertySettingsSchema>;

export const upsertPropertySettingsSchema = propertySettingsSchema.omit({ id: true, status: true });
export type UpsertPropertySettings = z.infer<typeof upsertPropertySettingsSchema>;

export const brandingSettingsSchema = z.object({
  brandName: nullableStringField,
  logoUrl: nullableUrlField,
  companyThemeId: nullableStringField,
  primaryColour: nullableStringField,
  secondaryColour: nullableStringField,
  accentColour: nullableStringField,
  backgroundColour: nullableStringField,
  textColour: nullableStringField,
  mutedTextColour: nullableStringField,
  headingFont: nullableStringField,
  bodyFont: nullableStringField,
  buttonStyle: buttonStyleSchema.nullable().optional(),
  cornerRadius: cornerRadiusSchema.nullable().optional(),
  spacingScale: spacingScaleSchema.nullable().optional(),
});

export type BrandingSettings = z.infer<typeof brandingSettingsSchema>;

export const propertyCalendarFeedSchema = z.object({
  id: z.string().min(1),
  sourceName: z.string().trim().min(1, "Source name is required"),
  provider: nullableStringField,
  icalUrl: z.string().trim().url("Enter a valid iCal URL"),
});

export type PropertyCalendarFeed = z.infer<typeof propertyCalendarFeedSchema>;

export const upsertPropertyCalendarFeedSchema = propertyCalendarFeedSchema.omit({ id: true });
export type UpsertPropertyCalendarFeed = z.infer<typeof upsertPropertyCalendarFeedSchema>;

export const propertyCalendarSettingsSchema = z.object({
  propertyId: z.string().min(1),
  calendarFeeds: z.array(propertyCalendarFeedSchema),
  minimumStayDefault: nullableIntField,
  maximumStayDefault: nullableIntField,
  availabilityWindowDays: nullableIntField,
});

export type PropertyCalendarSettings = z.infer<typeof propertyCalendarSettingsSchema>;

export const updatePropertyCalendarSettingsSchema = propertyCalendarSettingsSchema.extend({
  calendarFeeds: z.array(
    z.object({
      id: z.string().min(1).optional(),
      sourceName: z.string().trim().min(1, "Source name is required"),
      provider: nullableStringField,
      icalUrl: z.string().trim().url("Enter a valid iCal URL"),
    }),
  ),
});

export type UpdatePropertyCalendarSettings = z.infer<typeof updatePropertyCalendarSettingsSchema>;

export const marketingSettingsSchema = z.object({
  defaultSignOffName: nullableStringField,
  defaultFooterText: nullableStringField,
  defaultPropertyId: nullableStringField,
  defaultThemeSource: themeSourceSchema.nullable().optional(),
  defaultSmsSignOff: nullableStringField,
});

export type MarketingSettings = z.infer<typeof marketingSettingsSchema>;

export const sendingSettingsSchema = z.object({
  emailSenderName: nullableStringField,
  emailSenderAddress: nullableEmailField,
  replyToEmail: nullableEmailField,
  smsEnabled: z.boolean().default(false),
  smsSenderId: nullableStringField,
});

export type SendingSettings = z.infer<typeof sendingSettingsSchema>;

export const settingsOverviewSchema = z.object({
  company: companySettingsSchema,
  properties: z.array(propertySettingsSchema),
  branding: brandingSettingsSchema,
  bookingAvailability: z.array(propertyCalendarSettingsSchema),
  marketing: marketingSettingsSchema,
  sending: sendingSettingsSchema,
});

export type SettingsOverview = z.infer<typeof settingsOverviewSchema>;
