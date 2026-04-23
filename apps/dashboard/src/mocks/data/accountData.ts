import type { AccountOverview, AccountSubscription } from "@repo/api-contracts";
import { getMockCurrentUser } from "@/mocks/data/authData";

let mockSubscription: AccountSubscription = {
  planName: "Direct Rental Pro",
  status: "active",
  maxProperties: 10,
  pricePerProperty: 2500,
  billingCycle: "monthly",
  currentPeriodEnd: "2026-05-23T00:00:00.000Z",
};

export const getAccountOverview = (authHeader: string | null): AccountOverview | null => {
  const user = getMockCurrentUser(authHeader);
  if (!user) return null;
  return { user, subscription: { ...mockSubscription } };
};

export const getMockPortalUrl = () => ({
  url: "https://billing.stripe.com/mock-portal-session",
});

export const cancelMockSubscription = () => {
  mockSubscription = { ...mockSubscription, status: "canceled" };
};

export const resetMockAccountState = () => {
  mockSubscription = {
    planName: "Direct Rental Pro",
    status: "active",
    maxProperties: 10,
    pricePerProperty: 2500,
    billingCycle: "monthly",
    currentPeriodEnd: "2026-05-23T00:00:00.000Z",
  };
};
