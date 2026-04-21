export type CampaignTemplateChannel = "EMAIL" | "SMS";
export type CampaignTemplateAudience = "past-guests" | "upcoming" | "all";
export type CampaignTemplateGoal = "rebook" | "inform" | "engage";

export type CampaignTemplateDefinition = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  channel: CampaignTemplateChannel;
  layoutId?: string;
  starterContent: Record<string, unknown>;
  previewThumbnail?: string | null;
  audience?: CampaignTemplateAudience;
  goal?: CampaignTemplateGoal;
  subject?: string | null;
  previewText?: string | null;
};
