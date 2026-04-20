"use client";

import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmailCampaignWorkspace } from "@/features/campaigns/EmailCampaignWorkspace";
import { useCampaign, useSendCampaign, useUpdateCampaign } from "@/features/marketing/hooks";

export function CampaignEditPage({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const campaignQuery = useCampaign(campaignId);
  const updateMutation = useUpdateCampaign(campaignId);
  const sendMutation = useSendCampaign(campaignId);

  if (campaignQuery.isLoading) {
    return <LoadingState rows={4} />;
  }

  if (campaignQuery.isError) {
    return (
      <ErrorState
        title="Campaign unavailable"
        description={campaignQuery.error.message}
        onRetry={() => campaignQuery.refetch()}
      />
    );
  }

  if (!campaignQuery.data) {
    return <LoadingState rows={3} />;
  }

  const campaign = campaignQuery.data;

  if ((campaign.status !== "DRAFT" && campaign.status !== "SCHEDULED") || campaign.channel !== "EMAIL") {
    return (
      <ErrorState
        title="Editor unavailable"
        description="Only email campaigns can be edited in the fullscreen editor."
        onRetry={() => router.replace(`/campaigns/${campaignId}`)}
      />
    );
  }

  return (
    <EmailCampaignWorkspace
      mode="edit"
      initialCampaign={campaign}
      campaignStatus={campaign.status}
      initialScheduledAt={campaign.status === "SCHEDULED" ? (campaign.scheduledAt ?? undefined) : undefined}
      onBack={() =>
        campaign.status === "SCHEDULED"
          ? router.push(`/campaigns/${campaignId}`)
          : router.push("/campaigns")
      }
      submitLabel={
        updateMutation.isPending
          ? "Saving..."
          : campaign.status === "SCHEDULED"
            ? "Save changes"
            : "Save draft"
      }
      onSave={async (values) => {
        await updateMutation.mutateAsync(values);
        return campaign.id;
      }}
      onSend={async (request) => {
        await sendMutation.mutateAsync(request);
        await campaignQuery.refetch();
        router.replace(`/campaigns/${campaignId}`);
      }}
    />
  );
}
