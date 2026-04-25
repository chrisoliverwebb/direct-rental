"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CampaignSummary } from "@repo/api-contracts";
import { channelLabel } from "@repo/marketing";
import { Check, ChevronLeft, ChevronRight, Mail, MessageSquare, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [pickerOpen, setPickerOpen] = useState(false);
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
  const totalItems = campaignsQuery.data?.totalItems ?? 0;

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
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold text-slate-900">Calendar</h1>
          <p className="text-sm text-muted-foreground">View your scheduled and sent campaigns on the calendar.</p>
        </div>
        <Button type="button" onClick={() => openCreateFlow()}>
          New campaign
        </Button>
      </div>

      {campaignsQuery.isLoading ? <LoadingState rows={5} /> : null}
      {campaignsQuery.isError ? (
        <ErrorState
          title="Campaigns unavailable"
          description={campaignsQuery.error.message}
          onRetry={() => campaignsQuery.refetch()}
        />
      ) : null}

      <section className="grid gap-3">
        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="grid items-center gap-3 p-4 md:grid-cols-[auto_1fr_auto]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0 rounded-md px-3 text-xs font-medium"
              onClick={() => setCalendarMonth(startOfMonth(new Date()))}
            >
              Today
            </Button>
            <div className="flex items-center justify-center gap-1 justify-self-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-8 rounded-md px-3 text-sm font-medium text-slate-900"
                onClick={() => setPickerOpen((open) => !open)}
              >
                {new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(calendarMonth)}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div />
          </div>
          {pickerOpen ? (
            <div className="flex flex-wrap items-center gap-2 border-t bg-slate-50 p-3">
              {Array.from({ length: 12 }, (_, index) => {
                const candidate = new Date(calendarMonth.getFullYear(), index, 1);
                const isSelected = index === calendarMonth.getMonth();
                return (
                  <Button
                    key={index}
                    type="button"
                    size="sm"
                    variant={isSelected ? "secondary" : "ghost"}
                    className="h-8 rounded-md px-3 text-xs"
                    onClick={() => {
                      setCalendarMonth(candidate);
                      setPickerOpen(false);
                    }}
                  >
                    {new Intl.DateTimeFormat("en-GB", { month: "short" }).format(candidate)}
                  </Button>
                );
              })}
              <div className="ml-auto flex items-center gap-2">
                {buildYearOptions(calendarMonth).map((year) => (
                  <Button
                    key={year}
                    type="button"
                    size="sm"
                    variant={year === calendarMonth.getFullYear() ? "secondary" : "ghost"}
                    className="h-8 rounded-md px-3 text-xs"
                    onClick={() => {
                      setCalendarMonth(new Date(year, calendarMonth.getMonth(), 1));
                      setPickerOpen(false);
                    }}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {campaignsQuery.data ? (
          <div className="rounded-lg border bg-white">
            <CampaignCalendarView
              campaigns={items}
              totalItems={totalItems}
              month={calendarMonth}
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
  totalItems,
  month,
  onDateClick,
}: {
  campaigns: CampaignSummary[];
  totalItems: number;
  month: Date;
  onDateClick: (date: Date) => void;
}) {
  const days = buildCalendarDays(month);
  const campaignsByDay = new Map<string, CampaignSummary[]>();

  for (const campaign of campaigns) {
    const deliveryAt = campaign.sentAt ?? campaign.scheduledAt;
    if (!deliveryAt) continue;
    const key = toDateKey(new Date(deliveryAt));
    const existing = campaignsByDay.get(key) ?? [];
    existing.push(campaign);
    campaignsByDay.set(key, existing);
  }

  return (
    <div className="grid gap-3 p-4">
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = toDateKey(day.date);
          const dayCampaigns = campaignsByDay.get(key) ?? [];
          const isToday = isSameCalendarDay(day.date, new Date());
          const isPast = isBeforeToday(day.date);

          if (!day.inCurrentMonth) {
            return <div key={key} className="min-h-[112px] rounded-lg border border-dashed border-slate-100 bg-transparent" />;
          }

          const isFuture = !isPast;
          return (
            <div
              key={key}
              className={`group min-h-[112px] rounded-lg border bg-white p-1.5 ${
                isToday
                  ? "border-primary ring-2 ring-primary/10"
                  : isPast
                    ? "border-slate-200 bg-slate-50/80"
                    : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className={`text-xs font-medium ${isToday ? "text-primary" : isPast ? "text-slate-400" : ""}`}>
                  {day.date.getDate()}
                </span>
                <div className="flex items-center gap-1">
                  {dayCampaigns.length > 0 ? (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                      {dayCampaigns.length}
                    </Badge>
                  ) : null}
                  {isFuture ? (
                    <button
                      type="button"
                      onClick={() => onDateClick(day.date)}
                      className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-slate-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-200"
                      aria-label={`Add campaign on ${day.date.toLocaleDateString()}`}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="grid gap-1">
                {dayCampaigns.slice(0, 2).map((campaign) => (
                  <CampaignCalendarItem key={campaign.id} campaign={campaign} />
                ))}
                {dayCampaigns.length > 2 ? (
                  <p className="text-[11px] text-muted-foreground">+{dayCampaigns.length - 2} more</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {campaigns.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 py-10 text-center">
          <div className="grid gap-1">
            <p className="text-sm font-medium text-slate-900">No campaigns yet</p>
            <p className="text-sm text-muted-foreground">Start from a campaign starter to create your first send.</p>
          </div>
        </div>
      ) : null}
    </div>
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

function buildYearOptions(month: Date) {
  const currentYear = month.getFullYear();
  return Array.from({ length: 9 }, (_, index) => currentYear - 4 + index);
}

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isBeforeToday(date: Date) {
  const today = new Date();
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return dateOnly < todayOnly;
}

function buildCalendarDays(month: Date) {
  const firstDay = startOfMonth(month);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - firstWeekday);

  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return { date, inCurrentMonth: date.getMonth() === month.getMonth() };
  });
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
