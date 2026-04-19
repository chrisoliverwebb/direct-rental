"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { campaignStatusLabel, channelLabel, draftCampaignStatusLabel } from "@repo/marketing";
import { formatDateTime } from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { CampaignChannelDialog } from "@/features/campaigns/CampaignChannelDialog";
import { useCampaigns, useDraftCampaigns } from "@/features/marketing/hooks";

export function CampaignsPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const draftCampaignsQuery = useDraftCampaigns();
  const campaignsQuery = useCampaigns();

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Campaigns</h1>
          <p className="mt-1 text-sm text-muted-foreground">Draft campaigns are separate from scheduled and sent campaigns.</p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          Create campaign
        </Button>
      </div>

      <CampaignChannelDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSelectChannel={(channel) => {
          router.push(`/campaigns/new?channel=${channel}`);
        }}
      />

      {draftCampaignsQuery.isLoading || campaignsQuery.isLoading ? <LoadingState rows={5} /> : null}
      {draftCampaignsQuery.isError ? (
        <ErrorState title="Draft campaigns unavailable" description={draftCampaignsQuery.error.message} onRetry={() => draftCampaignsQuery.refetch()} />
      ) : null}
      {campaignsQuery.isError ? (
        <ErrorState title="Campaigns unavailable" description={campaignsQuery.error.message} onRetry={() => campaignsQuery.refetch()} />
      ) : null}

      <section className="grid gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Draft campaigns</h2>
          <p className="mt-1 text-sm text-muted-foreground">Potential campaigns that can be edited, scheduled, or sent.</p>
        </div>
        {draftCampaignsQuery.data && draftCampaignsQuery.data.items.length === 0 ? (
          <EmptyState title="No draft campaigns" description="Create a draft to start building a campaign." />
        ) : null}
        {draftCampaignsQuery.data && draftCampaignsQuery.data.items.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {draftCampaignsQuery.data.items.map((campaign) => (
              <Card key={campaign.id} className="border-slate-200">
                <CardContent className="grid gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/campaigns/${campaign.id}`} className="line-clamp-1 text-base font-medium text-primary">
                        {campaign.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">{channelLabel(campaign.channel)}</p>
                    </div>
                    <Badge variant="secondary">{draftCampaignStatusLabel("DRAFT")}</Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-slate-700">{campaign.previewText ?? campaign.subject ?? "No preview text"}</p>
                  <p className="text-xs text-muted-foreground">Created {formatDateTime(campaign.createdAt)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Scheduled and sent</h2>
          <p className="mt-1 text-sm text-muted-foreground">These are real campaigns that have been scheduled or dispatched.</p>
        </div>
        {campaignsQuery.data && campaignsQuery.data.items.length === 0 ? (
          <EmptyState title="No live campaigns yet" description="Schedule or send a campaign to populate this list." />
        ) : null}
        {campaignsQuery.data && campaignsQuery.data.items.length > 0 ? (
          <div className="rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Sent / scheduled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignsQuery.data.items.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <Link href={`/campaigns/${campaign.id}`} className="font-medium text-primary">
                      {campaign.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={campaign.status === "SENT" ? "success" : campaign.status === "SCHEDULED" ? "warning" : "secondary"}>
                      {campaignStatusLabel(campaign.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{channelLabel(campaign.channel)}</TableCell>
                  <TableCell>{campaign.subject ?? "No subject"}</TableCell>
                  <TableCell>{formatDateTime(campaign.sentAt ?? campaign.scheduledAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        ) : null}
      </section>
    </div>
  );
}
