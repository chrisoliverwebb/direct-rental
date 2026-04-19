import { http, HttpResponse } from "msw";
import {
  createCampaignRequestSchema,
  createContactRequestSchema,
  createContactsRequestSchema,
  getContactsQuerySchema,
} from "@repo/api-contracts";
import {
  createCampaign,
  createContact,
  getCampaignById,
  getContactById,
  getDashboard,
  importContacts,
  listDraftCampaigns,
  listCampaigns,
  listContacts,
  listTemplates,
  sendCampaign,
  updateCampaign,
} from "@/mocks/data/marketingData";

export const marketingHandlers = [
  http.get("*/api/v1/marketing/dashboard", async () => HttpResponse.json(getDashboard())),
  http.get("*/api/v1/marketing/contacts", async ({ request }) => {
    const url = new URL(request.url);
    const query = getContactsQuerySchema.parse({
      page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined,
      pageSize: url.searchParams.get("pageSize") ? Number(url.searchParams.get("pageSize")) : undefined,
      search: url.searchParams.get("search") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      source: url.searchParams.get("source") ?? undefined,
    });

    return HttpResponse.json(listContacts(query));
  }),
  http.get("*/api/v1/marketing/contacts/:contactId", async ({ params }) => {
    const contact = getContactById(String(params.contactId));

    if (!contact) {
      return HttpResponse.json({ message: "Contact not found" }, { status: 404 });
    }

    return HttpResponse.json(contact);
  }),
  http.post("*/api/v1/marketing/contacts", async ({ request }) => {
    const body = createContactRequestSchema.parse(await request.json());
    return HttpResponse.json(createContact(body), { status: 201 });
  }),
  http.post("*/api/v1/marketing/contacts/import", async ({ request }) => {
    await delay(1200);
    const body = createContactsRequestSchema.parse(await request.json());
    return HttpResponse.json(importContacts(body.contacts));
  }),
  http.get("*/api/v1/marketing/campaigns", async () => HttpResponse.json(listCampaigns())),
  http.get("*/api/v1/marketing/campaigns/drafts", async () => HttpResponse.json(listDraftCampaigns())),
  http.get("*/api/v1/marketing/campaigns/:campaignId", async ({ params }) => {
    const campaign = getCampaignById(String(params.campaignId));

    if (!campaign) {
      return HttpResponse.json({ message: "Campaign not found" }, { status: 404 });
    }

    return HttpResponse.json(campaign);
  }),
  http.post("*/api/v1/marketing/campaigns", async ({ request }) => {
    const body = createCampaignRequestSchema.parse(await request.json());
    return HttpResponse.json(createCampaign(body), { status: 201 });
  }),
  http.put("*/api/v1/marketing/campaigns/:campaignId", async ({ params, request }) => {
    const body = createCampaignRequestSchema.parse(await request.json());
    return HttpResponse.json(updateCampaign(String(params.campaignId), body));
  }),
  http.post("*/api/v1/marketing/campaigns/:campaignId/send", async ({ params }) =>
    HttpResponse.json(sendCampaign(String(params.campaignId)))),
  http.get("*/api/v1/marketing/templates", async () => HttpResponse.json(listTemplates())),
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
