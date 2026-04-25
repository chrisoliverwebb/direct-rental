export type ContactsTab = "subscribed" | "unsubscribed" | "all";
export const CONTACTS_TABS: Array<{ value: ContactsTab; label: string }> = [
  { value: "subscribed", label: "Subscribed" },
  { value: "unsubscribed", label: "Unsubscribed" },
  { value: "all", label: "All" },
];
export const CONTACTS_DEFAULT_TAB: ContactsTab = "subscribed";

export type CampaignsTab = "scheduled" | "sent" | "drafts";
export const CAMPAIGNS_TABS: Array<{ value: CampaignsTab; label: string }> = [
  { value: "scheduled", label: "Scheduled" },
  { value: "sent", label: "Sent" },
  { value: "drafts", label: "Drafts" },
];
export const CAMPAIGNS_DEFAULT_TAB: CampaignsTab = "scheduled";

export type ConfigurationTab = "business_info" | "branding" | "campaign_sign_off";
export const CONFIGURATION_TABS: Array<{ value: ConfigurationTab; label: string }> = [
  { value: "business_info", label: "Business Info" },
  { value: "branding", label: "Branding" },
  { value: "campaign_sign_off", label: "Campaign Sign Off" },
];
export const CONFIGURATION_DEFAULT_TAB: ConfigurationTab = "business_info";
