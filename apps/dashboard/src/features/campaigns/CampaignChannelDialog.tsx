"use client";

import { Mail, MessageSquareText } from "lucide-react";
import type { CreateCampaignRequest } from "@repo/api-contracts";
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
};

export function CampaignChannelDialog({
  open,
  onOpenChange,
  onSelectChannel,
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
            Choose how you want to build this campaign. Email opens the block
            editor. SMS opens a simple text composer.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            className="group grid gap-3 rounded-xl border border-slate-200 p-5 text-left transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => handleSelect("EMAIL")}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-900">
              <Mail className="h-5 w-5" />
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
            className="group grid gap-3 rounded-xl border border-slate-200 p-5 text-left transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => handleSelect("SMS")}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-900">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div className="grid gap-1">
              <h3 className="text-base font-semibold text-slate-900">SMS</h3>
              <p className="text-sm text-muted-foreground">
                Use a simple text-only composer for message campaigns.
              </p>
            </div>
          </button>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
