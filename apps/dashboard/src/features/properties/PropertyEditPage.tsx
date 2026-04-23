"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import type { PropertyCalendarSettings, PropertySettings, UpdatePropertyCalendarSettings, UpsertPropertySettings } from "@repo/api-contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BackButton } from "@/components/navigation/BackButton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { toast } from "@/components/ui/sonner";
import {
  useArchivePropertySettings,
  useSettings,
  useUpdatePropertyCalendarSettings,
  useUpdatePropertySettings,
} from "@/features/settings/hooks";

const propertyTypeOptions = [
  { value: "", label: "Choose property type" },
  { value: "COTTAGE", label: "Cottage" },
  { value: "LODGE", label: "Lodge" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOUSE", label: "House" },
  { value: "B_AND_B", label: "B&B" },
  { value: "OTHER", label: "Other" },
] as const;

const themeOptions = [
  { value: "", label: "Use company default" },
  { value: "classic-coastal", label: "Classic Coastal" },
  { value: "coastal-soft", label: "Coastal Soft" },
  { value: "heritage-editorial", label: "Heritage Editorial" },
];

export function PropertyEditPage({ propertyId }: { propertyId: string }) {
  const settingsQuery = useSettings();
  const updatePropertyMutation = useUpdatePropertySettings();
  const archivePropertyMutation = useArchivePropertySettings();
  const updatePropertyCalendarMutation = useUpdatePropertyCalendarSettings();

  const [propertyDraft, setPropertyDraft] = useState<UpsertPropertySettings | null>(null);
  const [calendarDraft, setCalendarDraft] = useState<UpdatePropertyCalendarSettings | null>(null);

  const property = settingsQuery.data?.properties.find((p) => p.id === propertyId) ?? null;
  const calendar = settingsQuery.data?.bookingAvailability.find((b) => b.propertyId === propertyId) ?? null;

  useEffect(() => {
    if (property && !propertyDraft) {
      setPropertyDraft(toPropertyDraft(property));
    }
    if (calendar && !calendarDraft) {
      setCalendarDraft(toCalendarDraft(calendar));
    }
  }, [property, calendar, propertyDraft, calendarDraft]);

  const saveProperty = async () => {
    if (!propertyDraft) return;
    await updatePropertyMutation.mutateAsync({ propertyId, request: propertyDraft });
    toast.success("Property settings saved");
  };

  const saveCalendar = async () => {
    if (!calendarDraft) return;
    await updatePropertyCalendarMutation.mutateAsync({ propertyId, request: calendarDraft });
    toast.success("Booking and availability settings saved");
  };

  const archiveProperty = async () => {
    await archivePropertyMutation.mutateAsync(propertyId);
    toast.success("Property archived");
  };

  if (settingsQuery.isLoading) return <LoadingState rows={5} />;

  if (settingsQuery.isError) {
    return (
      <ErrorState
        title="Property unavailable"
        description={settingsQuery.error.message}
        onRetry={() => settingsQuery.refetch()}
      />
    );
  }

  if (!property) {
    return (
      <ErrorState
        title="Property not found"
        description="This property does not exist or may have been removed."
      />
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <BackButton href={`/properties/${propertyId}`} label={`Back to ${property.name}`} />
        <div className="mt-2 grid gap-1">
          <h1 className="text-2xl font-semibold text-slate-900">Edit {property.name}</h1>
          <p className="text-sm text-muted-foreground">Update property details, booking links, and availability settings.</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Property details</CardTitle>
          <CardDescription>Edit the property profile used across templates, widgets, and booking flows.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {propertyDraft ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Property name">
                  <Input
                    value={propertyDraft.name}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, name: e.target.value })}
                  />
                </Field>
                <Field label="Short name / internal label">
                  <Input
                    value={propertyDraft.shortName ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, shortName: nullable(e.target.value) })}
                  />
                </Field>
                <Field label="Property type">
                  <Select
                    value={propertyDraft.propertyType ?? ""}
                    onChange={(e) =>
                      setPropertyDraft({
                        ...propertyDraft,
                        propertyType: e.target.value === "" ? null : (e.target.value as UpsertPropertySettings["propertyType"]),
                      })
                    }
                  >
                    {propertyTypeOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Theme override">
                  <Select
                    value={propertyDraft.themeId ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, themeId: nullable(e.target.value) })}
                  >
                    {themeOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Sleeps">
                  <Input
                    type="number"
                    min={0}
                    value={propertyDraft.sleeps ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, sleeps: nullableNumber(e.target.value) })}
                  />
                </Field>
                <Field label="Bedrooms">
                  <Input
                    type="number"
                    min={0}
                    value={propertyDraft.bedrooms ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, bedrooms: nullableNumber(e.target.value) })}
                  />
                </Field>
                <Field label="Bathrooms">
                  <Input
                    type="number"
                    min={0}
                    value={propertyDraft.bathrooms ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, bathrooms: nullableNumber(e.target.value) })}
                  />
                </Field>
                <Field label="Hero image URL">
                  <Input
                    value={propertyDraft.heroImageUrl ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, heroImageUrl: nullable(e.target.value) })}
                  />
                </Field>
                <Field label="Booking email">
                  <Input
                    type="email"
                    value={propertyDraft.bookingEmail ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, bookingEmail: nullable(e.target.value) })}
                  />
                </Field>
                <Field label="Booking phone">
                  <Input
                    value={propertyDraft.bookingPhone ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, bookingPhone: nullable(e.target.value) })}
                  />
                </Field>
                <Field label="Website URL">
                  <Input
                    value={propertyDraft.websiteUrl ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, websiteUrl: nullable(e.target.value) })}
                  />
                </Field>
                <Field label="Direct booking URL">
                  <Input
                    value={propertyDraft.directBookingUrl ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, directBookingUrl: nullable(e.target.value) })}
                  />
                </Field>
                <Field label="Check-in time">
                  <Input
                    value={propertyDraft.checkInTime ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, checkInTime: nullable(e.target.value) })}
                  />
                </Field>
                <Field label="Check-out time">
                  <Input
                    value={propertyDraft.checkOutTime ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, checkOutTime: nullable(e.target.value) })}
                  />
                </Field>
              </div>

              <SectionGroup heading="Property address" />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Address line 1">
                  <Input
                    value={propertyDraft.address.addressLine1 ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, address: { ...propertyDraft.address, addressLine1: nullable(e.target.value) } })}
                  />
                </Field>
                <Field label="Address line 2">
                  <Input
                    value={propertyDraft.address.addressLine2 ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, address: { ...propertyDraft.address, addressLine2: nullable(e.target.value) } })}
                  />
                </Field>
                <Field label="Town / city">
                  <Input
                    value={propertyDraft.address.city ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, address: { ...propertyDraft.address, city: nullable(e.target.value) } })}
                  />
                </Field>
                <Field label="County / region">
                  <Input
                    value={propertyDraft.address.region ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, address: { ...propertyDraft.address, region: nullable(e.target.value) } })}
                  />
                </Field>
                <Field label="Postcode">
                  <Input
                    value={propertyDraft.address.postcode ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, address: { ...propertyDraft.address, postcode: nullable(e.target.value) } })}
                  />
                </Field>
                <Field label="Country">
                  <Input
                    value={propertyDraft.address.country ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, address: { ...propertyDraft.address, country: nullable(e.target.value) } })}
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Short description">
                  <Textarea
                    rows={4}
                    value={propertyDraft.shortDescription ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, shortDescription: nullable(e.target.value) })}
                  />
                </Field>
                <Field label="Long description">
                  <Textarea
                    rows={4}
                    value={propertyDraft.longDescription ?? ""}
                    onChange={(e) => setPropertyDraft({ ...propertyDraft, longDescription: nullable(e.target.value) })}
                  />
                </Field>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  {property.status === "ARCHIVED"
                    ? "This property is archived."
                    : "Property details are reused across templates, widgets, and booking flows."}
                </div>
                <div className="flex items-center gap-2">
                  {property.status !== "ARCHIVED" ? (
                    <Button variant="outline" onClick={archiveProperty} disabled={archivePropertyMutation.isPending}>
                      {archivePropertyMutation.isPending ? "Archiving..." : "Archive property"}
                    </Button>
                  ) : null}
                  <Button onClick={saveProperty} disabled={updatePropertyMutation.isPending}>
                    {updatePropertyMutation.isPending ? "Saving..." : "Save property"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <LoadingState rows={3} />
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            Booking & availability
          </CardTitle>
          <CardDescription>Availability defaults and iCal feeds for this property.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {calendarDraft ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Minimum stay default">
                  <Input
                    type="number"
                    min={0}
                    value={calendarDraft.minimumStayDefault ?? ""}
                    onChange={(e) => setCalendarDraft({ ...calendarDraft, minimumStayDefault: nullableNumber(e.target.value) })}
                  />
                </Field>
                <Field label="Maximum stay default">
                  <Input
                    type="number"
                    min={0}
                    value={calendarDraft.maximumStayDefault ?? ""}
                    onChange={(e) => setCalendarDraft({ ...calendarDraft, maximumStayDefault: nullableNumber(e.target.value) })}
                  />
                </Field>
                <Field label="Availability window (days)">
                  <Input
                    type="number"
                    min={0}
                    value={calendarDraft.availabilityWindowDays ?? ""}
                    onChange={(e) => setCalendarDraft({ ...calendarDraft, availabilityWindowDays: nullableNumber(e.target.value) })}
                  />
                </Field>
              </div>

              <SectionGroup heading="Calendar feeds" description="Add iCal feeds to sync availability from booking platforms." />
              <div className="grid gap-3">
                {calendarDraft.calendarFeeds.map((feed, index) => (
                  <div key={feed.id ?? index} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_minmax(0,1.6fr)_auto]">
                      <Field label="Source name">
                        <Input
                          value={feed.sourceName}
                          onChange={(e) => updateFeedField(index, "sourceName", e.target.value, calendarDraft, setCalendarDraft)}
                        />
                      </Field>
                      <Field label="Provider">
                        <Input
                          value={feed.provider ?? ""}
                          onChange={(e) => updateFeedField(index, "provider", nullable(e.target.value), calendarDraft, setCalendarDraft)}
                        />
                      </Field>
                      <Field label="iCal URL">
                        <Input
                          value={feed.icalUrl}
                          onChange={(e) => updateFeedField(index, "icalUrl", e.target.value, calendarDraft, setCalendarDraft)}
                        />
                      </Field>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setCalendarDraft({
                              ...calendarDraft,
                              calendarFeeds: calendarDraft.calendarFeeds.filter((_, i) => i !== index),
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-fit"
                  onClick={() =>
                    setCalendarDraft({
                      ...calendarDraft,
                      calendarFeeds: [
                        ...calendarDraft.calendarFeeds,
                        { id: `draft-feed-${calendarDraft.calendarFeeds.length + 1}`, sourceName: "", provider: null, icalUrl: "" },
                      ],
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add calendar feed
                </Button>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveCalendar} disabled={updatePropertyCalendarMutation.isPending}>
                  {updatePropertyCalendarMutation.isPending ? "Saving..." : "Save booking & availability"}
                </Button>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-sm text-slate-500">
              No availability settings found for this property.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function SectionGroup({ heading, description }: { heading: string; description?: string }) {
  return (
    <div className="grid gap-1">
      <h3 className="text-sm font-semibold text-slate-900">{heading}</h3>
      {description ? <p className="text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function nullableNumber(value: string) {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function toPropertyDraft(property: PropertySettings): UpsertPropertySettings {
  return {
    name: property.name,
    shortName: property.shortName ?? null,
    propertyType: property.propertyType ?? null,
    sleeps: property.sleeps ?? null,
    bedrooms: property.bedrooms ?? null,
    bathrooms: property.bathrooms ?? null,
    bookingEmail: property.bookingEmail ?? null,
    bookingPhone: property.bookingPhone ?? null,
    websiteUrl: property.websiteUrl ?? null,
    directBookingUrl: property.directBookingUrl ?? null,
    checkInTime: property.checkInTime ?? null,
    checkOutTime: property.checkOutTime ?? null,
    address: property.address,
    shortDescription: property.shortDescription ?? null,
    longDescription: property.longDescription ?? null,
    heroImageUrl: property.heroImageUrl ?? null,
    galleryImageUrls: property.galleryImageUrls,
    themeId: property.themeId ?? null,
  };
}

function toCalendarDraft(calendar: PropertyCalendarSettings): UpdatePropertyCalendarSettings {
  return {
    propertyId: calendar.propertyId,
    minimumStayDefault: calendar.minimumStayDefault ?? null,
    maximumStayDefault: calendar.maximumStayDefault ?? null,
    availabilityWindowDays: calendar.availabilityWindowDays ?? null,
    calendarFeeds: calendar.calendarFeeds.map((feed) => ({ ...feed })),
  };
}

function updateFeedField(
  index: number,
  field: "sourceName" | "provider" | "icalUrl",
  value: string | null,
  draft: UpdatePropertyCalendarSettings,
  setDraft: (value: UpdatePropertyCalendarSettings) => void,
) {
  setDraft({
    ...draft,
    calendarFeeds: draft.calendarFeeds.map((feed, feedIndex) =>
      feedIndex === index ? { ...feed, [field]: value } : feed,
    ),
  });
}
