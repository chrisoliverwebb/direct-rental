import { CampaignEditPage } from "@/features/campaigns/CampaignEditPage";

export default async function CampaignEditRoute({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  return <CampaignEditPage campaignId={campaignId} />;
}
