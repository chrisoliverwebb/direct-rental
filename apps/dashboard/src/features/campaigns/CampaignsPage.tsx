"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { CampaignSummary } from "@repo/api-contracts";
import { campaignStatusLabel, recipientSelectionLabel } from "@repo/marketing";
import { formatDateTime } from "@repo/shared";
import { SlidersHorizontal } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TabbedPage } from "@/components/layout/TabbedPage";
import { usePageTab } from "@/hooks/usePageTab";
import { CAMPAIGNS_TABS, CAMPAIGNS_DEFAULT_TAB, type CampaignsTab } from "@/lib/pageTabConfigs";
import { resolveTemplateScope } from "@/features/campaigns/campaignStarters";
import { ChannelBadge } from "@/features/campaigns/ChannelBadge";
import { CreateCampaignDialog, type TemplateLibraryChannelTab } from "@/features/campaigns/CreateCampaignDialog";
import { useCampaigns, useDraftCampaigns, useTemplates } from "@/features/marketing/hooks";
import { useSettings } from "@/features/settings/hooks";

type ChannelFilter = "ALL" | CampaignSummary["channel"];
type SortDirection = "asc" | "desc";

export function CampaignsPage() {
  const router = useRouter();
  const [activeTab, setTab] = usePageTab<CampaignsTab>(CAMPAIGNS_TABS, CAMPAIGNS_DEFAULT_TAB);
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("ALL");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<"channel" | "template">("channel");
  const [createChannel, setCreateChannel] = useState<TemplateLibraryChannelTab | null>(null);
  const [createScheduledAt, setCreateScheduledAt] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const draftCampaignsQuery = useDraftCampaigns();
  const templatesQuery = useTemplates();
  const settingsQuery = useSettings();
  const propertyCount = settingsQuery.data?.properties.filter((property) => property.status === "ACTIVE").length ?? 0;

  const effectiveStatusFilter =
    activeTab === "scheduled" ? "SCHEDULED" : activeTab === "sent" ? "SENT" : "DRAFT";

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

  const openCreateFlow = (options?: { channel?: TemplateLibraryChannelTab | null }) => {
    setCreateChannel(options?.channel ?? null);
    setCreateStep(options?.channel ? "template" : "channel");
    setCreateOpen(true);
  };

  const filtersButton = (
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
  );

  return (
    <TabbedPage
      title="Campaigns"
      action={
        <Button type="button" onClick={() => openCreateFlow()}>
          New campaign
        </Button>
      }
      tabs={CAMPAIGNS_TABS}
      activeTab={activeTab}
      onTabChange={(tab) => {
        setTab(tab);
        setPage(1);
      }}
      tabsTrailing={filtersButton}
    >
      {filtersOpen ? (
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
          setTab("drafts");
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
                      <EmptyState
                        title={totalItems === 0 ? "No live campaigns yet" : "No campaigns match these filters"}
                        description={
                          totalItems === 0
                            ? "Start from a campaign starter to create your first send."
                            : "Try widening the channel or status filters."
                        }
                      />
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
    </TabbedPage>
  );
}
