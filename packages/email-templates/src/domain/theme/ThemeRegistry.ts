import type { ThemeDefinition } from "./ThemeDefinition";

const systemDefaultTheme: ThemeDefinition = {
  id: "system-default",
  name: "System Default",
  scope: "system",
  tokens: {
    fontSans: "Arial, sans-serif",
    fontSerif: "Georgia, serif",
    heading: "#0f172a",
    body: "#334155",
    muted: "#475569",
    surface: "#eff6ff",
    surfaceAlt: "#f8fafc",
    accent: "#2563eb",
    accentAlt: "#ea580c",
    buttonPrimaryBackground: "#0f172a",
    buttonPrimaryText: "#ffffff",
    divider: "#e2e8f0",
  },
  defaults: {
    companyName: "Direct Rental",
  },
};

export function getThemeDefinitions() {
  return [systemDefaultTheme];
}

export function getThemeById(themeId: string) {
  return getThemeDefinitions().find((theme) => theme.id === themeId) ?? null;
}

export function resolveDefaultTheme() {
  return systemDefaultTheme;
}
