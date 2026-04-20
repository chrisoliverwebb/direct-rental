"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Save, Send, Smartphone } from "lucide-react";
import { createCampaignRequestSchema, type CampaignDetail, type CreateCampaignRequest, type SendCampaignRequest } from "@repo/api-contracts";
import { BackButton } from "@/components/navigation/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/forms/FormField";

type SmsCampaignWorkspaceProps = {
  mode: "create" | "edit";
  onBack: () => void;
  onSave: (request: CreateCampaignRequest) => Promise<string>;
  onSend?: (request: SendCampaignRequest) => Promise<void>;
  submitLabel: string;
  initialCampaign?: Partial<CampaignDetail>;
  scheduledAt?: string;
  campaignStatus?: "DRAFT" | "SCHEDULED";
  initialScheduledAt?: string;
};

type SmsFormState = {
  name: string;
  previewText: string;
  contentText: string;
};

function createSnapshot(state: SmsFormState, recipientSelection: CreateCampaignRequest["recipientSelection"]) {
  return JSON.stringify({ ...state, recipientSelection });
}

export function SmsCampaignWorkspace({
  mode,
  onBack,
  onSave,
  onSend,
  submitLabel,
  initialCampaign,
  scheduledAt,
  campaignStatus = "DRAFT",
  initialScheduledAt,
}: SmsCampaignWorkspaceProps) {
  const [form, setForm] = useState<SmsFormState>({
    name: initialCampaign?.name ?? "",
    previewText: initialCampaign?.previewText ?? "",
    contentText: initialCampaign?.contentText ?? "",
  });
  const [recipientSelection, setRecipientSelection] = useState<CreateCampaignRequest["recipientSelection"]>(
    initialCampaign?.recipientSelection ?? { type: "ALL" },
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [scheduledAtInput, setScheduledAtInput] = useState(() => {
    const seed = initialScheduledAt ?? scheduledAt;
    return seed ? new Date(seed).toISOString().slice(0, 16) : "";
  });

  const savedSnapshotRef = useRef(createSnapshot(form, recipientSelection));
  const hasUnsavedChanges = createSnapshot(form, recipientSelection) !== savedSnapshotRef.current;

  const sendDisabledReason = !form.name.trim()
    ? "Campaign name is required"
    : !form.contentText.trim()
      ? "Message body is required"
      : hasUnsavedChanges
        ? "Save your changes before sending"
        : null;

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  const updateField = (field: keyof SmsFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const buildPayload = (): CreateCampaignRequest =>
    createCampaignRequestSchema.parse({
      name: form.name,
      channel: "SMS",
      subject: null,
      previewText: form.previewText.trim() ? form.previewText : null,
      contentHtml: form.contentText.trim() ? `<p>${escapeHtml(form.contentText.trim())}</p>` : "",
      contentText: form.contentText,
      recipientSelection,
    });

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    try {
      setIsSaving(true);
      const payload = buildPayload();
      await onSave(payload);
      savedSnapshotRef.current = createSnapshot(form, recipientSelection);
      toast.success(mode === "create" ? "Campaign draft saved" : "Campaign updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save campaign";
      toast.error("Save failed", { description: message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    if (!onSend) return;
    try {
      setIsSending(true);
      await onSend({ sendMode: "IMMEDIATE" });
      setSendDialogOpen(false);
      toast.success("Campaign sent");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send campaign";
      toast.error("Send failed", { description: message });
    } finally {
      setIsSending(false);
    }
  };

  const handleSchedule = async () => {
    if (!onSend) return;
    if (!scheduledAtInput) {
      toast.error("Choose a scheduled send time");
      return;
    }
    try {
      setIsSending(true);
      await onSend({ sendMode: "SCHEDULED", scheduledAt: new Date(scheduledAtInput).toISOString() });
      setSendDialogOpen(false);
      toast.success("Campaign scheduled");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to schedule campaign";
      toast.error("Schedule failed", { description: message });
    } finally {
      setIsSending(false);
    }
  };

  const handleAttemptExit = () => {
    if (!hasUnsavedChanges) {
      onBack();
      return;
    }
    setExitDialogOpen(true);
  };

  const charCount = form.contentText.length;
  const segmentCount = Math.ceil(charCount / 160) || 1;

  return (
    <div className="grid gap-0">
      {/* Toolbar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <BackButton onClick={handleAttemptExit} label="Back" iconOnly />
          <div className="min-w-0 flex-1">
            <Input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Campaign name"
              className="h-auto max-w-xl border-transparent bg-transparent p-0 text-base font-medium shadow-none focus-visible:border-input focus-visible:bg-background focus-visible:px-3 focus-visible:py-2"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            {mode === "edit" ? (
              <Badge variant={campaignStatus === "SCHEDULED" ? "warning" : "secondary"}>
                {campaignStatus === "SCHEDULED" ? "Scheduled" : "Draft"}
              </Badge>
            ) : null}
            <Badge variant={hasUnsavedChanges ? "warning" : "secondary"}>
              {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
            </Badge>
            <Button type="button" onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : submitLabel}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={previewOpen ? "secondary" : "outline"}
              onClick={() => setPreviewOpen((v) => !v)}
            >
              {previewOpen ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {previewOpen ? "Close preview" : "Preview"}
            </Button>
            <span title={sendDisabledReason ?? undefined}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSendDialogOpen(true)}
                disabled={!onSend || !!sendDisabledReason || isSending}
              >
                <Send className="mr-2 h-4 w-4" />
                {isSending ? "Sending..." : campaignStatus === "SCHEDULED" ? "Edit Schedule" : "Send / Schedule"}
              </Button>
            </span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="grid gap-5">
          <FormField label="Preview text" htmlFor="previewText">
            <Input
              id="previewText"
              value={form.previewText}
              onChange={(e) => updateField("previewText", e.target.value)}
              placeholder="Short description shown in notification previews (optional)"
            />
          </FormField>

          <FormField label="Message" htmlFor="contentText">
            <Textarea
              id="contentText"
              value={form.contentText}
              onChange={(e) => updateField("contentText", e.target.value)}
              placeholder="Write your SMS message..."
              rows={8}
              className="resize-none"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {charCount} character{charCount !== 1 ? "s" : ""} · {segmentCount} SMS segment{segmentCount !== 1 ? "s" : ""}
            </p>
          </FormField>
        </div>
      </div>

      {/* Phone preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              SMS preview
            </DialogTitle>
            <DialogDescription>How this message will appear on the recipient&apos;s phone.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <SmsPhonePreview
              senderName="Direct Rental"
              previewText={form.previewText}
              messageText={form.contentText}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Discard dialog */}
      <Dialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes in this campaign. Leave now and your latest edits will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setExitDialogOpen(false)}>
              Keep editing
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setExitDialogOpen(false);
                onBack();
              }}
            >
              Leave editor
            </Button>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Send dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send campaign</DialogTitle>
            <DialogDescription>
              Choose whether to send this campaign immediately or schedule it for later.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-900">Who</span>
              <select
                value={recipientSelection.type}
                onChange={() => setRecipientSelection({ type: "ALL" })}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="ALL">All contacts</option>
              </select>
            </label>
            <div className="grid gap-3 rounded-lg border border-slate-200 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {campaignStatus === "SCHEDULED" ? "Edit schedule" : "Schedule"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {campaignStatus === "SCHEDULED"
                    ? "Update the scheduled send time for this campaign."
                    : "Pick a future time and this campaign will move into scheduled campaigns."}
                </p>
              </div>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-900">Scheduled for</span>
                <Input
                  type="datetime-local"
                  value={scheduledAtInput}
                  onChange={(e) => setScheduledAtInput(e.target.value)}
                />
              </label>
              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={handleSchedule} disabled={isSending || !scheduledAtInput}>
                  {campaignStatus === "SCHEDULED" ? "Update schedule" : "Schedule"}
                </Button>
              </div>
            </div>
            <div className="grid gap-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {campaignStatus === "SCHEDULED" ? "Send now instead" : "Send now"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {campaignStatus === "SCHEDULED"
                      ? "Cancel the schedule and send to all recipients immediately."
                      : "Send to all selected recipients right away."}
                  </p>
                </div>
                <Button type="button" onClick={handleSend} disabled={isSending}>
                  {isSending ? "Sending..." : "Send now"}
                </Button>
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SmsPhonePreview({
  senderName,
  previewText,
  messageText,
}: {
  senderName: string;
  previewText?: string;
  messageText: string;
}) {
  const now = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date());

  return (
    <div className="mx-auto w-[260px]">
      {/* Phone shell */}
      <div className="relative rounded-[2rem] border-4 border-slate-800 bg-slate-900 p-1 shadow-xl">
        {/* Notch */}
        <div className="absolute left-1/2 top-3 h-4 w-20 -translate-x-1/2 rounded-full bg-slate-800" />
        {/* Screen */}
        <div className="overflow-hidden rounded-[1.6rem] bg-white">
          {/* Status bar */}
          <div className="flex items-center justify-between bg-slate-50 px-5 pt-8 pb-1">
            <span className="text-[10px] font-semibold text-slate-700">{now}</span>
            <div className="flex items-center gap-1">
              <div className="h-2 w-3 rounded-sm bg-slate-700 opacity-80" />
              <div className="h-2.5 w-1 rounded-sm bg-slate-700" />
            </div>
          </div>
          {/* Header */}
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-center">
            <p className="text-[11px] font-semibold text-slate-900">{senderName}</p>
            {previewText ? (
              <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">{previewText}</p>
            ) : null}
          </div>
          {/* Message area */}
          <div className="min-h-[180px] bg-white p-4">
            {messageText.trim() ? (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg rounded-tl-sm bg-slate-100 px-3 py-2">
                  <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-slate-900">{messageText}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{now}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-[11px] text-muted-foreground">Message preview will appear here</p>
            )}
          </div>
          {/* Reply bar */}
          <div className="border-t border-slate-100 px-3 py-2">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              <span className="flex-1 text-[11px] text-slate-400">iMessage</span>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-300">
                <div className="h-2.5 w-2.5 rounded-full bg-white" />
              </div>
            </div>
          </div>
          {/* Home bar */}
          <div className="flex justify-center pb-3 pt-1">
            <div className="h-1 w-16 rounded-full bg-slate-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
