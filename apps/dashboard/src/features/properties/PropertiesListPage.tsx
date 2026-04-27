"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { UpdatePropertyCalendarSettings, UpsertPropertySettings } from "@repo/api-contracts";
import { Search } from "lucide-react";
import { DEFAULT_DATA_TABLE_PAGE_SIZE } from "@/components/data-table/constants";
import { DataTablePanel } from "@/components/data-table/DataTablePanel";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { PageNavigation } from "@/components/navigation/PageNavigation";
import { useAccount } from "@/features/account/hooks";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { AddButton } from "@/components/ui/AddButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InfoBox } from "@/components/ui/InfoBox";
import { PopUp } from "@/components/ui/PopUp";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { toast } from "@/components/ui/sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  PropertyBookingSection,
  PropertyDetailsSection,
  createEmptyCalendarDraft,
  createEmptyPropertyDraft,
  isPropertyDraftValid,
  preparePropertyDraftForSave,
} from "@/features/properties/PropertyEditorSections";
import { PROPERTY_THUMBNAIL_ASPECT_CLASS, getPropertyImageSrc } from "@/features/properties/propertyImages";
import { useCreatePropertySettings, useSettings, useUpdatePropertyCalendarSettings } from "@/features/settings/hooks";

export function PropertiesListPage() {
  const router = useRouter();
  const settingsQuery = useSettings();
  const accountQuery = useAccount();
  const createPropertyMutation = useCreatePropertySettings();
  const updatePropertyCalendarMutation = useUpdatePropertyCalendarSettings();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_DATA_TABLE_PAGE_SIZE);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [limitAlertOpen, setLimitAlertOpen] = useState(false);
  const [propertyDraft, setPropertyDraft] = useState<UpsertPropertySettings>(createEmptyPropertyDraft());
  const [calendarDraft, setCalendarDraft] = useState<UpdatePropertyCalendarSettings>(createEmptyCalendarDraft());

  const properties = settingsQuery.data?.properties ?? [];
  const normalizedSearch = search.toLowerCase().trim();
  const filteredProperties = useMemo(
    () =>
      properties.filter((property) => {
        if (!normalizedSearch) {
          return true;
        }

        const haystack = [
          property.name,
          property.shortName,
          property.address.addressLine1,
          property.address.city,
          property.address.region,
          property.address.postcode,
          property.address.country,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      }),
    [normalizedSearch, properties],
  );
  const paginatedProperties = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredProperties.slice(startIndex, startIndex + pageSize);
  }, [filteredProperties, page, pageSize]);
  const totalItems = filteredProperties.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const activeCount = properties.filter((p) => p.status === "ACTIVE").length;
  const maxProperties = accountQuery.data?.subscription?.maxProperties ?? null;
  const atLimit = maxProperties !== null && activeCount >= maxProperties;

  const openDialog = () => {
    if (atLimit) {
      setLimitAlertOpen(true);
      return;
    }

    setPropertyDraft(createEmptyPropertyDraft());
    setCalendarDraft(createEmptyCalendarDraft());
    setIsDialogOpen(true);
  };

  const createProperty = async () => {
    if (!isPropertyDraftValid(propertyDraft)) return;

    const created = await createPropertyMutation.mutateAsync(preparePropertyDraftForSave(propertyDraft));
    await updatePropertyCalendarMutation.mutateAsync({
      propertyId: created.id,
      request: {
        ...calendarDraft,
        propertyId: created.id,
      },
    });

    setIsDialogOpen(false);
    toast.success("Property created");
    router.push(`/properties/${created.id}`);
  };

  if (settingsQuery.isLoading) return <LoadingState rows={5} />;

  if (settingsQuery.isError) {
    return (
      <ErrorState
        title="Properties unavailable"
        description={settingsQuery.error.message}
        onRetry={() => settingsQuery.refetch()}
      />
    );
  }

  return (
    <div className="grid gap-4">
      <PageNavigation items={[{ label: "Properties" }]} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
              placeholder="Search properties"
            />
            <InputGroupAddon align="inline-end">
              {`${filteredProperties.length} results`}
            </InputGroupAddon>
          </InputGroup>
        </DataTableToolbar>
        <AddButton label="Add Property" onClick={openDialog} />
      </div>

      {filteredProperties.length === 0 ? (
        <EmptyState
          title={properties.length === 0 ? "No properties yet" : "No properties found"}
          description={
            properties.length === 0
              ? "Add your first property to get started."
              : "Try broadening the search or clearing filters."
          }
        />
      ) : (
        <DataTablePanel
          pagination={{
            page,
            pageSize,
            totalPages,
            totalItems,
            itemLabel: "properties",
            onPageChange: setPage,
            onPageSizeChange: (nextPageSize) => {
              setPageSize(nextPageSize);
              setPage(1);
            },
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Short name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sleeps</TableHead>
                <TableHead>Bedrooms</TableHead>
                <TableHead>Bathrooms</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProperties.map((property) => (
                <TableRow
                  key={property.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/properties/${property.id}`)}
                >
                  <TableCell className="w-[108px]">
                    <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getPropertyImageSrc(property.heroImageUrl)}
                        alt={`${property.name} preview`}
                        className={`${PROPERTY_THUMBNAIL_ASPECT_CLASS} w-20 object-cover`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-primary">{property.name}</TableCell>
                  <TableCell>{property.shortName ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={property.status === "ACTIVE" ? "success" : "outline"}>
                      {property.status === "ACTIVE" ? "Active" : "Archived"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatSleepsRange(property.sleepsMin, property.sleepsMax)}</TableCell>
                  <TableCell>{property.bedrooms ?? "—"}</TableCell>
                  <TableCell>{property.bathrooms ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTablePanel>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>New property</DialogTitle>
          </DialogHeader>
          <DialogBody className="grid gap-6">
            {maxProperties !== null ? (
              <InfoBox
                title={atLimit ? "No property slots remaining" : `${Math.max(maxProperties - activeCount, 0)} property slots remaining`}
                description={
                  atLimit
                    ? `You have used all ${maxProperties} property slots on your current plan.`
                    : `${activeCount} of ${maxProperties} properties are currently in use on this plan.`
                }
              />
            ) : null}
            <PropertyDetailsSection propertyDraft={propertyDraft} setPropertyDraft={setPropertyDraft} />
            <PropertyBookingSection calendarDraft={calendarDraft} setCalendarDraft={setCalendarDraft} />
          </DialogBody>
          <div className="flex justify-end gap-2 border-t px-6 py-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={createProperty}
              disabled={
                !isPropertyDraftValid(propertyDraft)
                || createPropertyMutation.isPending
                || updatePropertyCalendarMutation.isPending
              }
            >
              {createPropertyMutation.isPending || updatePropertyCalendarMutation.isPending ? "Creating..." : "Create property"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <PopUp
        open={limitAlertOpen}
        onOpenChange={setLimitAlertOpen}
        title="No properties remaining"
        description={
          maxProperties !== null
            ? `You have already used all ${maxProperties} property slots on your current plan.`
            : "You cannot add another property right now."
        }
      />
    </div>
  );
}

function formatSleepsRange(sleepsMin: number | null | undefined, sleepsMax: number) {
  if (sleepsMin !== null && sleepsMin !== undefined && sleepsMin < sleepsMax) {
    return `${sleepsMin}-${sleepsMax}`;
  }

  return String(sleepsMax);
}
