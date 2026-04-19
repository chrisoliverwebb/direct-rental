"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { campaignStatusLabel, channelLabel } from "@repo/marketing";
import { formatDateTime } from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { CampaignForm } from "@/features/campaigns/CampaignForm";
import { EmailCampaignWorkspace } from "@/features/campaigns/EmailCampaignWorkspace";
import { useCampaign, useSendCampaign, useUpdateCampaign } from "@/features/marketing/hooks";

export function CampaignDetailPage({ campaignId }: { campaignId: string }) {
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

  if (campaign.status === "DRAFT" && campaign.channel === "EMAIL") {
    return (
      <EmailCampaignWorkspace
        mode="edit"
        initialCampaign={campaign}
        onBack={() => router.push("/campaigns")}
        submitLabel={updateMutation.isPending ? "Saving..." : "Update draft"}
        onSave={async (values) => {
          await updateMutation.mutateAsync(values);
          return campaign.id;
        }}
        onSendNow={async () => {
          await sendMutation.mutateAsync({ sendMode: "IMMEDIATE" });
          await campaignQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/campaigns" className="text-sm font-medium text-muted-foreground transition hover:text-slate-900">
            Back to campaigns
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{campaign.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{channelLabel(campaign.channel)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={
              campaign.status === "SENT" ? "success" : campaign.status === "SCHEDULED" ? "warning" : "secondary"
            }
          >
            {campaign.status === "DRAFT" ? "Draft" : campaignStatusLabel(campaign.status)}
          </Badge>
          {campaign.status === "DRAFT" ? (
            <Button
              onClick={async () => {
                await sendMutation.mutateAsync({ sendMode: "IMMEDIATE" });
                await campaignQuery.refetch();
              }}
              disabled={sendMutation.isPending}
            >
              {sendMutation.isPending ? "Sending..." : "Send now"}
            </Button>
          ) : null}
        </div>
      </div>

      <Card>
        {campaign.status === "DRAFT" ? (
          <>
            <CardHeader>
              <CardTitle>Draft details</CardTitle>
              <CardDescription>
                Created {formatDateTime(campaign.createdAt)}. Drafts can be edited before they are sent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaign.channel === "SMS" ? (
                <CampaignForm
                  defaultValues={campaign}
                  forcedChannel="SMS"
                  showChannelField={false}
                  submitLabel={updateMutation.isPending ? "Saving..." : "Update draft"}
                  disabled={updateMutation.isPending}
                  onSubmit={async (values) => {
                    await updateMutation.mutateAsync(values);
                  }}
                />
              ) : null}
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Campaign details</CardTitle>
              <CardDescription>
                Created {formatDateTime(campaign.createdAt)}.{" "}
                {campaign.sentAt
                  ? `Sent ${formatDateTime(campaign.sentAt)}.`
                  : campaign.scheduledAt
                    ? `Scheduled for ${formatDateTime(campaign.scheduledAt)}.`
                    : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-1">
                <p className="text-sm font-medium text-slate-900">Subject</p>
                <p className="text-sm text-slate-700">{campaign.subject ?? "No subject"}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium text-slate-900">Preview text</p>
                <p className="text-sm text-slate-700">{campaign.previewText ?? "No preview text"}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium text-slate-900">Message</p>
                <p className="whitespace-pre-wrap rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
                  {campaign.contentText}
                </p>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
