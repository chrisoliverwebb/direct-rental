"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CampaignSummary } from "@repo/api-contracts";
import { channelLabel } from "@repo/marketing";
import { Check, Mail, MessageSquare } from "lucide-react";
import { EventMonthCalendar, type EventMonthCalendarEvent } from "@/components/calendar/EventMonthCalendar";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useCampaigns, useDraftCampaigns, useTemplates } from "@/features/marketing/hooks";
import { useSettings } from "@/features/settings/hooks";
import { CreateCampaignDialog, type TemplateLibraryChannelTab } from "@/features/campaigns/CreateCampaignDialog";
import { resolveTemplateScope } from "@/features/campaigns/campaignStarters";

const CALENDAR_MONTH_STORAGE_KEY = "direct-rental.campaigns.calendar-month";

export function CalendarPage() {
  const router = useRouter();

  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(CALENDAR_MONTH_STORAGE_KEY);
      if (stored) {
        const [y, m] = stored.split("-").map(Number);
        if (y && m) return new Date(y, m - 1, 1);
      }
    }
    return startOfMonth(new Date());
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<"channel" | "template">("channel");
  const [createChannel, setCreateChannel] = useState<TemplateLibraryChannelTab | null>(null);
  const [createScheduledAt, setCreateScheduledAt] = useState<string | null>(null);

  const campaignsQuery = useCampaigns({ page: 1, pageSize: 100 });
  const draftCampaignsQuery = useDraftCampaigns();
  const templatesQuery = useTemplates();
  const settingsQuery = useSettings();
  const propertyCount = settingsQuery.data?.properties.filter((p) => p.status === "ACTIVE").length ?? 0;

  const items = campaignsQuery.data?.items ?? [];
  useEffect(() => {
    const key = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}`;
    window.localStorage.setItem(CALENDAR_MONTH_STORAGE_KEY, key);
  }, [calendarMonth]);

  const openCreateFlow = (options?: { scheduledAt?: string; channel?: TemplateLibraryChannelTab | null }) => {
    setCreateScheduledAt(options?.scheduledAt ?? null);
    setCreateChannel(options?.channel ?? null);
    setCreateStep(options?.channel ? "template" : "channel");
    setCreateOpen(true);
  };

  return (
    <div className="grid gap-4">
      {campaignsQuery.isLoading ? <LoadingState rows={5} /> : null}
      {campaignsQuery.isError ? (
        <ErrorState
          title="Campaigns unavailable"
          description={campaignsQuery.error.message}
          onRetry={() => campaignsQuery.refetch()}
        />
      ) : null}

      <section className="grid gap-3">
        {campaignsQuery.data ? (
          <div className="rounded-lg border bg-white">
            <CampaignCalendarView
              campaigns={items}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              onDateClick={(date) => {
                openCreateFlow({ scheduledAt: date.toISOString().split("T")[0] ?? "" });
              }}
            />
          </div>
        ) : null}
      </section>

      <CreateCampaignDialog
        open={createOpen}
        step={createStep}
        selectedChannel={createChannel}
        propertyCount={propertyCount}
        templatesQuery={templatesQuery}
        draftCampaigns={draftCampaignsQuery.data?.items ?? []}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setCreateStep("channel");
            setCreateChannel(null);
            setCreateScheduledAt(null);
          }
        }}
        onViewAllDrafts={() => {
          setCreateOpen(false);
          router.push("/campaigns?tab=drafts");
        }}
        onBack={() => setCreateStep("channel")}
        onSelectChannel={(channel) => {
          setCreateChannel(channel);
          setCreateStep("template");
        }}
        onSelectTemplate={(template) => {
          const params = new URLSearchParams({
            channel: template.channel,
            templateId: template.id,
            scope: resolveTemplateScope(template, propertyCount),
          });
          if (createScheduledAt) {
            params.set("scheduledAt", createScheduledAt);
          }
          setCreateOpen(false);
          router.push(`/campaigns/new?${params.toString()}`);
        }}
      />
    </div>
  );
}

function CampaignCalendarView({
  campaigns,
  month,
  onMonthChange,
  onDateClick,
}: {
  campaigns: CampaignSummary[];
  month: Date;
  onMonthChange: (month: Date) => void;
  onDateClick: (date: Date) => void;
}) {
  const events: EventMonthCalendarEvent[] = campaigns.flatMap((campaign) => {
    const deliveryAt = campaign.sentAt ?? campaign.scheduledAt;
    if (!deliveryAt) return [];

    return [{
      id: campaign.id,
      title: campaign.name,
      date: new Date(deliveryAt),
      tone: campaign.status === "SENT" || Boolean(campaign.sentAt) ? "success" : "default",
    }];
  });

  return (
    <EventMonthCalendar
      month={month}
      onMonthChange={onMonthChange}
      storageKey={CALENDAR_MONTH_STORAGE_KEY}
      events={events}
      emptyMessage="Start from a campaign starter to create your first send."
      onDateClick={onDateClick}
      renderEvent={(event) => {
        const campaign = campaigns.find((entry) => entry.id === event.id);
        return campaign ? <CampaignCalendarItem campaign={campaign} /> : null;
      }}
    />
  );
}

function CampaignCalendarItem({ campaign }: { campaign: CampaignSummary }) {
  const isCompleted = campaign.status === "SENT" || Boolean(campaign.sentAt);
  const deliveryAt = campaign.sentAt ?? campaign.scheduledAt;
  const timeLabel = deliveryAt
    ? new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: false }).format(new Date(deliveryAt))
    : null;

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="relative overflow-hidden rounded-md bg-slate-100 px-1.5 py-1 text-left text-[11px] text-slate-700 transition hover:bg-slate-200"
    >
      <span
        className={`absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-bl-md ${
          isCompleted ? "bg-emerald-600 text-white" : "bg-violet-600 text-white"
        }`}
        aria-hidden="true"
      >
        {isCompleted ? (
          <Check className="h-3 w-3" />
        ) : campaign.channel === "EMAIL" ? (
          <Mail className="h-3 w-3" />
        ) : (
          <MessageSquare className="h-3 w-3" />
        )}
      </span>
      <p className="truncate pr-5 font-medium text-slate-900">{campaign.name}</p>
      <p className="flex items-center gap-1 truncate text-slate-500">
        {channelLabel(campaign.channel)}
        {timeLabel ? (
          <>
            <span className="inline-block h-1 w-1 rounded-full bg-slate-400" aria-hidden="true" />
            {timeLabel}
          </>
        ) : null}
      </p>
    </Link>
  );
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
