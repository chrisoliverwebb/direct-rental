"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UpdatePropertyCalendarSettings, UpsertPropertySettings } from "@repo/api-contracts";
import { useAccount } from "@/features/account/hooks";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [propertyDraft, setPropertyDraft] = useState<UpsertPropertySettings>(createEmptyPropertyDraft());
  const [calendarDraft, setCalendarDraft] = useState<UpdatePropertyCalendarSettings>(createEmptyCalendarDraft());

  const properties = settingsQuery.data?.properties ?? [];
  const activeCount = properties.filter((p) => p.status === "ACTIVE").length;
  const maxProperties = accountQuery.data?.subscription?.maxProperties ?? null;
  const atLimit = maxProperties !== null && activeCount >= maxProperties;

  const openDialog = () => {
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
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold text-slate-900">Properties</h1>
          <p className="text-sm text-muted-foreground">Manage your rental properties and their settings.</p>
        </div>
        <div className="flex items-center gap-3">
          {maxProperties !== null ? <PropertyUsagePill used={activeCount} max={maxProperties} /> : null}
          <div className="relative">
            <Button onClick={openDialog} disabled={atLimit}>
              New property
            </Button>
            {atLimit ? (
              <p className="absolute -bottom-5 right-0 whitespace-nowrap text-xs text-muted-foreground">
                Subscription limit reached
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {properties.length === 0 ? (
        <EmptyState title="No properties yet" description="Add your first property to get started." />
      ) : (
        <div className="rounded-lg border bg-white">
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
              {properties.map((property) => (
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
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>New property</DialogTitle>
          </DialogHeader>
          <DialogBody className="grid gap-6">
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
    </div>
  );
}

function PropertyUsagePill({ used, max }: { used: number; max: number }) {
  const atLimit = used >= max;
  const isNearLimit = used / max >= 0.8;

  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
        atLimit
          ? "border-red-200 bg-red-50 text-red-700"
          : isNearLimit
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <span>
        {used} / {max} properties
      </span>
      {atLimit ? <span className="text-red-500">•</span> : null}
    </div>
  );
}

function formatSleepsRange(sleepsMin: number | null | undefined, sleepsMax: number) {
  if (sleepsMin !== null && sleepsMin !== undefined && sleepsMin < sleepsMax) {
    return `${sleepsMin}-${sleepsMax}`;
  }

  return String(sleepsMax);
}
