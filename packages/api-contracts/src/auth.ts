import { z } from "zod";

export const authUserSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export type AuthUser = z.infer<typeof authUserSchema>;

export const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const loginResponseSchema = z.object({
  user: authUserSchema,
  accessToken: z.string().min(1),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const getCurrentUserResponseSchema = authUserSchema.nullable();

export type GetCurrentUserResponse = z.infer<typeof getCurrentUserResponseSchema>;
