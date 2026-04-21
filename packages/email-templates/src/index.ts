export * from "./domain/theme/ThemeDefinition";
export * from "./domain/theme/ThemeRegistry";
export * from "./domain/layout/LayoutDefinition";
export * from "./domain/layout/LayoutRegistry";
export * from "./domain/campaign-template/CampaignTemplateDefinition";
export * from "./domain/campaign-template/CampaignTemplateRegistry";
export * from "./application/createCampaignFromTemplate";

import { buildTemplateLibrary } from "./application/createCampaignFromTemplate";

export const templateLibrary = buildTemplateLibrary();
