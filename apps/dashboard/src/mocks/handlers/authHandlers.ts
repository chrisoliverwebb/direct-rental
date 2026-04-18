import { http, HttpResponse } from "msw";
import { loginRequestSchema } from "@repo/api-contracts";
import { clearMockSession, createLoginResponse, getMockCurrentUser } from "@/mocks/data/authData";

export const authHandlers = [
  http.post("*/api/v1/auth/login", async ({ request }) => {
    const body = loginRequestSchema.parse(await request.json());

    if (body.email !== "owner@directrental.test" || body.password !== "password123") {
      return HttpResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    return HttpResponse.json(createLoginResponse());
  }),
  http.post("*/api/v1/auth/logout", async () => {
    clearMockSession();
    return new HttpResponse(null, { status: 204 });
  }),
  http.get("*/api/v1/auth/me", async ({ request }) => {
    const user = getMockCurrentUser(request.headers.get("Authorization"));
    return HttpResponse.json(user);
  }),
];
