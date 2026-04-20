"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { DraftCampaignSummary } from "@repo/api-contracts";
import { draftCampaignStatusLabel } from "@repo/marketing";
import { formatDateTime } from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDeleteCampaign } from "@/features/marketing/hooks";
import { ChannelBadge } from "@/features/campaigns/ChannelBadge";

type DraftsListProps = {
  drafts: DraftCampaignSummary[];
  limit?: number;
  allowDelete?: boolean;
  onNavigate?: () => void;
};

export function DraftsList({ drafts, limit, allowDelete = false, onNavigate }: DraftsListProps) {
  const visible = limit ? drafts.slice(0, limit) : drafts;
  const deleteMutation = useDeleteCampaign();

  if (visible.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3">
      {visible.map((campaign) => (
        <div key={campaign.id} className="group flex items-stretch gap-2">
          <Link
            href={`/campaigns/${campaign.id}/edit`}
            onClick={onNavigate}
            className="grid min-w-0 flex-1 gap-2 rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{campaign.name}</p>
                <ChannelBadge channel={campaign.channel} />
              </div>
              <Badge variant="secondary">{draftCampaignStatusLabel("DRAFT")}</Badge>
            </div>
            <p className="line-clamp-2 text-sm text-slate-600">
              {campaign.previewText ?? campaign.subject ?? "No preview text"}
            </p>
            <p className="text-xs text-muted-foreground">Created {formatDateTime(campaign.createdAt)}</p>
          </Link>
          {allowDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-auto w-8 shrink-0 self-stretch opacity-0 transition-opacity group-hover:opacity-100"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(campaign.id)}
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
