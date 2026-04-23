import { http, HttpResponse } from "msw";
import {
  cancelMockSubscription,
  getAccountOverview,
  getMockPortalUrl,
} from "@/mocks/data/accountData";

export const accountHandlers = [
  http.get("*/api/v1/account", ({ request }) => {
    const overview = getAccountOverview(request.headers.get("Authorization"));
    if (!overview) return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    return HttpResponse.json(overview);
  }),

  http.post("*/api/v1/account/subscription/portal", ({ request }) => {
    const overview = getAccountOverview(request.headers.get("Authorization"));
    if (!overview) return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    return HttpResponse.json(getMockPortalUrl());
  }),

  http.post("*/api/v1/account/subscription/cancel", ({ request }) => {
    const overview = getAccountOverview(request.headers.get("Authorization"));
    if (!overview) return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    cancelMockSubscription();
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("*/api/v1/account/change-password", async ({ request }) => {
    const overview = getAccountOverview(request.headers.get("Authorization"));
    if (!overview) return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    const body = await request.json() as { currentPassword?: string };
    if (body.currentPassword !== "password123") {
      return HttpResponse.json({ message: "Current password is incorrect" }, { status: 400 });
    }
    return new HttpResponse(null, { status: 204 });
  }),
];
