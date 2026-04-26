export const settingsKeys = {
  all: ["settings"] as const,
  overview: () => [...settingsKeys.all, "overview"] as const,
  propertyBookings: (propertyId: string) => [...settingsKeys.all, "properties", propertyId, "bookings"] as const,
};
