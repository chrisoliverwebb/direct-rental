"use client";

import { campaignStatusLabel, channelLabel } from "@repo/marketing";
import { formatDateTime } from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { CampaignForm } from "@/features/campaigns/CampaignForm";
import { useCampaign, useSendCampaign, useUpdateCampaign } from "@/features/marketing/hooks";

export function CampaignDetailPage({ campaignId }: { campaignId: string }) {
  const campaignQuery = useCampaign(campaignId);
  const updateMutation = useUpdateCampaign(campaignId);
  const sendMutation = useSendCampaign(campaignId);

  if (campaignQuery.isLoading) {
    return <LoadingState rows={4} />;
  }

  if (campaignQuery.isError) {
    return <ErrorState title="Campaign unavailable" description={campaignQuery.error.message} onRetry={() => campaignQuery.refetch()} />;
  }

  if (!campaignQuery.data) {
    return <LoadingState rows={3} />;
  }

  const campaign = campaignQuery.data;

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{campaign.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{channelLabel(campaign.channel)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={campaign.status === "SENT" ? "success" : campaign.status === "SCHEDULED" ? "warning" : "secondary"}>
            {campaignStatusLabel(campaign.status)}
          </Badge>
          {campaign.status === "DRAFT" ? (
            <Button
              onClick={async () => {
                await sendMutation.mutateAsync({ sendMode: "IMMEDIATE" });
              }}
              disabled={sendMutation.isPending}
            >
              {sendMutation.isPending ? "Sending…" : "Send now"}
            </Button>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign settings</CardTitle>
          <CardDescription>
            Created {formatDateTime(campaign.createdAt)}. {campaign.sentAt ? `Sent ${formatDateTime(campaign.sentAt)}.` : "Not sent yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CampaignForm
            defaultValues={campaign}
            submitLabel={updateMutation.isPending ? "Saving…" : "Update draft"}
            disabled={updateMutation.isPending || campaign.status !== "DRAFT"}
            onSubmit={async (values) => {
              await updateMutation.mutateAsync(values);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
