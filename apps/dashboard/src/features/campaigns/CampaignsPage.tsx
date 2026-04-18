"use client";

import Link from "next/link";
import { campaignStatusLabel, channelLabel } from "@repo/marketing";
import { formatDateTime } from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useCampaigns } from "@/features/marketing/hooks";

export function CampaignsPage() {
  const campaignsQuery = useCampaigns();

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Campaigns</h1>
          <p className="mt-1 text-sm text-muted-foreground">Drafts, scheduled sends, and past activity.</p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Create campaign
        </Link>
      </div>

      {campaignsQuery.isLoading ? <LoadingState rows={5} /> : null}
      {campaignsQuery.isError ? (
        <ErrorState title="Campaigns unavailable" description={campaignsQuery.error.message} onRetry={() => campaignsQuery.refetch()} />
      ) : null}
      {campaignsQuery.data && campaignsQuery.data.items.length === 0 ? (
        <EmptyState title="No campaigns yet" description="Create your first draft to start testing the flow." />
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
    </div>
  );
}
