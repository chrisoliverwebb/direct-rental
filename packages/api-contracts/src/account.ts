import { z } from "zod";
import { authUserSchema } from "./auth";

export const subscriptionStatusSchema = z.enum(["active", "trialing", "past_due", "canceled"]);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const billingCycleSchema = z.enum(["monthly", "annual"]);
export type BillingCycle = z.infer<typeof billingCycleSchema>;

export const accountSubscriptionSchema = z.object({
  planName: z.string(),
  status: subscriptionStatusSchema,
  maxProperties: z.number().int().min(1),
  pricePerProperty: z.number(),
  billingCycle: billingCycleSchema,
  currentPeriodEnd: z.string().datetime().nullable(),
});

export type AccountSubscription = z.infer<typeof accountSubscriptionSchema>;

export const accountOverviewSchema = z.object({
  user: authUserSchema,
  subscription: accountSubscriptionSchema.nullable(),
});

export type AccountOverview = z.infer<typeof accountOverviewSchema>;

export const portalUrlResponseSchema = z.object({
  url: z.string().url(),
});

export type PortalUrlResponse = z.infer<typeof portalUrlResponseSchema>;

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;
