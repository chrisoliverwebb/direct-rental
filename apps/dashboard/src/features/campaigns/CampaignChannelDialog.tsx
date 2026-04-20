"use client";

import { Mail, MessageSquareText } from "lucide-react";
import type { CreateCampaignRequest, DraftCampaignSummary } from "@repo/api-contracts";
import { Button } from "@/components/ui/button";
import { DraftsList } from "@/features/campaigns/DraftsList";
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";

type CampaignChannel = CreateCampaignRequest["channel"];

type CampaignChannelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectChannel: (channel: CampaignChannel) => void;
  draftCampaigns?: DraftCampaignSummary[];
  showDrafts?: boolean;
  onViewAllDrafts?: () => void;
};

export function CampaignChannelDialog({
  open,
  onOpenChange,
  onSelectChannel,
  draftCampaigns = [],
  showDrafts = true,
  onViewAllDrafts,
}: CampaignChannelDialogProps) {
  const handleSelect = (channel: CampaignChannel) => {
    onSelectChannel(channel);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create campaign</DialogTitle>
          <DialogDescription>
            Continue where you left off, or start a new email or SMS campaign.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="grid gap-6">
          <div className="grid gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Create a new one</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Email opens the block editor. SMS opens a simple text composer.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            className="group grid gap-3 rounded-lg border border-slate-200 p-5 text-left transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => handleSelect("EMAIL")}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
              <Mail className="h-4 w-4" />
            </div>
            <div className="grid gap-1">
              <h3 className="text-base font-semibold text-slate-900">Email</h3>
              <p className="text-sm text-muted-foreground">
                Use the Lexical block editor for rich email content.
              </p>
            </div>
          </button>

          <button
            type="button"
            className="group grid gap-3 rounded-lg border border-slate-200 p-5 text-left transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => handleSelect("SMS")}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
              <MessageSquareText className="h-4 w-4" />
            </div>
            <div className="grid gap-1">
              <h3 className="text-base font-semibold text-slate-900">SMS</h3>
              <p className="text-sm text-muted-foreground">
                Use a simple text-only composer for message campaigns.
              </p>
            </div>
          </button>
            </div>
          </div>
          {showDrafts && draftCampaigns.length > 0 ? (
            <div className="grid gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Continue where you left off</h3>
                <p className="mt-1 text-sm text-muted-foreground">Resume one of your draft campaigns.</p>
              </div>
              <DraftsList drafts={draftCampaigns} limit={1} onNavigate={() => onOpenChange(false)} />
              {onViewAllDrafts && draftCampaigns.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full text-muted-foreground"
                  onClick={() => {
                    onOpenChange(false);
                    onViewAllDrafts();
                  }}
                >
                  See all {draftCampaigns.length} drafts
                </Button>
              ) : null}
            </div>
          ) : null}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
