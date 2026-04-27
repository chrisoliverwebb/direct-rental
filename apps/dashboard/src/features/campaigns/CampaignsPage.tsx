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
import { MessagesSquare, Search } from "lucide-react";
import { DEFAULT_DATA_TABLE_PAGE_SIZE } from "@/components/data-table/constants";
import { PageNavigation } from "@/components/navigation/PageNavigation";
import { AddButton } from "@/components/ui/AddButton";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import { DataTablePanel } from "@/components/data-table/DataTablePanel";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Badge } from "@/components/ui/badge";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TabbedPage } from "@/components/layout/TabbedPage";
import { usePageTab } from "@/hooks/usePageTab";
import { CAMPAIGNS_TABS, CAMPAIGNS_DEFAULT_TAB, type CampaignsTab } from "@/lib/pageTabConfigs";
import { resolveTemplateScope } from "@/features/campaigns/campaignStarters";
import { ChannelBadge } from "@/features/campaigns/ChannelBadge";
import { CreateCampaignDialog, type TemplateLibraryChannelTab } from "@/features/campaigns/CreateCampaignDialog";
import { useCampaigns, useDraftCampaigns, useTemplates } from "@/features/marketing/hooks";
import { useSettings } from "@/features/settings/hooks";

type SortDirection = "asc" | "desc";
const CHANNEL_OPTIONS = [
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "SMS" },
] as const;
const DEFAULT_CHANNEL_FILTERS: CampaignSummary["channel"][] = ["EMAIL", "SMS"];

export function CampaignsPage() {
  const router = useRouter();
  const [activeTab, setTab] = usePageTab<CampaignsTab>(CAMPAIGNS_TABS, CAMPAIGNS_DEFAULT_TAB);
  const [channelFilter, setChannelFilter] = useState<CampaignSummary["channel"][]>(DEFAULT_CHANNEL_FILTERS);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_DATA_TABLE_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<"channel" | "template">("channel");
  const [createChannel, setCreateChannel] = useState<TemplateLibraryChannelTab | null>(null);
  const [createScheduledAt, setCreateScheduledAt] = useState<string | null>(null);

  const draftCampaignsQuery = useDraftCampaigns();
  const templatesQuery = useTemplates();
  const settingsQuery = useSettings();
  const propertyCount = settingsQuery.data?.properties.filter((property) => property.status === "ACTIVE").length ?? 0;

  const effectiveStatusFilter =
    activeTab === "scheduled" ? "SCHEDULED" : activeTab === "sent" ? "SENT" : "DRAFT";

  const campaignsQuery = useCampaigns({
    page,
    pageSize,
    search: search || undefined,
    channels:
      channelFilter.length === 0 || channelFilter.length === DEFAULT_CHANNEL_FILTERS.length
        ? undefined
        : channelFilter,
    status: effectiveStatusFilter,
    sortDirection,
  });

  const normalizedSearch = search.toLowerCase().trim();
  const serverItems = useMemo(() => campaignsQuery.data?.items ?? [], [campaignsQuery.data?.items]);
  const items = useMemo(
    () =>
      serverItems.filter((campaign) => {
        if (channelFilter.length === 0) {
          return false;
        }

        if (!channelFilter.includes(campaign.channel)) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const haystack =
          `${campaign.name} ${campaign.subject ?? ""} ${campaign.channel} ${campaign.status}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      }),
    [normalizedSearch, serverItems],
  );
  const totalPages = normalizedSearch && campaignsQuery.data && campaignsQuery.data.items.length === campaignsQuery.data.totalItems
    ? Math.max(1, Math.ceil(items.length / pageSize))
    : (campaignsQuery.data?.totalPages ?? 1);
  const totalItems = normalizedSearch && campaignsQuery.data && campaignsQuery.data.items.length === campaignsQuery.data.totalItems
    ? items.length
    : (campaignsQuery.data?.totalItems ?? 0);

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

  return (
    <TabbedPage
      title="Campaigns"
      navigation={<PageNavigation items={[{ label: "Campaigns" }]} />}
      tabs={CAMPAIGNS_TABS}
      activeTab={activeTab}
      onTabChange={(tab) => {
        setTab(tab);
        setPage(1);
      }}
      tabsTrailing={
        <DataTableToolbar>
          <InputGroup className="h-9 max-w-xs">
            <InputGroupAddon>
              <Search className="text-slate-400" />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search campaigns"
            />
            <InputGroupAddon align="inline-end">
              {campaignsQuery.data ? `${campaignsQuery.data.totalItems} results` : null}
            </InputGroupAddon>
          </InputGroup>
          <MultiSelect
            label="Channels"
            options={[...CHANNEL_OPTIONS]}
            values={channelFilter}
            icon={MessagesSquare}
            onValuesChange={(values) => {
              setChannelFilter(values as CampaignSummary["channel"][]);
              resetToFirstPage();
            }}
          />
          <AddButton label="Add Campaign" onClick={() => openCreateFlow()} />
        </DataTableToolbar>
      }
    >
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

      <section className="grid gap-3">
        {campaignsQuery.data ? (
          <DataTablePanel
            pagination={{
              page,
              pageSize,
              totalPages,
              totalItems,
              itemLabel: "campaigns",
              onPageChange: setPage,
              onPageSizeChange: (nextPageSize) => {
                setPageSize(nextPageSize);
                setPage(1);
              },
            }}
          >
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
          </DataTablePanel>
        ) : null}
      </section>
    </TabbedPage>
  );
}
