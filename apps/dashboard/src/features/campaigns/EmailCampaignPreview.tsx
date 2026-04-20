"use client";

import { useMemo } from "react";
import { Faker, base, en, en_GB } from "@faker-js/faker";
import { getUserDisplayName } from "@repo/auth";
import { Inbox, PanelBottom, Search, Send, Star, Trash2 } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks";
import { cn } from "@/lib/utils";

type PreviewMailboxData = {
  previewTimestamp: string;
  inboxItems: Array<{
    id: string;
    senderName: string;
    subject: string;
    previewText: string;
    timestamp: string;
    unread: boolean;
    starred: boolean;
  }>;
};

type EmailCampaignPreviewProps = {
  documentId: string;
  subject: string;
  previewText?: string | null;
  contentHtml: string;
  showMailboxChrome?: boolean;
};

function createPreviewMailboxData(seedSource: string): PreviewMailboxData {
  const faker = new Faker({ locale: [en_GB, en, base] });
  const seed = Array.from(seedSource).reduce((total, character) => total + character.charCodeAt(0), 0);
  faker.seed(seed || 1);

  const inboxItems = Array.from({ length: 6 }, (_, index) => ({
    id: faker.string.uuid(),
    senderName: index === 0 ? "Direct Rental" : faker.person.fullName(),
    subject:
      index === 0
        ? "Campaign subject preview"
        : faker.helpers.arrayElement([
            "Booking confirmed for June stay",
            "Owner statement ready to review",
            "Check-in details for your guests",
            "Direct booking enquiry received",
            "Reminder: guest arrival tomorrow",
          ]),
    previewText:
      index === 0
        ? "Preview text appears here in the inbox list."
        : faker.helpers.arrayElement([
            "Everything is ready for the next step.",
            "A quick note to confirm the latest update.",
            "Your latest booking details are waiting.",
            "Open to review the most recent guest activity.",
            "There is a new message waiting in your account.",
          ]),
    timestamp: faker.date.recent({ days: 3 }).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    unread: index < 2,
    starred: faker.datatype.boolean(),
  }));

  return {
    previewTimestamp: faker.date.recent({ days: 2 }).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    inboxItems,
  };
}

export function EmailCampaignPreview({
  documentId,
  subject,
  previewText,
  contentHtml,
  showMailboxChrome = false,
}: EmailCampaignPreviewProps) {
  const { data: currentUser } = useCurrentUser();
  const senderName = getUserDisplayName(currentUser) || "Direct Rental";
  const senderEmail = currentUser?.email ?? "owner@directrental.test";
  const previewMailbox = useMemo(
    () => createPreviewMailboxData(`${documentId}:${subject}:${previewText ?? ""}`),
    [documentId, previewText, subject],
  );

  if (!showMailboxChrome) {
    return (
      <div className="mx-auto flex min-h-full max-w-[860px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-slate-900 text-xs font-semibold text-white">
              DR
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-slate-900">{subject || "Campaign subject preview"}</p>
              <p className="text-sm text-slate-500">
                {senderName} &lt;{senderEmail}&gt;
              </p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>{previewMailbox.previewTimestamp}</p>
            </div>
          </div>
          {previewText ? (
            <p className="mt-3 border-l-2 border-slate-200 pl-3 text-sm text-slate-500">{previewText}</p>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-8">
          <div
            className="mx-auto max-w-[600px] border border-slate-200 bg-white"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 overflow-hidden border-t bg-slate-50 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="hidden min-h-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-200 p-3">
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400">
            <Search className="h-3.5 w-3.5" />
            Search mail
          </div>
        </div>
        <div className="border-b border-slate-200 px-2 py-2">
          <div className="grid gap-0.5">
            <div className="flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white">
              <Inbox className="h-4 w-4" />
              Inbox
              <span className="ml-auto rounded bg-white/20 px-1.5 py-0.5 text-xs tabular-nums">
                {previewMailbox.inboxItems.filter((item) => item.unread).length} new
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
              <Send className="h-4 w-4" />
              Sent
            </div>
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
              <PanelBottom className="h-4 w-4" />
              Drafts
            </div>
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
              <Trash2 className="h-4 w-4" />
              Bin
            </div>
          </div>
        </div>
        <div className="min-h-0 flex-1 divide-y overflow-y-auto">
          {previewMailbox.inboxItems.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "min-w-0 overflow-hidden p-3 transition-colors",
                index === 0
                  ? "border-l-2 border-l-primary bg-primary/5"
                  : item.unread
                    ? "bg-white"
                    : "bg-white/70",
              )}
            >
              <div className="flex min-w-0 items-start gap-2.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-700 text-[11px] font-semibold text-white">
                  {item.senderName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className={cn("truncate text-sm text-slate-900", item.unread && "font-semibold")}>
                      {index === 0 ? senderName : item.senderName}
                    </p>
                    {item.unread ? (
                      <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className={cn("mt-0.5 truncate text-sm text-slate-700", item.unread && "font-medium")}>
                    {index === 0 ? subject || item.subject : item.subject}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                    {index === 0 ? previewText || item.previewText : item.previewText}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <p className="text-[10px] text-slate-400">{index === 0 ? previewMailbox.previewTimestamp : item.timestamp}</p>
                  {item.starred ? <Star className="h-3.5 w-3.5 text-amber-400" /> : <div className="h-3.5 w-3.5" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="min-h-0 overflow-y-auto p-4 lg:p-6">
        <EmailCampaignPreview
          documentId={documentId}
          subject={subject}
          previewText={previewText}
          contentHtml={contentHtml}
        />
      </div>
    </div>
  );
}
