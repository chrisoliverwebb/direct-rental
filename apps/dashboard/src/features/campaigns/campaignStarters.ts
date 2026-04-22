"use client";

import type { TemplateSummary } from "@repo/api-contracts";

export type CampaignScope = "SINGLE_PROPERTY" | "MULTI_PROPERTY" | "BUSINESS_WIDE";
export type CampaignGoalCategory =
  | "PROMOTE_AVAILABILITY"
  | "DRIVE_REPEAT_STAYS"
  | "SHOWCASE_PROPERTIES"
  | "ANNOUNCE_UPDATES";

type CampaignStarterMeta = {
  templateId: string;
  goal: CampaignGoalCategory;
  supportedScopes: CampaignScope[];
  recommendedScope: CampaignScope;
  recommendedAudience: string;
  headline: string;
};

const starterCatalog: CampaignStarterMeta[] = [
  {
    templateId: "last-minute-availability",
    goal: "PROMOTE_AVAILABILITY",
    supportedScopes: ["SINGLE_PROPERTY", "MULTI_PROPERTY"],
    recommendedScope: "SINGLE_PROPERTY",
    recommendedAudience: "Past guests most likely to book a short-notice stay.",
    headline: "Last-minute availability",
  },
  {
    templateId: "bank-holiday-reminder",
    goal: "PROMOTE_AVAILABILITY",
    supportedScopes: ["SINGLE_PROPERTY", "MULTI_PROPERTY"],
    recommendedScope: "MULTI_PROPERTY",
    recommendedAudience: "Contacts looking for date-led availability and upcoming breaks.",
    headline: "Holiday opening reminder",
  },
  {
    templateId: "repeat-guest-discount",
    goal: "DRIVE_REPEAT_STAYS",
    supportedScopes: ["SINGLE_PROPERTY", "BUSINESS_WIDE"],
    recommendedScope: "BUSINESS_WIDE",
    recommendedAudience: "Past guests and loyalty-focused segments.",
    headline: "Repeat guest discount",
  },
  {
    templateId: "summer-return-offer",
    goal: "DRIVE_REPEAT_STAYS",
    supportedScopes: ["MULTI_PROPERTY", "BUSINESS_WIDE"],
    recommendedScope: "BUSINESS_WIDE",
    recommendedAudience: "Past guests ready for a seasonal return stay.",
    headline: "Seasonal return offer",
  },
  {
    templateId: "direct-booking-nudge",
    goal: "SHOWCASE_PROPERTIES",
    supportedScopes: ["SINGLE_PROPERTY", "MULTI_PROPERTY", "BUSINESS_WIDE"],
    recommendedScope: "SINGLE_PROPERTY",
    recommendedAudience: "Brand-level contacts who already know your properties.",
    headline: "Property spotlight",
  },
];

const scopeLabels: Record<CampaignScope, string> = {
  SINGLE_PROPERTY: "Single property",
  MULTI_PROPERTY: "Multi-property",
  BUSINESS_WIDE: "Business-wide",
};

const goalLabels: Record<CampaignGoalCategory, string> = {
  PROMOTE_AVAILABILITY: "Promote availability",
  DRIVE_REPEAT_STAYS: "Drive repeat stays",
  SHOWCASE_PROPERTIES: "Showcase properties",
  ANNOUNCE_UPDATES: "Announce updates",
};

const goalDescriptions: Record<CampaignGoalCategory, string> = {
  PROMOTE_AVAILABILITY: "Fill gaps quickly with date-led offers and availability messages.",
  DRIVE_REPEAT_STAYS: "Encourage previous guests to book again with direct incentives.",
  SHOWCASE_PROPERTIES: "Lead with one property or a curated collection of stays.",
  ANNOUNCE_UPDATES: "Share launches, seasonal news, and brand-level updates.",
};

export function getGoalLabel(goal: CampaignGoalCategory) {
  return goalLabels[goal];
}

export function getGoalDescription(goal: CampaignGoalCategory) {
  return goalDescriptions[goal];
}

export function getScopeLabel(scope: CampaignScope) {
  return scopeLabels[scope];
}

export function getAvailableScopes(propertyCount: number): CampaignScope[] {
  const scopes: CampaignScope[] = [];

  if (propertyCount >= 1) {
    scopes.push("SINGLE_PROPERTY");
  }

  if (propertyCount >= 2) {
    scopes.push("MULTI_PROPERTY");
  }

  scopes.push("BUSINESS_WIDE");
  return scopes;
}

export function getVisibleScopesForPropertyCount(propertyCount: number): CampaignScope[] {
  if (propertyCount >= 2) {
    return ["SINGLE_PROPERTY", "MULTI_PROPERTY", "BUSINESS_WIDE"];
  }

  if (propertyCount === 1) {
    return ["SINGLE_PROPERTY", "BUSINESS_WIDE"];
  }

  return ["BUSINESS_WIDE"];
}

export function getRecommendedScope(propertyCount: number): CampaignScope {
  if (propertyCount >= 2) {
    return "MULTI_PROPERTY";
  }

  if (propertyCount === 1) {
    return "SINGLE_PROPERTY";
  }

  return "BUSINESS_WIDE";
}

export function resolveTemplateScope(template: TemplateSummary, propertyCount: number): CampaignScope {
  const supportedScopes = getStarterMeta(template).supportedScopes;
  const visibleScopes = getVisibleScopesForPropertyCount(propertyCount);
  const matchedScope = supportedScopes.find((scope) => visibleScopes.includes(scope));

  return matchedScope ?? "BUSINESS_WIDE";
}

export function getStarterMeta(template: TemplateSummary) {
  const mapped = starterCatalog.find((entry) => entry.templateId === template.id);

  if (mapped) {
    return mapped;
  }

  return {
    templateId: template.id,
    goal: template.channel === "SMS" ? "ANNOUNCE_UPDATES" : "SHOWCASE_PROPERTIES",
    supportedScopes: ["BUSINESS_WIDE"] as CampaignScope[],
    recommendedScope: "BUSINESS_WIDE" as CampaignScope,
    recommendedAudience: "All opted-in contacts.",
    headline: template.name,
  };
}

export function getTemplatesForGoal(templates: TemplateSummary[], goal: CampaignGoalCategory) {
  return templates.filter((template) => getStarterMeta(template).goal === goal);
}

export function filterTemplatesByScope(templates: TemplateSummary[], scope: CampaignScope) {
  return templates.filter((template) => getStarterMeta(template).supportedScopes.includes(scope));
}

export function filterTemplatesForPropertyCount(templates: TemplateSummary[], propertyCount: number) {
  const visibleScopes = getVisibleScopesForPropertyCount(propertyCount);

  return templates.filter((template) =>
    getStarterMeta(template).supportedScopes.some((scope) => visibleScopes.includes(scope)),
  );
}

export function groupTemplatesByGoal(templates: TemplateSummary[]) {
  return (Object.keys(goalLabels) as CampaignGoalCategory[]).map((goal) => ({
    goal,
    label: getGoalLabel(goal),
    description: getGoalDescription(goal),
    templates: getTemplatesForGoal(templates, goal),
  }));
}
