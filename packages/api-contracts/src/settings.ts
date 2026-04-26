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
const nullableLatitudeField = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().min(-90).max(90).nullable().optional(),
);
const nullableLongitudeField = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().min(-180).max(180).nullable().optional(),
);
const imageReferenceSchema = z.string().trim().refine(
  (value) => {
    if (value.startsWith("data:image/")) {
      return true;
    }

    if (value.startsWith("/")) {
      return true;
    }

    return z.url().safeParse(value).success;
  },
  { message: "Enter a valid image URL or uploaded image value" },
);
const nullableImageReferenceField = z.preprocess(blankToNull, imageReferenceSchema.nullable().optional());

export const propertyStatusSchema = z.enum(["ACTIVE", "ARCHIVED"]);
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
  latitude: nullableLatitudeField,
  longitude: nullableLongitudeField,
});

export type Address = z.infer<typeof addressSchema>;

export const socialLinksSchema = z.object({
  website: nullableUrlField,
  instagram: nullableUrlField,
  facebook: nullableUrlField,
  x: nullableUrlField,
});

export type SocialLinks = z.infer<typeof socialLinksSchema>;

export const companySettingsSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  legalName: nullableStringField,
  tradingName: nullableStringField,
  contactEmail: nullableEmailField,
  contactPhone: nullableStringField,
  websiteUrl: nullableUrlField,
  address: addressSchema,
  socialLinks: socialLinksSchema.default({ website: null, instagram: null, facebook: null, x: null }),
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
  sleepsMin: nullableIntField,
  sleepsMax: z.coerce.number().int().min(1, "Maximum sleeps is required"),
  bedrooms: nullableIntField,
  bathrooms: nullableIntField,
  address: addressSchema,
  shortDescription: nullableStringField,
  longDescription: nullableStringField,
  heroImageUrl: nullableImageReferenceField,
  galleryImageUrls: z.array(imageReferenceSchema).max(15, "You can add up to 15 gallery images").default([]),
  themeId: nullableStringField,
});

export type PropertySettings = z.infer<typeof propertySettingsSchema>;

export const upsertPropertySettingsSchema = propertySettingsSchema.omit({ id: true, status: true });
export type UpsertPropertySettings = z.infer<typeof upsertPropertySettingsSchema>;

export const brandingSettingsSchema = z.object({
  brandName: nullableStringField,
  logoUrl: nullableUrlField,
  companyThemeId: nullableStringField,
  primaryFontId: nullableStringField,
  secondaryFontId: nullableStringField,
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
  checkInTime: nullableStringField,
  checkOutTime: nullableStringField,
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

export const propertyAvailabilityFeedStatusSchema = z.object({
  sourceName: z.string().trim().min(1),
  provider: nullableStringField,
  isConnected: z.boolean(),
  lastSyncedAt: z.string().trim().min(1),
});

export type PropertyAvailabilityFeedStatus = z.infer<typeof propertyAvailabilityFeedStatusSchema>;

export const propertyAvailabilityRangeSchema = z.object({
  externalBookingId: z.string().trim().min(1),
  creationDate: z.string().trim().min(1),
  bookingName: z.string().trim().min(1),
  guestName: nullableStringField,
  guestEmail: nullableEmailField,
  guestPhone: nullableStringField,
  adults: z.coerce.number().int().min(0),
  children: z.coerce.number().int().min(0),
  dog: z.boolean().default(false),
  propertyName: z.string().trim().min(1),
  unitName: nullableStringField,
  referrer: nullableStringField,
  notes: nullableStringField,
  sourceName: z.string().trim().min(1),
  startDate: z.string().trim().min(1),
  endDate: z.string().trim().min(1),
});

export type PropertyAvailabilityRange = z.infer<typeof propertyAvailabilityRangeSchema>;

export const propertyAvailabilitySchema = z.object({
  propertyId: z.string().min(1),
  generatedAt: z.string().trim().min(1),
  feeds: z.array(propertyAvailabilityFeedStatusSchema),
  ranges: z.array(propertyAvailabilityRangeSchema),
});

export type PropertyAvailability = z.infer<typeof propertyAvailabilitySchema>;

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

export const complianceInfoRegionSchema = z.enum(["uk", "eu", "other"]);

export const messageBrandingSettingsSchema = z.object({
  complianceInfoRegion: complianceInfoRegionSchema.default("uk"),
  email: z.object({
    includeLogo: z.boolean().default(true),
    showSocialLinks: z.boolean().default(false),
    showContactEmail: z.boolean().default(true),
    customFooterMessage: nullableStringField,
  }),
  sms: z.object({
    smsSenderName: nullableStringField,
    smsSignoff: nullableStringField,
  }),
});

export type MessageBrandingSettings = z.infer<typeof messageBrandingSettingsSchema>;

export const companyFieldPermissionsSchema = z.object({
  canEditWebsiteUrl: z.boolean().default(true),
  canEditContactEmail: z.boolean().default(true),
});

export type CompanyFieldPermissions = z.infer<typeof companyFieldPermissionsSchema>;

export const settingsOverviewSchema = z.object({
  company: companySettingsSchema,
  companyFieldPermissions: companyFieldPermissionsSchema,
  properties: z.array(propertySettingsSchema),
  branding: brandingSettingsSchema,
  bookingAvailability: z.array(propertyCalendarSettingsSchema),
  messageBranding: messageBrandingSettingsSchema,
  marketing: marketingSettingsSchema,
  sending: sendingSettingsSchema,
});

export type SettingsOverview = z.infer<typeof settingsOverviewSchema>;
