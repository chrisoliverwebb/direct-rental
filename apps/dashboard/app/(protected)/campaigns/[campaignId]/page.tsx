import { CampaignDetailPage } from "@/features/campaigns/CampaignDetailPage";

export default async function CampaignDetailRoute({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  return <CampaignDetailPage campaignId={campaignId} />;
}
