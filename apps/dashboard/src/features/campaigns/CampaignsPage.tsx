"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { CampaignSummary } from "@repo/api-contracts";
import { campaignStatusLabel, channelLabel, recipientSelectionLabel } from "@repo/marketing";
import { formatDateTime } from "@repo/shared";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, List, Plus } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CampaignChannelDialog } from "@/features/campaigns/CampaignChannelDialog";
import { ChannelBadge } from "@/features/campaigns/ChannelBadge";
import { DraftsList } from "@/features/campaigns/DraftsList";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCampaigns, useDraftCampaigns } from "@/features/marketing/hooks";

type ChannelFilter = "ALL" | CampaignSummary["channel"];
type StatusFilter = "ALL" | CampaignSummary["status"];
type SortDirection = "asc" | "desc";
type ViewMode = "table" | "calendar";
const CAMPAIGNS_VIEW_STORAGE_KEY = "direct-rental.campaigns.view-mode";
const CAMPAIGNS_CALENDAR_MONTH_STORAGE_KEY = "direct-rental.campaigns.calendar-month";

export function CampaignsPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "calendar";
    const stored = window.localStorage.getItem(CAMPAIGNS_VIEW_STORAGE_KEY);
    return stored === "table" || stored === "calendar" ? stored : "calendar";
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [preselectedDate, setPreselectedDate] = useState<Date | null>(null);
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(CAMPAIGNS_CALENDAR_MONTH_STORAGE_KEY);
      if (stored) {
        const [y, m] = stored.split("-").map(Number);
        if (y && m) return new Date(y, m - 1, 1);
      }
    }
    return startOfMonth(new Date());
  });
  const [pickerOpen, setPickerOpen] = useState(false);

  const draftCampaignsQuery = useDraftCampaigns();
  const campaignsQuery = useCampaigns({
    page,
    pageSize,
    channel: channelFilter === "ALL" ? undefined : channelFilter,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    sortDirection,
  });

  const items = useMemo(() => campaignsQuery.data?.items ?? [], [campaignsQuery.data?.items]);
  const totalPages = campaignsQuery.data?.totalPages ?? 1;
  const totalItems = campaignsQuery.data?.totalItems ?? 0;
  const scheduledCount = useMemo(() => items.filter((c) => c.status === "SCHEDULED").length, [items]);

  useEffect(() => {
    window.localStorage.setItem(CAMPAIGNS_VIEW_STORAGE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    const key = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}`;
    window.localStorage.setItem(CAMPAIGNS_CALENDAR_MONTH_STORAGE_KEY, key);
  }, [calendarMonth]);

  const columns = useMemo<ColumnDef<CampaignSummary>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link href={`/campaigns/${row.original.id}`} className="font-medium text-primary">
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.status === "SENT" ? "success" : "warning"}>
            {campaignStatusLabel(row.original.status)}
          </Badge>
        ),
      },
      {
        accessorKey: "channel",
        header: "Channel",
        cell: ({ row }) => <ChannelBadge channel={row.original.channel} />,
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => row.original.subject ?? "No subject",
      },
      {
        accessorKey: "recipientSelection",
        header: "Audience",
        cell: ({ row }) => recipientSelectionLabel(row.original.recipientSelection),
      },
      {
        id: "deliveryAt",
        header: () => (
          <DataTableColumnHeader
            title="Sent / scheduled"
            sorted={sortDirection}
            onToggle={() => setSortDirection((current) => (current === "desc" ? "asc" : "desc"))}
          />
        ),
        cell: ({ row }) => formatDateTime(row.original.sentAt ?? row.original.scheduledAt),
      },
    ],
    [sortDirection],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const resetToFirstPage = () => setPage(1);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Campaigns</h1>
          <p className="mt-1 text-sm text-muted-foreground">Scheduled and sent campaigns appear here.</p>
        </div>
        <div className="flex items-center gap-2">
          {(draftCampaignsQuery.data?.items.length ?? 0) > 0 ? (
            <Button type="button" variant="outline" onClick={() => setDraftsOpen(true)}>
              Drafts
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                {draftCampaignsQuery.data?.items.length}
              </Badge>
            </Button>
          ) : null}
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Create campaign
          </Button>
        </div>
      </div>

      <CampaignChannelDialog
        open={createOpen}
        showDrafts={!preselectedDate}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setPreselectedDate(null);
        }}
        onSelectChannel={(channel) => {
          const params = new URLSearchParams({ channel });
          if (preselectedDate) {
            params.set("scheduledAt", preselectedDate.toISOString().split("T")[0]!);
          }
          router.push(`/campaigns/new?${params.toString()}`);
        }}
        draftCampaigns={draftCampaignsQuery.data?.items ?? []}
        onViewAllDrafts={() => setDraftsOpen(true)}
      />

      <Dialog open={draftsOpen} onOpenChange={setDraftsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Draft campaigns</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DraftsList
              drafts={draftCampaignsQuery.data?.items ?? []}
              allowDelete
              onNavigate={() => setDraftsOpen(false)}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>

      {draftCampaignsQuery.isLoading || campaignsQuery.isLoading ? <LoadingState rows={5} /> : null}
      {draftCampaignsQuery.isError ? (
        <ErrorState
          title="Draft campaigns unavailable"
          description={draftCampaignsQuery.error.message}
          onRetry={() => draftCampaignsQuery.refetch()}
        />
      ) : null}
      {campaignsQuery.isError ? (
        <ErrorState
          title="Campaigns unavailable"
          description={campaignsQuery.error.message}
          onRetry={() => campaignsQuery.refetch()}
        />
      ) : null}

      {campaignsQuery.data ? (
        <Badge variant="secondary" className="h-7 w-fit px-2.5 text-[11px] font-medium">
          {scheduledCount} scheduled campaign{scheduledCount === 1 ? "" : "s"}
        </Badge>
      ) : null}

      <section className="grid gap-3">
        {campaignsQuery.data ? (
          <div className="overflow-hidden rounded-xl border bg-white">
            <div className={viewMode === "calendar" ? "flex items-center gap-3 p-4" : "flex flex-wrap items-end gap-3 p-4"}>
              {viewMode === "table" ? (
                <>
                  <label className="grid gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Channel</span>
                    <select
                      value={channelFilter}
                      onChange={(event) => {
                        setChannelFilter(event.target.value as ChannelFilter);
                        resetToFirstPage();
                      }}
                      className="flex h-10 min-w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="ALL">All channels</option>
                      <option value="EMAIL">Email</option>
                      <option value="SMS">SMS</option>
                    </select>
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</span>
                    <select
                      value={statusFilter}
                      onChange={(event) => {
                        setStatusFilter(event.target.value as StatusFilter);
                        resetToFirstPage();
                      }}
                      className="flex h-10 min-w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="ALL">All statuses</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="SENT">Sent</option>
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 rounded-full px-3 text-xs font-medium"
                    onClick={() => setCalendarMonth(startOfMonth(new Date()))}
                  >
                    Today
                  </Button>
                  <div className="flex flex-1 items-center justify-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 rounded-full px-3 text-sm font-medium text-slate-900"
                      onClick={() => setPickerOpen((open) => !open)}
                    >
                      {new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(calendarMonth)}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                      aria-label="Next month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
              <div className={`${viewMode === "table" ? "ml-auto" : ""} flex items-center gap-2 rounded-lg border border-slate-200 p-1`}>
                <Button
                  type="button"
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  <List className="mr-2 h-4 w-4" />
                  Table
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "calendar" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Calendar
                </Button>
              </div>
            </div>
            {viewMode === "calendar" && pickerOpen ? (
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
                      className="h-8 rounded-full px-3 text-xs"
                      onClick={() => setCalendarMonth(candidate)}
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
                      className="h-8 rounded-full px-3 text-xs"
                      onClick={() => setCalendarMonth(new Date(year, calendarMonth.getMonth(), 1))}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {campaignsQuery.data ? (
          <div className="rounded-xl border bg-white">
            {viewMode === "table" ? (
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="py-10 text-center">
                        <EmptyCampaignState totalItems={totalItems} />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            ) : (
              <CampaignCalendarView
                campaigns={items}
                totalItems={totalItems}
                month={calendarMonth}
                onDateClick={(date) => {
                  setPreselectedDate(date);
                  setCreateOpen(true);
                }}
              />
            )}
            {viewMode === "table" ? (
              <DataTablePagination
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={setPage}
                onPageSizeChange={(nextPageSize) => {
                  setPageSize(nextPageSize);
                  setPage(1);
                }}
              />
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function EmptyCampaignState({ totalItems }: { totalItems: number }) {
  return (
    <div className="grid gap-1">
      <p className="text-sm font-medium text-slate-900">
        {totalItems === 0 ? "No live campaigns yet" : "No campaigns match these filters"}
      </p>
      <p className="text-sm text-muted-foreground">
        {totalItems === 0
          ? "Schedule or send a campaign to populate this list."
          : "Try widening the channel or status filters."}
      </p>
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
    if (!deliveryAt) {
      continue;
    }

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
                  ? "border-sky-400 ring-2 ring-sky-100"
                  : isPast
                    ? "border-slate-200 bg-slate-50/80"
                    : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className={`text-xs font-medium ${isToday ? "text-sky-700" : isPast ? "text-slate-400" : ""}`}>
                  {day.date.getDate()}
                </span>
                <div className="flex items-center gap-1">
                  {dayCampaigns.length > 0 ? <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{dayCampaigns.length}</Badge> : null}
                  {isFuture ? (
                    <button
                      type="button"
                      onClick={() => onDateClick(day.date)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-violet-100 hover:text-violet-700"
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
        <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
          <EmptyCampaignState totalItems={totalItems} />
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
        {isCompleted ? <Check className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
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

    return {
      date,
      inCurrentMonth: date.getMonth() === month.getMonth(),
    };
  });
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
