import { http, HttpResponse } from "msw";
import {
  createSavedEmailBlockRequestSchema,
  createCampaignRequestSchema,
  createContactRequestSchema,
  createContactsRequestSchema,
  getCampaignsQuerySchema,
  getContactsQuerySchema,
  sendCampaignRequestSchema,
} from "@repo/api-contracts";
import {
  createSavedBlock,
  createCampaign,
  createContact,
  deleteSavedBlock,
  deleteCampaign,
  getCampaignById,
  getContactById,
  getDashboard,
  importContacts,
  listSavedBlocks,
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
  http.get("*/api/v1/marketing/campaigns", async ({ request }) => {
    const url = new URL(request.url);
    const query = getCampaignsQuerySchema.parse({
      page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined,
      pageSize: url.searchParams.get("pageSize") ? Number(url.searchParams.get("pageSize")) : undefined,
      channel: url.searchParams.get("channel") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      sortDirection: url.searchParams.get("sortDirection") ?? undefined,
    });

    return HttpResponse.json(listCampaigns(query));
  }),
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
  http.post("*/api/v1/marketing/campaigns/:campaignId/send", async ({ params, request }) => {
    const body = sendCampaignRequestSchema.parse(await request.json());
    return HttpResponse.json(sendCampaign(String(params.campaignId), body));
  }),
  http.delete("*/api/v1/marketing/campaigns/:campaignId", ({ params }) => {
    deleteCampaign(String(params.campaignId));
    return new HttpResponse(null, { status: 204 });
  }),
  http.get("*/api/v1/marketing/saved-blocks", async () => HttpResponse.json(listSavedBlocks())),
  http.post("*/api/v1/marketing/saved-blocks", async ({ request }) => {
    const body = createSavedEmailBlockRequestSchema.parse(await request.json());
    return HttpResponse.json(createSavedBlock(body), { status: 201 });
  }),
  http.delete("*/api/v1/marketing/saved-blocks/:savedBlockId", ({ params }) => {
    deleteSavedBlock(String(params.savedBlockId));
    return new HttpResponse(null, { status: 204 });
  }),
  http.get("*/api/v1/marketing/templates", async () => HttpResponse.json(listTemplates())),
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
