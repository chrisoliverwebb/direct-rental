"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarClock, Check, Clock3, Mail, MessageSquareText, Pencil, Send, Users } from "lucide-react";
import { campaignStatusLabel, channelLabel, recipientSelectionLabel, renderEmailDocumentToHtml } from "@repo/marketing";
import { formatDateTime } from "@repo/shared";
import { BackButton } from "@/components/navigation/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmailCampaignPreview } from "@/features/campaigns/EmailCampaignPreview";
import { useCampaign, useSendCampaign } from "@/features/marketing/hooks";

export function CampaignDetailPage({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingScheduledAt = searchParams.get("scheduledAt") ?? undefined;
  const campaignQuery = useCampaign(campaignId);
  const sendMutation = useSendCampaign(campaignId);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (campaignQuery.data?.status !== "SCHEDULED" || !campaignQuery.data.scheduledAt) {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [campaignQuery.data?.scheduledAt, campaignQuery.data?.status]);

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

  if (campaign.status === "DRAFT") {
    router.replace(`/campaigns/${campaignId}/edit`);
    return <LoadingState rows={3} />;
  }
  const scheduledCountdown =
    campaign.status === "SCHEDULED" && campaign.scheduledAt
      ? formatCountdown(campaign.scheduledAt, now)
      : null;

  const isFutureScheduled =
    campaign.status === "SCHEDULED" &&
    campaign.scheduledAt != null &&
    new Date(campaign.scheduledAt).getTime() > now;

  const renderedEmailHtml = campaign.contentDocument
    ? renderEmailDocumentToHtml(campaign.contentDocument)
    : campaign.contentHtml;

  return (
    <div className="grid gap-6">
      <div className="flex items-start gap-4">
        <div>
          <BackButton href="/campaigns" label="Back to campaigns" />
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{campaign.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">{channelLabel(campaign.channel)}</p>
            <span className="text-muted-foreground/40">·</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium ${
                campaign.status === "SENT"
                  ? "bg-emerald-100 text-emerald-800"
                  : campaign.status === "SCHEDULED"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {campaign.status === "SENT" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Clock3 className="h-3.5 w-3.5" />
              )}
              {campaignStatusLabel(campaign.status)}
            </span>
          </div>
        </div>
        {pendingScheduledAt ? (
          <div className="ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await sendMutation.mutateAsync({
                  sendMode: "SCHEDULED",
                  scheduledAt: new Date(pendingScheduledAt).toISOString(),
                });
                await campaignQuery.refetch();
              }}
              disabled={sendMutation.isPending}
            >
              {sendMutation.isPending
                ? "Scheduling..."
                : `Schedule for ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(pendingScheduledAt))}`}
            </Button>
          </div>
        ) : null}
      </div>

      <Card>
        <>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <CardTitle>Campaign details</CardTitle>
            {isFutureScheduled ? (
              <Button type="button" variant="outline" size="sm" onClick={() => router.push(`/campaigns/${campaignId}/edit`)}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit campaign
              </Button>
            ) : null}
          </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
                <div className="grid gap-3">
                  <Card className="border-slate-200 shadow-none">
                    <CardContent className="grid gap-3 p-4">
                      <DetailRow
                        icon={campaign.channel === "EMAIL" ? <Mail className="h-4 w-4" /> : <MessageSquareText className="h-4 w-4" />}
                        label="Channel"
                        value={channelLabel(campaign.channel)}
                      />
                      <DetailRow
                        icon={<Send className="h-4 w-4" />}
                        label={campaign.status === "SENT" ? "Sent" : "Scheduled"}
                        value={formatDateTime(campaign.sentAt ?? campaign.scheduledAt)}
                        extra={
                          scheduledCountdown ? (
                            <Badge variant="warning" className="mt-2 w-fit">
                              {scheduledCountdown}
                            </Badge>
                          ) : null
                        }
                      />
                      <DetailRow
                        icon={<Users className="h-4 w-4" />}
                        label="Audience"
                        value={recipientSelectionLabel(campaign.recipientSelection)}
                      />
                      <DetailRow
                        icon={<CalendarClock className="h-4 w-4" />}
                        label="Created"
                        value={formatDateTime(campaign.createdAt)}
                      />
                    </CardContent>
                  </Card>
                </div>
                <div className="grid gap-4">
                  {campaign.channel === "EMAIL" ? (
                    <EmailCampaignPreview
                      documentId={campaign.id}
                      subject={campaign.subject ?? ""}
                      previewText={campaign.previewText}
                      contentHtml={renderedEmailHtml}
                    />
                  ) : (
                    <div className="grid gap-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Subject</p>
                          <p className="mt-0.5 text-sm text-slate-900">{campaign.subject ?? <span className="text-muted-foreground">No subject</span>}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Preview text</p>
                          <p className="mt-0.5 text-sm text-slate-900">{campaign.previewText ?? <span className="text-muted-foreground">No preview text</span>}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Message</p>
                        <p className="mt-1.5 whitespace-pre-wrap rounded-md border bg-slate-50 px-4 py-3 text-sm text-slate-800">
                          {campaign.contentText}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </>
        </Card>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  extra,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-md border border-slate-200 bg-white p-1.5 text-slate-500">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm text-slate-900">{value}</p>
          {extra}
        </div>
      </div>
    </div>
  );
}

function formatCountdown(isoDate: string, now: number) {
  const diff = new Date(isoDate).getTime() - now;

  if (diff <= 0) {
    return "Sending now";
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `In ${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `In ${hours}h ${minutes}m`;
  }

  return `In ${minutes}m`;
}
