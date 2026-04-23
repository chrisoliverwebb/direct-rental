import {
  accountOverviewSchema,
  changePasswordRequestSchema,
  portalUrlResponseSchema,
  type AccountOverview,
  type ChangePasswordRequest,
  type PortalUrlResponse,
} from "@repo/api-contracts";
import { fetcher } from "@/lib/fetcher";

export interface AccountApi {
  getAccount(): Promise<AccountOverview>;
  getPortalUrl(): Promise<PortalUrlResponse>;
  cancelSubscription(): Promise<void>;
  changePassword(request: ChangePasswordRequest): Promise<void>;
}

export const accountApi: AccountApi = {
  getAccount: async () =>
    fetcher<AccountOverview>("/v1/account", {
      schema: accountOverviewSchema,
    }),
  getPortalUrl: async () =>
    fetcher<PortalUrlResponse>("/v1/account/subscription/portal", {
      method: "POST",
      schema: portalUrlResponseSchema,
    }),
  cancelSubscription: async () =>
    fetcher<void>("/v1/account/subscription/cancel", {
      method: "POST",
    }),
  changePassword: async (request) =>
    fetcher<void>("/v1/account/change-password", {
      method: "POST",
      body: JSON.stringify(changePasswordRequestSchema.parse(request)),
    }),
};
