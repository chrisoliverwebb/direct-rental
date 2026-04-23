import { ZodSchema } from "zod";
import { clearStoredAccessToken, getStoredAccessToken } from "@repo/auth";
import { env } from "@/lib/env";

type FetchOptions = RequestInit & {
  schema?: ZodSchema;
};

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

const buildHeaders = (headers: HeadersInit | undefined) => {
  const merged = new Headers(headers);

  if (!merged.has("Content-Type")) {
    merged.set("Content-Type", "application/json");
  }

  const accessToken = getStoredAccessToken();
  if (accessToken) {
    merged.set("Authorization", `Bearer ${accessToken}`);
  }

  return merged;
};

export const fetcher = async <T>(path: string, options: FetchOptions = {}) => {
  const { schema, headers, body, ...rest } = options;
  const requestHeaders = body instanceof FormData ? new Headers(headers) : buildHeaders(headers);

  if (body instanceof FormData) {
    const accessToken = getStoredAccessToken();
    if (accessToken) {
      requestHeaders.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...rest,
    body,
    headers: requestHeaders,
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAccessToken();
      window.location.replace("/login");
      throw new ApiError("Session expired", 401);
    }

    let message = "Request failed";

    try {
      const data = (await response.json()) as { message?: string };
      if (data.message) {
        message = data.message;
      }
    } catch {
      message = response.statusText || message;
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = (await response.json()) as unknown;
  return schema ? (schema.parse(json) as T) : (json as T);
};
