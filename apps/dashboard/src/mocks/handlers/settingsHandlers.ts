import { http, HttpResponse } from "msw";
import {
  brandingSettingsSchema,
  companySettingsSchema,
  marketingSettingsSchema,
  messageBrandingSettingsSchema,
  sendingSettingsSchema,
  updatePropertyCalendarSettingsSchema,
  upsertPropertySettingsSchema,
} from "@repo/api-contracts";
import {
  archivePropertySettings,
  createPropertySettings,
  getPropertyAvailability,
  getSettingsOverview,
  updateBrandingSettings,
  updateCompanySettings,
  updateMarketingSettings,
  updateMessageBrandingSettings,
  updatePropertyCalendarSettings,
  updatePropertySettings,
  updateSendingSettings,
} from "@/mocks/data/settingsData";
import { getMockCalendarFeed } from "@/mocks/data/propertyCalendarFeeds";

export const settingsHandlers = [
  http.get("https://calendar.example.test/:feedFile", async ({ request }) => {
    const calendar = getMockCalendarFeed(request.url);

    if (!calendar) {
      return new HttpResponse("Not found", { status: 404 });
    }

    return new HttpResponse(calendar, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
      },
    });
  }),
  http.get("*/api/v1/settings", async () => HttpResponse.json(getSettingsOverview())),
  http.put("*/api/v1/settings/company", async ({ request }) => {
    const body = companySettingsSchema.parse(await request.json());
    return HttpResponse.json(updateCompanySettings(body));
  }),
  http.put("*/api/v1/settings/branding", async ({ request }) => {
    const body = brandingSettingsSchema.parse(await request.json());
    return HttpResponse.json(updateBrandingSettings(body));
  }),
  http.put("*/api/v1/settings/message-branding", async ({ request }) => {
    const body = messageBrandingSettingsSchema.parse(await request.json());
    return HttpResponse.json(updateMessageBrandingSettings(body));
  }),
  http.put("*/api/v1/settings/marketing", async ({ request }) => {
    const body = marketingSettingsSchema.parse(await request.json());
    return HttpResponse.json(updateMarketingSettings(body));
  }),
  http.put("*/api/v1/settings/sending", async ({ request }) => {
    const body = sendingSettingsSchema.parse(await request.json());
    return HttpResponse.json(updateSendingSettings(body));
  }),
  http.post("*/api/v1/settings/properties", async ({ request }) => {
    const body = upsertPropertySettingsSchema.parse(await request.json());
    return HttpResponse.json(createPropertySettings(body), { status: 201 });
  }),
  http.put("*/api/v1/settings/properties/:propertyId", async ({ params, request }) => {
    const body = upsertPropertySettingsSchema.parse(await request.json());
    const property = updatePropertySettings(String(params.propertyId), body);

    if (!property) {
      return HttpResponse.json({ message: "Property not found" }, { status: 404 });
    }

    return HttpResponse.json(property);
  }),
  http.post("*/api/v1/settings/properties/:propertyId/archive", async ({ params }) => {
    const property = archivePropertySettings(String(params.propertyId));

    if (!property) {
      return HttpResponse.json({ message: "Property not found" }, { status: 404 });
    }

    return HttpResponse.json(property);
  }),
  http.get("*/api/v1/settings/properties/:propertyId/bookings", async ({ params }) => {
    const availability = getPropertyAvailability(String(params.propertyId));

    if (!availability) {
      return HttpResponse.json({ message: "Property not found" }, { status: 404 });
    }

    return HttpResponse.json(availability);
  }),
  http.put("*/api/v1/settings/properties/:propertyId/calendar", async ({ params, request }) => {
    const body = updatePropertyCalendarSettingsSchema.parse(await request.json());
    updatePropertyCalendarSettings(String(params.propertyId), body);
    return new HttpResponse(null, { status: 204 });
  }),
];
