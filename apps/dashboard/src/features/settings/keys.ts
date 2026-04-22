export const settingsKeys = {
  all: ["settings"] as const,
  overview: () => [...settingsKeys.all, "overview"] as const,
};
