"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Home, Plus, Trash2 } from "lucide-react";
import type {
  PropertyCalendarSettings,
  PropertySettings,
  UpdatePropertyCalendarSettings,
  UpsertPropertySettings,
} from "@repo/api-contracts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { toast } from "@/components/ui/sonner";
import {
  useArchivePropertySettings,
  useCreatePropertySettings,
  useSettings,
  useUpdatePropertyCalendarSettings,
  useUpdatePropertySettings,
} from "@/features/settings/hooks";
import { cn } from "@/lib/utils";

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

export function PropertiesPage() {
  const settingsQuery = useSettings();
  const createPropertyMutation = useCreatePropertySettings();
  const updatePropertyMutation = useUpdatePropertySettings();
  const archivePropertyMutation = useArchivePropertySettings();
  const updatePropertyCalendarMutation = useUpdatePropertyCalendarSettings();

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [propertyDraft, setPropertyDraft] = useState<UpsertPropertySettings | null>(null);
  const [calendarDraft, setCalendarDraft] = useState<UpdatePropertyCalendarSettings | null>(null);
  const [isCreatingProperty, setIsCreatingProperty] = useState(false);

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }

    const nextSelectedPropertyId =
      settingsQuery.data.properties.find((property) => property.id === selectedPropertyId)?.id ??
      settingsQuery.data.properties[0]?.id ??
      null;

    setSelectedPropertyId(nextSelectedPropertyId);

    if (!isCreatingProperty) {
      const property = settingsQuery.data.properties.find((entry) => entry.id === nextSelectedPropertyId);
      const calendar = settingsQuery.data.bookingAvailability.find((entry) => entry.propertyId === nextSelectedPropertyId);

      if (property) {
        setPropertyDraft(toPropertyDraft(property));
      }

      if (calendar) {
        setCalendarDraft(toCalendarDraft(calendar));
      }
    }
  }, [isCreatingProperty, selectedPropertyId, settingsQuery.data]);

  const propertySummaries = useMemo(() => settingsQuery.data?.properties ?? [], [settingsQuery.data?.properties]);
  const selectedProperty = useMemo(
    () => propertySummaries.find((property) => property.id === selectedPropertyId) ?? null,
    [propertySummaries, selectedPropertyId],
  );

  if (settingsQuery.isLoading) {
    return <LoadingState rows={5} />;
  }

  if (settingsQuery.isError) {
    return (
      <ErrorState
        title="Properties unavailable"
        description={settingsQuery.error.message}
        onRetry={() => settingsQuery.refetch()}
      />
    );
  }

  if (!settingsQuery.data) {
    return <LoadingState rows={4} />;
  }

  const saveProperty = async () => {
    if (!propertyDraft) {
      return;
    }

    if (isCreatingProperty) {
      const created = await createPropertyMutation.mutateAsync(propertyDraft);
      setSelectedPropertyId(created.id);
      setIsCreatingProperty(false);
      toast.success("Property created");
      return;
    }

    if (!selectedPropertyId) {
      return;
    }

    await updatePropertyMutation.mutateAsync({
      propertyId: selectedPropertyId,
      request: propertyDraft,
    });
    toast.success("Property settings saved");
  };

  const saveCalendar = async () => {
    if (!selectedPropertyId || !calendarDraft) {
      return;
    }

    await updatePropertyCalendarMutation.mutateAsync({
      propertyId: selectedPropertyId,
      request: calendarDraft,
    });
    toast.success("Booking and availability settings saved");
  };

  const archiveProperty = async () => {
    if (!selectedPropertyId) {
      return;
    }

    await archivePropertyMutation.mutateAsync(selectedPropertyId);
    toast.success("Property archived");
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">Properties</h1>
        <p className="text-sm text-muted-foreground">
          Manage each property’s identity, booking links, descriptions, theme override, and iCal feeds.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="border-slate-200 xl:sticky xl:top-24 xl:self-start">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-4 w-4 text-slate-500" />
              Property list
            </CardTitle>
            <CardDescription>Add, review, and switch between properties.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreatingProperty(true);
                setSelectedPropertyId(null);
                setPropertyDraft(createEmptyPropertyDraft());
                setCalendarDraft(createEmptyCalendarDraft());
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add property
            </Button>
            {propertySummaries.map((property) => {
              const feedCount =
                settingsQuery.data?.bookingAvailability.find((entry) => entry.propertyId === property.id)?.calendarFeeds.length ?? 0;
              return (
                <button
                  key={property.id}
                  type="button"
                  onClick={() => {
                    setIsCreatingProperty(false);
                    setSelectedPropertyId(property.id);
                  }}
                  className={cn(
                    "grid gap-3 rounded-xl border px-4 py-4 text-left transition",
                    selectedPropertyId === property.id && !isCreatingProperty
                      ? "border-slate-300 bg-slate-50"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{property.name}</p>
                      <p className="text-xs text-slate-500">{property.shortName ?? "No short name yet"}</p>
                    </div>
                    <Badge variant={property.status === "ACTIVE" ? "success" : "outline"}>
                      {property.status === "ACTIVE" ? "Active" : "Archived"}
                    </Badge>
                  </div>
                  <div className="grid gap-1 text-xs text-slate-500">
                    <span>Theme: {property.themeId ? friendlyThemeLabel(property.themeId) : "Company default"}</span>
                    <span>Direct booking: {property.directBookingUrl ? "Configured" : "Not set"}</span>
                    <span>iCal feeds: {feedCount}</span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>{isCreatingProperty ? "Add property" : selectedProperty?.name ?? "Property details"}</CardTitle>
              <CardDescription>
                {isCreatingProperty ? "Create the first version of a property profile." : "Edit the selected property profile."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {propertyDraft ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Property name">
                      <Input value={propertyDraft.name} onChange={(event) => setPropertyDraft({ ...propertyDraft, name: event.target.value })} />
                    </Field>
                    <Field label="Short name / internal label">
                      <Input value={propertyDraft.shortName ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, shortName: nullable(event.target.value) })} />
                    </Field>
                    <Field label="Property type">
                      <Select
                        value={propertyDraft.propertyType ?? ""}
                        onChange={(event) =>
                          setPropertyDraft({
                            ...propertyDraft,
                            propertyType: event.target.value === "" ? null : (event.target.value as UpsertPropertySettings["propertyType"]),
                          })
                        }
                      >
                        {propertyTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Theme override">
                      <Select value={propertyDraft.themeId ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, themeId: nullable(event.target.value) })}>
                        {themeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Sleeps">
                      <Input type="number" min={0} value={propertyDraft.sleeps ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, sleeps: nullableNumber(event.target.value) })} />
                    </Field>
                    <Field label="Bedrooms">
                      <Input type="number" min={0} value={propertyDraft.bedrooms ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, bedrooms: nullableNumber(event.target.value) })} />
                    </Field>
                    <Field label="Bathrooms">
                      <Input type="number" min={0} value={propertyDraft.bathrooms ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, bathrooms: nullableNumber(event.target.value) })} />
                    </Field>
                    <Field label="Hero image URL">
                      <Input value={propertyDraft.heroImageUrl ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, heroImageUrl: nullable(event.target.value) })} />
                    </Field>
                    <Field label="Booking email">
                      <Input type="email" value={propertyDraft.bookingEmail ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, bookingEmail: nullable(event.target.value) })} />
                    </Field>
                    <Field label="Booking phone">
                      <Input value={propertyDraft.bookingPhone ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, bookingPhone: nullable(event.target.value) })} />
                    </Field>
                    <Field label="Website URL">
                      <Input value={propertyDraft.websiteUrl ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, websiteUrl: nullable(event.target.value) })} />
                    </Field>
                    <Field label="Direct booking URL">
                      <Input value={propertyDraft.directBookingUrl ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, directBookingUrl: nullable(event.target.value) })} />
                    </Field>
                    <Field label="Check-in time">
                      <Input value={propertyDraft.checkInTime ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, checkInTime: nullable(event.target.value) })} />
                    </Field>
                    <Field label="Check-out time">
                      <Input value={propertyDraft.checkOutTime ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, checkOutTime: nullable(event.target.value) })} />
                    </Field>
                  </div>

                  <SectionGroup heading="Property address" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Address line 1">
                      <Input value={propertyDraft.address.addressLine1 ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, address: { ...propertyDraft.address, addressLine1: nullable(event.target.value) } })} />
                    </Field>
                    <Field label="Address line 2">
                      <Input value={propertyDraft.address.addressLine2 ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, address: { ...propertyDraft.address, addressLine2: nullable(event.target.value) } })} />
                    </Field>
                    <Field label="Town / city">
                      <Input value={propertyDraft.address.city ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, address: { ...propertyDraft.address, city: nullable(event.target.value) } })} />
                    </Field>
                    <Field label="County / region">
                      <Input value={propertyDraft.address.region ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, address: { ...propertyDraft.address, region: nullable(event.target.value) } })} />
                    </Field>
                    <Field label="Postcode">
                      <Input value={propertyDraft.address.postcode ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, address: { ...propertyDraft.address, postcode: nullable(event.target.value) } })} />
                    </Field>
                    <Field label="Country">
                      <Input value={propertyDraft.address.country ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, address: { ...propertyDraft.address, country: nullable(event.target.value) } })} />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Short description">
                      <Textarea rows={4} value={propertyDraft.shortDescription ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, shortDescription: nullable(event.target.value) })} />
                    </Field>
                    <Field label="Long description">
                      <Textarea rows={4} value={propertyDraft.longDescription ?? ""} onChange={(event) => setPropertyDraft({ ...propertyDraft, longDescription: nullable(event.target.value) })} />
                    </Field>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      {selectedProperty?.status === "ARCHIVED" ? "This property is archived." : "Property details are reused across templates, widgets, and booking flows."}
                    </div>
                    <div className="flex items-center gap-2">
                      {!isCreatingProperty && selectedProperty?.status !== "ARCHIVED" ? (
                        <Button variant="outline" onClick={archiveProperty} disabled={archivePropertyMutation.isPending}>
                          {archivePropertyMutation.isPending ? "Archiving..." : "Archive property"}
                        </Button>
                      ) : null}
                      <Button onClick={saveProperty} disabled={createPropertyMutation.isPending || updatePropertyMutation.isPending}>
                        {createPropertyMutation.isPending || updatePropertyMutation.isPending ? "Saving..." : isCreatingProperty ? "Create property" : "Save property"}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-sm text-slate-500">
                  Choose a property to edit, or add a new one.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-500" />
                Booking & availability
              </CardTitle>
              <CardDescription>Direct booking links, availability defaults, and repeatable iCal feeds for the selected property.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {calendarDraft && (selectedProperty || isCreatingProperty) ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Minimum stay default">
                      <Input type="number" min={0} value={calendarDraft.minimumStayDefault ?? ""} onChange={(event) => setCalendarDraft({ ...calendarDraft, minimumStayDefault: nullableNumber(event.target.value) })} />
                    </Field>
                    <Field label="Maximum stay default">
                      <Input type="number" min={0} value={calendarDraft.maximumStayDefault ?? ""} onChange={(event) => setCalendarDraft({ ...calendarDraft, maximumStayDefault: nullableNumber(event.target.value) })} />
                    </Field>
                    <Field label="Availability window (days)">
                      <Input type="number" min={0} value={calendarDraft.availabilityWindowDays ?? ""} onChange={(event) => setCalendarDraft({ ...calendarDraft, availabilityWindowDays: nullableNumber(event.target.value) })} />
                    </Field>
                  </div>

                  <SectionGroup heading="Calendar feeds" description="Add repeatable iCal feeds instead of hardcoding only a few providers." />
                  <div className="grid gap-3">
                    {calendarDraft.calendarFeeds.map((feed, index) => (
                      <div key={feed.id ?? index} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4">
                        <div className="grid gap-3 md:grid-cols-[1fr_1fr_minmax(0,1.6fr)_auto]">
                          <Field label="Source name">
                            <Input value={feed.sourceName} onChange={(event) => updateFeedField(index, "sourceName", event.target.value, calendarDraft, setCalendarDraft)} />
                          </Field>
                          <Field label="Provider">
                            <Input value={feed.provider ?? ""} onChange={(event) => updateFeedField(index, "provider", nullable(event.target.value), calendarDraft, setCalendarDraft)} />
                          </Field>
                          <Field label="iCal URL">
                            <Input value={feed.icalUrl} onChange={(event) => updateFeedField(index, "icalUrl", event.target.value, calendarDraft, setCalendarDraft)} />
                          </Field>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setCalendarDraft({
                                  ...calendarDraft,
                                  calendarFeeds: calendarDraft.calendarFeeds.filter((_, feedIndex) => feedIndex !== index),
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
                            {
                              id: `draft-feed-${calendarDraft.calendarFeeds.length + 1}`,
                              sourceName: "",
                              provider: null,
                              icalUrl: "",
                            },
                          ],
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add calendar feed
                    </Button>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={saveCalendar}
                      disabled={updatePropertyCalendarMutation.isPending || !selectedPropertyId}
                    >
                      {updatePropertyCalendarMutation.isPending ? "Saving..." : "Save booking & availability"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-sm text-slate-500">
                  Choose a property before editing booking and availability settings.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
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
  if (value.trim() === "") {
    return null;
  }
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

function createEmptyPropertyDraft(): UpsertPropertySettings {
  return {
    name: "",
    shortName: null,
    propertyType: null,
    sleeps: null,
    bedrooms: null,
    bathrooms: null,
    bookingEmail: null,
    bookingPhone: null,
    websiteUrl: null,
    directBookingUrl: null,
    checkInTime: null,
    checkOutTime: null,
    address: {
      addressLine1: null,
      addressLine2: null,
      city: null,
      region: null,
      postcode: null,
      country: null,
    },
    shortDescription: null,
    longDescription: null,
    heroImageUrl: null,
    galleryImageUrls: [],
    themeId: null,
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

function createEmptyCalendarDraft(): UpdatePropertyCalendarSettings {
  return {
    propertyId: "",
    minimumStayDefault: null,
    maximumStayDefault: null,
    availabilityWindowDays: null,
    calendarFeeds: [],
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
      feedIndex === index
        ? {
            ...feed,
            [field]: value,
          }
        : feed,
    ),
  });
}

function friendlyThemeLabel(themeId: string) {
  return themeOptions.find((option) => option.value === themeId)?.label ?? themeId;
}
