"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { CampaignSummary, DraftCampaignSummary, TemplateSummary } from "@repo/api-contracts";
import { campaignStatusLabel, channelLabel, recipientSelectionLabel } from "@repo/marketing";
import { formatDateTime } from "@repo/shared";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronRightIcon,
  Mail,
  MessageSquare,
  MessageSquareText,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { TabSelector } from "@/components/ui/tab-selector";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  filterTemplatesForPropertyCount,
  getGoalLabel,
  groupTemplatesByGoal,
  resolveTemplateScope,
} from "@/features/campaigns/campaignStarters";
import { ChannelBadge } from "@/features/campaigns/ChannelBadge";
import { DraftsList } from "@/features/campaigns/DraftsList";
import { useCampaigns, useDraftCampaigns, useTemplates } from "@/features/marketing/hooks";
import { useSettings } from "@/features/settings/hooks";

type ChannelFilter = "ALL" | CampaignSummary["channel"];
type SortDirection = "asc" | "desc";
type CampaignTab = "scheduled" | "sent" | "drafts" | "calendar" | "templates";
type TemplateLibraryChannelTab = "ALL" | TemplateSummary["channel"];

const CAMPAIGNS_CALENDAR_MONTH_STORAGE_KEY = "direct-rental.campaigns.calendar-month";
const campaignTabs: Array<{ id: Exclude<CampaignTab, "templates" | "calendar">; label: string }> = [
  { id: "scheduled", label: "Scheduled" },
  { id: "sent", label: "Sent" },
  { id: "drafts", label: "Draft" },
];
export function CampaignsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = normalizeTab(searchParams.get("tab"));
  const [activeTab, setActiveTab] = useState<CampaignTab>(requestedTab);
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("ALL");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<"channel" | "template">("channel");
  const [createChannel, setCreateChannel] = useState<TemplateLibraryChannelTab | null>(null);
  const [createScheduledAt, setCreateScheduledAt] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [templateFiltersOpen, setTemplateFiltersOpen] = useState(false);
  const [templateLibraryChannel, setTemplateLibraryChannel] = useState<TemplateLibraryChannelTab>("ALL");
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
  const templatesQuery = useTemplates();
  const settingsQuery = useSettings();
  const propertyCount = settingsQuery.data?.properties.filter((property) => property.status === "ACTIVE").length ?? 0;
  useEffect(() => {
    setActiveTab(requestedTab);
  }, [requestedTab]);

  const effectiveStatusFilter =
    activeTab === "scheduled" ? "SCHEDULED" : activeTab === "sent" ? "SENT" : activeTab === "drafts" ? "DRAFT" : undefined;

  const campaignsQuery = useCampaigns({
    page,
    pageSize,
    channel: channelFilter === "ALL" ? undefined : channelFilter,
    status: effectiveStatusFilter,
    sortDirection,
  });

  const items = useMemo(() => campaignsQuery.data?.items ?? [], [campaignsQuery.data?.items]);
  const totalPages = campaignsQuery.data?.totalPages ?? 1;
  const totalItems = campaignsQuery.data?.totalItems ?? 0;
  const scheduledCount = useMemo(() => items.filter((c) => c.status === "SCHEDULED").length, [items]);

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
        cell: ({ row }) => formatDateTime(row.original.sentAt ?? row.original.scheduledAt ?? row.original.createdAt),
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
  const openCreateFlow = (options?: { scheduledAt?: string; channel?: TemplateLibraryChannelTab | null }) => {
    setCreateScheduledAt(options?.scheduledAt ?? null);
    setCreateChannel(options?.channel ?? null);
    setCreateStep(options?.channel ? "template" : "channel");
    setCreateOpen(true);
  };
  const pageTitle = activeTab === "templates" ? "Template library" : "Campaigns";
  const pageDescription =
    activeTab === "templates"
      ? "Browse ready-made campaign starters for email and SMS."
      : activeTab === "calendar"
        ? "View your scheduled and sent campaigns on the calendar."
        : "Review scheduled sends, sent campaigns, and drafts.";
  const switchTab = (tab: CampaignTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/campaigns?${params.toString()}`);
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold text-slate-900">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground">{pageDescription}</p>
        </div>
        {activeTab === "templates" ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-lg"
            onClick={() => setTemplateFiltersOpen((open) => !open)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
            <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-[10px]">
              {templateLibraryChannel === "ALL" ? 0 : 1}
            </Badge>
          </Button>
        ) : (
          <Button type="button" onClick={() => openCreateFlow()}>
            New campaign
          </Button>
        )}
      </div>

      {activeTab !== "templates" && activeTab !== "calendar" ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabSelector
            options={campaignTabs.map((tab) => ({ value: tab.id, label: tab.label }))}
            value={activeTab as Exclude<CampaignTab, "templates" | "calendar">}
            onChange={(value) => switchTab(value)}
          />
          <Button
            type="button"
            variant={filtersOpen || channelFilter !== "ALL" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-lg"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
            {channelFilter !== "ALL" ? (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-[10px]">
                1
              </Badge>
            ) : null}
          </Button>
        </div>
      ) : null}

      {activeTab !== "templates" && activeTab !== "calendar" && filtersOpen ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
            <div className="grid gap-0.5">
              <p className="text-sm font-medium text-slate-900">Filters</p>
              <p className="text-xs text-slate-500">Refine the current campaign list.</p>
            </div>
            {channelFilter !== "ALL" ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setChannelFilter("ALL");
                  resetToFirstPage();
                }}
              >
                Clear filters
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-end gap-3 p-4">
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Channel</span>
              <Select
                value={channelFilter}
                onChange={(event) => {
                  setChannelFilter(event.target.value as ChannelFilter);
                  resetToFirstPage();
                }}
                className="min-w-[140px]"
              >
                <option value="ALL">All channels</option>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
              </Select>
            </label>
          </div>
        </div>
      ) : null}

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
          switchTab("drafts");
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

      {activeTab === "templates" ? (
        <CampaignStarterLibrary
          propertyCount={propertyCount}
          selectedChannel={templateLibraryChannel}
          onSelectChannel={setTemplateLibraryChannel}
          filtersOpen={templateFiltersOpen}
          templatesQuery={templatesQuery}
          onUseTemplate={(template) => {
            const params = new URLSearchParams({
              channel: template.channel,
              templateId: template.id,
              scope: resolveTemplateScope(template, propertyCount),
            });
            router.push(`/campaigns/new?${params.toString()}`);
          }}
        />
      ) : activeTab === "calendar" ? (
        <>
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
                    openCreateFlow({
                      scheduledAt: date.toISOString().split("T")[0] ?? "",
                    });
                  }}
                />
              </div>
            ) : null}
          </section>
        </>
      ) : (
        <>
          {campaignsQuery.isLoading ? <LoadingState rows={5} /> : null}
          {campaignsQuery.isError ? (
            <ErrorState
              title="Campaigns unavailable"
              description={campaignsQuery.error.message}
              onRetry={() => campaignsQuery.refetch()}
            />
          ) : null}

          {campaignsQuery.data ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="h-7 w-fit px-2.5 text-[11px] font-medium">
                {totalItems} {activeTab === "scheduled" ? "scheduled" : activeTab === "sent" ? "sent" : "draft"} campaign{totalItems === 1 ? "" : "s"}
              </Badge>
            </div>
          ) : null}

          <section className="grid gap-3">
            {campaignsQuery.data ? (
              <div className="rounded-lg border bg-white">
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
              </div>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}

function CreateCampaignDialog({
  open,
  step,
  selectedChannel,
  propertyCount,
  templatesQuery,
  draftCampaigns,
  onOpenChange,
  onViewAllDrafts,
  onBack,
  onSelectChannel,
  onSelectTemplate,
}: {
  open: boolean;
  step: "channel" | "template";
  selectedChannel: TemplateLibraryChannelTab | null;
  propertyCount: number;
  templatesQuery: ReturnType<typeof useTemplates>;
  draftCampaigns: DraftCampaignSummary[];
  onOpenChange: (open: boolean) => void;
  onViewAllDrafts: () => void;
  onBack: () => void;
  onSelectChannel: (channel: TemplateLibraryChannelTab) => void;
  onSelectTemplate: (template: TemplateSummary) => void;
}) {
  const visibleTemplates = selectedChannel
    ? filterTemplatesForPropertyCount(
        (templatesQuery.data?.items ?? []).filter((template) => template.channel === selectedChannel),
        propertyCount,
      )
    : [];
  const groupedTemplates = groupTemplatesByGoal(visibleTemplates).filter((group) => group.templates.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create campaign</DialogTitle>
        </DialogHeader>
        <DialogBody className="grid gap-6">
          {step === "channel" ? (
            <>
              <p className="text-sm text-muted-foreground">
                Choose the channel first. You will pick a ready-made campaign starter in the next step.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  className="grid gap-3 rounded-xl border border-slate-200 p-5 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  onClick={() => onSelectChannel("EMAIL")}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="grid gap-1">
                    <p className="text-base font-semibold text-slate-900">Email</p>
                    <p className="text-sm text-muted-foreground">
                      Branded campaigns, property storytelling, and richer promotional layouts.
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  className="grid gap-3 rounded-xl border border-slate-200 p-5 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  onClick={() => onSelectChannel("SMS")}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                    <MessageSquareText className="h-4 w-4" />
                  </div>
                  <div className="grid gap-1">
                    <p className="text-base font-semibold text-slate-900">SMS</p>
                    <p className="text-sm text-muted-foreground">
                      Short-notice offers, reminders, and direct text-only promotions.
                    </p>
                  </div>
                </button>
              </div>
              {draftCampaigns.length > 0 ? (
                <div className="grid gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Continue a draft instead</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Resume one of your in-progress campaigns.</p>
                  </div>
                  <DraftsList drafts={draftCampaigns} limit={1} onNavigate={() => onOpenChange(false)} />
                  {draftCampaigns.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground"
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
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="grid gap-1">
                  <p className="text-sm font-medium text-slate-900">Step 2 of 2</p>
                  <p className="text-sm text-muted-foreground">
                    Pick a {selectedChannel === "EMAIL" ? "email" : "SMS"} starter. Compatible templates are filtered automatically.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={onBack}>
                  Back
                </Button>
              </div>
              {templatesQuery.isLoading ? <LoadingState rows={4} /> : null}
              {templatesQuery.isError ? (
                <ErrorState
                  title="Campaign starters unavailable"
                  description={templatesQuery.error.message}
                  onRetry={() => templatesQuery.refetch()}
                />
              ) : null}
              {!templatesQuery.isLoading && !templatesQuery.isError ? (
                groupedTemplates.length > 0 ? (
                  <div className="grid gap-6">
                    {groupedTemplates.map((group) => (
                      <section key={group.goal} className="grid gap-3">
                        <div className="grid gap-1">
                          <h3 className="text-base font-semibold text-slate-900">{getGoalLabel(group.goal)}</h3>
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                        </div>
                        <div className="grid gap-4 xl:grid-cols-2">
                          {group.templates.map((template) => (
                            <Card key={template.id} className="border-slate-200">
                              <CardHeader>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="grid gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge variant="outline">{template.channel === "EMAIL" ? "Email" : "SMS"}</Badge>
                                    </div>
                                    <CardTitle className="text-lg">{template.name}</CardTitle>
                                    <CardDescription>{template.description}</CardDescription>
                                  </div>
                                  <Button type="button" size="sm" onClick={() => onSelectTemplate(template)}>
                                    Open editor
                                    <ChevronRightIcon className="ml-2 h-4 w-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                {template.channel === "EMAIL" ? (
                                  <EmailTemplatePreview template={template} />
                                ) : (
                                  <SmsTemplatePreview template={template} />
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title={`No ${selectedChannel === "EMAIL" ? "email" : "SMS"} starters available`}
                    description="Add more active properties or switch channel to see more compatible starters."
                  />
                )
              ) : null}
            </>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

function CampaignStarterLibrary({
  propertyCount,
  selectedChannel,
  onSelectChannel,
  filtersOpen,
  templatesQuery,
  onUseTemplate,
}: {
  propertyCount: number;
  selectedChannel: TemplateLibraryChannelTab;
  onSelectChannel: (channel: TemplateLibraryChannelTab) => void;
  filtersOpen: boolean;
  templatesQuery: ReturnType<typeof useTemplates>;
  onUseTemplate: (template: TemplateSummary) => void;
}) {
  if (templatesQuery.isLoading) {
    return <LoadingState rows={4} />;
  }

  if (templatesQuery.isError) {
    return (
      <ErrorState
        title="Campaign starters unavailable"
        description={templatesQuery.error.message}
        onRetry={() => templatesQuery.refetch()}
      />
    );
  }

  const channelTemplates = (templatesQuery.data?.items ?? []).filter((template) =>
    selectedChannel === "ALL" ? true : template.channel === selectedChannel,
  );
  const compatibleTemplates = filterTemplatesForPropertyCount(channelTemplates, propertyCount);
  const groupedTemplates = groupTemplatesByGoal(compatibleTemplates).filter((group) => group.templates.length > 0);

  return (
    <div className="grid gap-6">
      {filtersOpen ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
            <div className="grid gap-0.5">
              <p className="text-sm font-medium text-slate-900">Filters</p>
              <p className="text-xs text-slate-500">Refine the current template library.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3 p-4">
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Channel</span>
              <Select
                value={selectedChannel}
                onChange={(event) => onSelectChannel(event.target.value as TemplateLibraryChannelTab)}
                className="min-w-[140px]"
              >
                <option value="ALL">All channels</option>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
              </Select>
            </label>
          </div>
        </div>
      ) : null}

      {groupedTemplates.length === 0 ? (
        <EmptyState
          title={`No ${selectedChannel === "EMAIL" ? "email" : "SMS"} starters available`}
          description="Add more active properties or switch channel to see more compatible starters."
        />
      ) : (
        <div className="grid gap-6">
          {groupedTemplates.map((group) => (
            <section key={group.goal} className="grid gap-3">
              <div className="grid gap-1">
                <h2 className="text-base font-semibold text-slate-900">{getGoalLabel(group.goal)}</h2>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </div>
              <div className="grid gap-4 xl:grid-cols-3">
                {group.templates.map((template) => (
                  <StarterTemplateCard
                    key={template.id}
                    template={template}
                    onUseTemplate={() => onUseTemplate(template)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function StarterTemplateCard({
  template,
  onUseTemplate,
}: {
  template: TemplateSummary;
  onUseTemplate: () => void;
}) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="grid gap-3 border-b bg-white">
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{template.channel === "EMAIL" ? "Email" : "SMS"}</Badge>
            </div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </div>
          <Button type="button" size="sm" className="whitespace-nowrap" onClick={onUseTemplate}>
            Use this template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 p-5">
        {template.channel === "EMAIL" ? (
          <EmailTemplatePreview template={template} />
        ) : (
          <SmsTemplatePreview template={template} />
        )}
      </CardContent>
    </Card>
  );
}

function EmailTemplatePreview({ template }: { template: TemplateSummary }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50">
      <div className="p-3">
        <div
          className="w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm [&_*]:max-w-full [&_a]:pointer-events-none [&_img]:h-auto [&_img]:max-w-full [&_table]:!w-full [&_table]:max-w-full [&_td]:max-w-full"
          dangerouslySetInnerHTML={{ __html: extractEmailBody(template.contentHtml) }}
        />
      </div>
    </div>
  );
}

function SmsTemplatePreview({ template }: { template: TemplateSummary }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="grid gap-3 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Messages</span>
          <span>Now</span>
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-900">
          {template.contentText}
        </div>
      </div>
    </div>
  );
}

function extractEmailBody(html: string) {
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match?.[1] ?? html;
}

function normalizeTab(value: string | null): CampaignTab {
  return value === "drafts" || value === "scheduled" || value === "sent" || value === "calendar" || value === "templates"
    ? value
    : "scheduled";
}

function EmptyCampaignState({ totalItems }: { totalItems: number }) {
  return (
    <div className="grid gap-1">
      <p className="text-sm font-medium text-slate-900">
        {totalItems === 0 ? "No live campaigns yet" : "No campaigns match these filters"}
      </p>
      <p className="text-sm text-muted-foreground">
        {totalItems === 0
          ? "Start from a campaign starter to create your first send."
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
                  {dayCampaigns.length > 0 ? <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{dayCampaigns.length}</Badge> : null}
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

    return {
      date,
      inCurrentMonth: date.getMonth() === month.getMonth(),
    };
  });
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
