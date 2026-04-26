export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  apiMocking: process.env.NEXT_PUBLIC_API_MOCKING ?? "disabled",
  mapTilerApiKey: process.env.NEXT_PUBLIC_MAPTILER_API_KEY ?? "",
  mapTilerMapId: process.env.NEXT_PUBLIC_MAPTILER_MAP_ID ?? "basic-v2",
};
