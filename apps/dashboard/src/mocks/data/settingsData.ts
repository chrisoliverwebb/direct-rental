import type {
  BrandingSettings,
  CompanySettings,
  MarketingSettings,
  PropertyCalendarSettings,
  PropertySettings,
  SendingSettings,
  SettingsOverview,
  UpdatePropertyCalendarSettings,
  UpsertPropertySettings,
} from "@repo/api-contracts";
import { createId } from "@repo/shared";

let companySettings: CompanySettings = {
  companyName: "Direct Rental Co.",
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
    propertyType: "COTTAGE",
    sleeps: 4,
    bedrooms: 2,
    bathrooms: 1,
    bookingEmail: "bookings@harbourview.test",
    bookingPhone: "+44 7700 900101",
    websiteUrl: "https://directrental.test/harbour-view",
    directBookingUrl: "https://directrental.test/book/harbour-view",
    checkInTime: "16:00",
    checkOutTime: "10:00",
    address: {
      addressLine1: "1 Pier Road",
      addressLine2: null,
      city: "Whitby",
      region: "North Yorkshire",
      postcode: "YO21 3PU",
      country: "United Kingdom",
    },
    shortDescription: "Sea-view cottage for couples and small families.",
    longDescription: "A bright coastal cottage with harbour views and a short walk to town.",
    heroImageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    galleryImageUrls: [],
    themeId: null,
  },
  {
    id: "prop_0002",
    status: "ACTIVE",
    name: "Meadow Lodge",
    shortName: "Meadow",
    propertyType: "LODGE",
    sleeps: 6,
    bedrooms: 3,
    bathrooms: 2,
    bookingEmail: "stay@meadowlodge.test",
    bookingPhone: "+44 7700 900102",
    websiteUrl: "https://directrental.test/meadow-lodge",
    directBookingUrl: "https://directrental.test/book/meadow-lodge",
    checkInTime: "15:30",
    checkOutTime: "10:30",
    address: {
      addressLine1: "12 Birch Lane",
      addressLine2: null,
      city: "Keswick",
      region: "Cumbria",
      postcode: "CA12 4AB",
      country: "United Kingdom",
    },
    shortDescription: "Woodland lodge close to walking routes and lake views.",
    longDescription: "A spacious family lodge with private deck and easy access to the fells.",
    heroImageUrl: "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
    galleryImageUrls: [],
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
    minimumStayDefault: 3,
    maximumStayDefault: 21,
    availabilityWindowDays: 365,
  },
];

let brandingSettings: BrandingSettings = {
  brandName: "Direct Rental Co.",
  logoUrl: "https://directrental.test/assets/logo.svg",
  companyThemeId: "classic-coastal",
  primaryColour: "#0f4c81",
  secondaryColour: "#dbe7f3",
  accentColour: "#1d7bd7",
  backgroundColour: "#ffffff",
  textColour: "#0f172a",
  mutedTextColour: "#64748b",
  headingFont: "Fraunces",
  bodyFont: "Manrope",
  buttonStyle: "rounded",
  cornerRadius: "medium",
  spacingScale: "comfortable",
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
  properties: propertySettings,
  branding: brandingSettings,
  bookingAvailability: bookingAvailabilitySettings,
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
