import type {
  BrandingSettings,
  CompanyFieldPermissions,
  CompanySettings,
  MarketingSettings,
  MessageBrandingSettings,
  PropertyAvailability,
  PropertyCalendarSettings,
  PropertySettings,
  SendingSettings,
  SettingsOverview,
  UpdatePropertyCalendarSettings,
  UpsertPropertySettings,
} from "@repo/api-contracts";
import { createId } from "@repo/shared";
import { buildMockPropertyAvailability } from "@/mocks/data/propertyCalendarFeeds";

let companySettings: CompanySettings = {
  companyName: "Direct Rental Co.",
  legalName: "Direct Rental Company Ltd",
  tradingName: "Letting Layer",
  contactEmail: "hello@directrental.test",
  contactPhone: "+44 131 555 0142",
  websiteUrl: "https://directrental.test",
  address: {
    addressLine1: "20 Castle Street",
    addressLine2: null,
    city: "Edinburgh",
    region: "Scotland",
    postcode: "EH2 3AT",
    country: "United Kingdom",
    latitude: 55.9539,
    longitude: -3.1966,
  },
  socialLinks: {
    website: "https://directrental.test",
    instagram: "https://instagram.com/directrental",
    facebook: "https://facebook.com/directrental",
    x: "https://x.com/directrental",
  },
  defaultSenderName: "Alex Morgan",
  defaultReplyToEmail: "owner@directrental.test",
  defaultCurrency: "GBP",
  defaultTimezone: "Europe/London",
};

let propertySettings: PropertySettings[] = [
  {
    id: "prop_0001",
    status: "ACTIVE",
    name: "Harbour View Cottage",
    shortName: "Harbour View",
    sleepsMin: 2,
    sleepsMax: 4,
    bedrooms: 2,
    bathrooms: 1,
    address: {
      addressLine1: "1 Pier Road",
      addressLine2: null,
      city: "Whitby",
      region: "North Yorkshire",
      postcode: "YO21 3PU",
      country: "United Kingdom",
      latitude: 54.4858,
      longitude: -0.6133,
    },
    shortDescription: "Sea-view cottage for couples and small families.",
    longDescription: "A bright coastal cottage with harbour views and a short walk to town.",
    heroImageUrl: "/assets/properties/harbour-view-hero.svg",
    galleryImageUrls: [
      "/assets/properties/harbour-view-gallery-1.svg",
      "/assets/properties/harbour-view-gallery-2.svg",
    ],
    themeId: null,
  },
  {
    id: "prop_0002",
    status: "ACTIVE",
    name: "Meadow Lodge",
    shortName: "Meadow",
    sleepsMin: null,
    sleepsMax: 6,
    bedrooms: 3,
    bathrooms: 2,
    address: {
      addressLine1: "12 Birch Lane",
      addressLine2: null,
      city: "Keswick",
      region: "Cumbria",
      postcode: "CA12 4AB",
      country: "United Kingdom",
      latitude: 54.6012,
      longitude: -3.1348,
    },
    shortDescription: "Woodland lodge close to walking routes and lake views.",
    longDescription: "A spacious family lodge with private deck and easy access to the fells.",
    heroImageUrl: "/assets/properties/meadow-lodge-hero.svg",
    galleryImageUrls: [
      "/assets/properties/meadow-lodge-gallery-1.svg",
      "/assets/properties/meadow-lodge-gallery-2.svg",
    ],
    themeId: "coastal-soft",
  },
];

let bookingAvailabilitySettings: PropertyCalendarSettings[] = [
  {
    propertyId: "prop_0001",
    calendarFeeds: [
      {
        id: "feed_0001",
        sourceName: "Airbnb",
        provider: "Airbnb",
        icalUrl: "https://calendar.example.test/harbour-view-airbnb.ics",
      },
      {
        id: "feed_0002",
        sourceName: "Booking.com",
        provider: "Booking.com",
        icalUrl: "https://calendar.example.test/harbour-view-booking.ics",
      },
    ],
    checkInTime: "16:00",
    checkOutTime: "10:00",
    minimumStayDefault: 2,
    maximumStayDefault: 14,
    availabilityWindowDays: 365,
  },
  {
    propertyId: "prop_0002",
    calendarFeeds: [
      {
        id: "feed_0003",
        sourceName: "Vrbo",
        provider: "Vrbo",
        icalUrl: "https://calendar.example.test/meadow-lodge-vrbo.ics",
      },
    ],
    checkInTime: "15:30",
    checkOutTime: "10:30",
    minimumStayDefault: 3,
    maximumStayDefault: 21,
    availabilityWindowDays: 365,
  },
];

let companyFieldPermissions: CompanyFieldPermissions = {
  canEditWebsiteUrl: false,
  canEditContactEmail: false,
};

let brandingSettings: BrandingSettings = {
  brandName: "Direct Rental Co.",
  logoUrl: null,
  companyThemeId: "classic-coastal",
  primaryFontId: "playfair",
  secondaryFontId: "inter",
  primaryColour: "#0f4c81",
  secondaryColour: "#dbe7f3",
  accentColour: "#1d7bd7",
  backgroundColour: "#ffffff",
  textColour: "#0f172a",
  mutedTextColour: "#64748b",
  headingFont: "'Playfair Display', Georgia, 'Times New Roman', serif",
  bodyFont: "'Inter', Arial, sans-serif",
  buttonStyle: "rounded",
  cornerRadius: "medium",
  spacingScale: "comfortable",
};

let messageBrandingSettings: MessageBrandingSettings = {
  complianceInfoRegion: "uk",
  email: {
    includeLogo: true,
    showSocialLinks: true,
    showContactEmail: true,
    customFooterMessage: "Seasonal offers, local recommendations, and last-minute availability from the Direct Rental team.",
  },
  sms: {
    smsSenderName: "Direct Rental",
    smsSignoff: "Direct Rental Co.",
  },
};

let marketingSettings: MarketingSettings = {
  defaultSignOffName: "Alex",
  defaultFooterText: "You are receiving this because you previously stayed with us or enquired directly.",
  defaultPropertyId: "prop_0001",
  defaultThemeSource: "property",
  defaultSmsSignOff: "Alex at Direct Rental",
};

let sendingSettings: SendingSettings = {
  emailSenderName: "Alex Morgan",
  emailSenderAddress: "owner@directrental.test",
  replyToEmail: "hello@directrental.test",
  smsEnabled: true,
  smsSenderId: "DirectRental",
};

export const getSettingsOverview = (): SettingsOverview => ({
  company: companySettings,
  companyFieldPermissions,
  properties: propertySettings,
  branding: brandingSettings,
  bookingAvailability: bookingAvailabilitySettings,
  messageBranding: messageBrandingSettings,
  marketing: marketingSettings,
  sending: sendingSettings,
});

export const updateCompanySettings = (request: CompanySettings) => {
  companySettings = request;
  return companySettings;
};

export const updateBrandingSettings = (request: BrandingSettings) => {
  brandingSettings = request;
  return brandingSettings;
};

export const updateMessageBrandingSettings = (request: MessageBrandingSettings) => {
  messageBrandingSettings = request;
  return messageBrandingSettings;
};

export const updateMarketingSettings = (request: MarketingSettings) => {
  marketingSettings = request;
  return marketingSettings;
};

export const updateSendingSettings = (request: SendingSettings) => {
  sendingSettings = request;
  return sendingSettings;
};

export const createPropertySettings = (request: UpsertPropertySettings) => {
  const nextProperty: PropertySettings = {
    id: createId("prop", propertySettings.length + 1),
    status: "ACTIVE",
    ...request,
  };

  propertySettings = [...propertySettings, nextProperty];
  bookingAvailabilitySettings = [
    ...bookingAvailabilitySettings,
    {
      propertyId: nextProperty.id,
      calendarFeeds: [],
      checkInTime: null,
      checkOutTime: null,
      minimumStayDefault: null,
      maximumStayDefault: null,
      availabilityWindowDays: null,
    },
  ];

  return nextProperty;
};

export const updatePropertySettings = (propertyId: string, request: UpsertPropertySettings) => {
  let updated: PropertySettings | null = null;

  propertySettings = propertySettings.map((property) => {
    if (property.id !== propertyId) {
      return property;
    }

    updated = {
      ...property,
      ...request,
    };

    return updated;
  });

  return updated;
};

export const archivePropertySettings = (propertyId: string) => {
  let updated: PropertySettings | null = null;

  propertySettings = propertySettings.map((property) => {
    if (property.id !== propertyId) {
      return property;
    }

    updated = { ...property, status: "ARCHIVED" };
    return updated;
  });

  return updated;
};

export const updatePropertyCalendarSettings = (propertyId: string, request: UpdatePropertyCalendarSettings) => {
  bookingAvailabilitySettings = bookingAvailabilitySettings.map((entry) => {
    if (entry.propertyId !== propertyId) {
      return entry;
    }

    return {
      propertyId,
      checkInTime: request.checkInTime ?? null,
      checkOutTime: request.checkOutTime ?? null,
      minimumStayDefault: request.minimumStayDefault ?? null,
      maximumStayDefault: request.maximumStayDefault ?? null,
      availabilityWindowDays: request.availabilityWindowDays ?? null,
      calendarFeeds: request.calendarFeeds.map((feed, index) => ({
        id: feed.id ?? createId("feed", index + 1),
        sourceName: feed.sourceName,
        provider: feed.provider ?? null,
        icalUrl: feed.icalUrl,
      })),
    };
  });
};

export const getPropertyAvailability = (propertyId: string): PropertyAvailability | null => {
  const entry = bookingAvailabilitySettings.find((item) => item.propertyId === propertyId);
  if (!entry) return null;

  return buildMockPropertyAvailability(propertyId, entry.calendarFeeds);
};
