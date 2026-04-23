"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UpsertPropertySettings } from "@repo/api-contracts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { toast } from "@/components/ui/sonner";
import { useAccount } from "@/features/account/hooks";
import { useCreatePropertySettings, useSettings } from "@/features/settings/hooks";

const propertyTypeOptions = [
  { value: "", label: "Choose property type" },
  { value: "COTTAGE", label: "Cottage" },
  { value: "LODGE", label: "Lodge" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOUSE", label: "House" },
  { value: "B_AND_B", label: "B&B" },
  { value: "OTHER", label: "Other" },
] as const;

function friendlyPropertyType(type: string | null | undefined) {
  if (!type) return "—";
  return propertyTypeOptions.find((o) => o.value === type)?.label ?? type;
}

type NewPropertyDraft = {
  name: string;
  shortName: string | null;
  propertyType: string | null;
};

export function PropertiesListPage() {
  const router = useRouter();
  const settingsQuery = useSettings();
  const accountQuery = useAccount();
  const createPropertyMutation = useCreatePropertySettings();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draft, setDraft] = useState<NewPropertyDraft>({ name: "", shortName: null, propertyType: null });

  const properties = settingsQuery.data?.properties ?? [];
  const activeCount = properties.filter((p) => p.status === "ACTIVE").length;
  const maxProperties = accountQuery.data?.subscription?.maxProperties ?? null;
  const atLimit = maxProperties !== null && activeCount >= maxProperties;

  const openDialog = () => {
    setDraft({ name: "", shortName: null, propertyType: null });
    setIsDialogOpen(true);
  };

  const createProperty = async () => {
    if (!draft.name.trim()) return;
    const payload: UpsertPropertySettings = {
      name: draft.name,
      shortName: draft.shortName,
      propertyType: (draft.propertyType as UpsertPropertySettings["propertyType"]) ?? null,
      sleeps: null,
      bedrooms: null,
      bathrooms: null,
      bookingEmail: null,
      bookingPhone: null,
      websiteUrl: null,
      directBookingUrl: null,
      checkInTime: null,
      checkOutTime: null,
      address: { addressLine1: null, addressLine2: null, city: null, region: null, postcode: null, country: null },
      shortDescription: null,
      longDescription: null,
      heroImageUrl: null,
      galleryImageUrls: [],
      themeId: null,
    };
    const created = await createPropertyMutation.mutateAsync(payload);
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
          {maxProperties !== null ? (
            <PropertyUsagePill used={activeCount} max={maxProperties} />
          ) : null}
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
                <TableHead>Name</TableHead>
                <TableHead>Short name</TableHead>
                <TableHead>Type</TableHead>
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
                  <TableCell className="font-medium text-primary">{property.name}</TableCell>
                  <TableCell>{property.shortName ?? "—"}</TableCell>
                  <TableCell>{friendlyPropertyType(property.propertyType)}</TableCell>
                  <TableCell>
                    <Badge variant={property.status === "ACTIVE" ? "success" : "outline"}>
                      {property.status === "ACTIVE" ? "Active" : "Archived"}
                    </Badge>
                  </TableCell>
                  <TableCell>{property.sleeps ?? "—"}</TableCell>
                  <TableCell>{property.bedrooms ?? "—"}</TableCell>
                  <TableCell>{property.bathrooms ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New property</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Property name</span>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. The Old Barn"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Short name</span>
                <Input
                  value={draft.shortName ?? ""}
                  onChange={(e) => setDraft({ ...draft, shortName: e.target.value || null })}
                  placeholder="e.g. Barn"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Property type</span>
                <Select
                  value={draft.propertyType ?? ""}
                  onChange={(e) => setDraft({ ...draft, propertyType: e.target.value || null })}
                >
                  {propertyTypeOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </label>
            </div>
          </DialogBody>
          <div className="flex justify-end gap-2 border-t px-6 py-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={createProperty}
              disabled={!draft.name.trim() || createPropertyMutation.isPending}
            >
              {createPropertyMutation.isPending ? "Creating..." : "Create property"}
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
