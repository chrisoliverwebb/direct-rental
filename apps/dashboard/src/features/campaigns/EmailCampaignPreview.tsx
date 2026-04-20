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
      <div className="mx-auto flex min-h-full max-w-[860px] flex-col rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              DR
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold text-slate-950">{subject || "Campaign subject preview"}</p>
              <p className="text-sm text-slate-500">
                {senderName} &lt;{senderEmail}&gt;
              </p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>{previewMailbox.previewTimestamp}</p>
            </div>
          </div>
          {previewText ? (
            <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-500">{previewText}</p>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_14%)] p-4 lg:p-8">
          <div
            className="mx-auto max-w-[600px] rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 overflow-hidden bg-[radial-gradient(circle_at_top_left,_#fffdf8,_#f3ede1_58%,_#ece4d4)] lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="hidden min-h-0 border-r border-slate-200/80 bg-white/65 backdrop-blur lg:flex lg:flex-col">
        <div className="border-b border-slate-200/80 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
            <Search className="h-4 w-4" />
            Search mail
          </div>
        </div>
        <div className="border-b border-slate-200/80 px-3 py-3">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm">
              <Inbox className="h-4 w-4" />
              Inbox
              <span className="ml-auto rounded-full bg-white/15 px-2 py-0.5 text-xs">
                {previewMailbox.inboxItems.filter((item) => item.unread).length} new
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-600 transition hover:bg-white/70">
              <Send className="h-4 w-4" />
              Sent
            </div>
            <div className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-600 transition hover:bg-white/70">
              <PanelBottom className="h-4 w-4" />
              Drafts
            </div>
            <div className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-600 transition hover:bg-white/70">
              <Trash2 className="h-4 w-4" />
              Bin
            </div>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3">
          <div className="grid gap-2 overflow-x-hidden">
            {previewMailbox.inboxItems.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "min-w-0 overflow-hidden rounded-2xl border p-3 shadow-sm transition",
                  index === 0
                    ? "border-sky-200 bg-sky-50/90"
                    : item.unread
                      ? "border-slate-200 bg-white"
                      : "border-transparent bg-white/55",
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-1 h-10 w-10 rounded-full bg-slate-900 text-center text-sm font-semibold leading-10 text-white">
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
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                          New
                        </span>
                      ) : null}
                    </div>
                    <p className={cn("mt-1 truncate text-sm text-slate-900", item.unread && "font-medium")}>
                      {index === 0 ? subject || item.subject : item.subject}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {index === 0 ? previewText || item.previewText : item.previewText}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-[11px] text-slate-400">{index === 0 ? previewMailbox.previewTimestamp : item.timestamp}</p>
                    {item.starred ? <Star className="h-4 w-4 text-amber-400" /> : <div className="h-4 w-4" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
