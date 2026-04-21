export type ThemeScope = "system" | "company" | "property";

export type ThemeTokens = {
  fontSans: string;
  fontSerif: string;
  heading: string;
  body: string;
  muted: string;
  surface: string;
  surfaceAlt: string;
  accent: string;
  accentAlt: string;
  buttonPrimaryBackground: string;
  buttonPrimaryText: string;
  divider: string;
};

export type ThemeDefinition = {
  id: string;
  name: string;
  scope: ThemeScope;
  tokens: ThemeTokens;
  defaults?: {
    companyName?: string;
    logoUrl?: string;
  };
};
