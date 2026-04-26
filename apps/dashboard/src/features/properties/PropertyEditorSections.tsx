"use client";

import { CalendarDays, Plus, Trash2 } from "lucide-react";
import type { PropertyCalendarSettings, PropertySettings, UpdatePropertyCalendarSettings, UpsertPropertySettings } from "@repo/api-contracts";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PropertyAddressPicker } from "@/features/properties/PropertyAddressPicker";
import {
  PROPERTY_GALLERY_ASPECT_CLASS,
  PROPERTY_GALLERY_LIMIT,
  getPropertyImageSrc,
} from "@/features/properties/propertyImages";

export function PropertyDetailsSection({
  propertyDraft,
  setPropertyDraft,
  footer,
}: {
  propertyDraft: UpsertPropertySettings;
  setPropertyDraft: (value: UpsertPropertySettings) => void;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle>Property details</CardTitle>
        <CardDescription>Edit the property profile used across templates and widgets.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
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
          <Field label="Minimum sleeps">
            <Input
              type="number"
              min={0}
              value={propertyDraft.sleepsMin ?? ""}
              onChange={(e) => setPropertyDraft({ ...propertyDraft, sleepsMin: nullableNumber(e.target.value) })}
            />
          </Field>
          <Field label="Maximum sleeps">
            <Input
              type="number"
              min={1}
              value={propertyDraft.sleepsMax || ""}
              onChange={(e) => {
                const parsed = Number(e.target.value);
                setPropertyDraft({ ...propertyDraft, sleepsMax: Number.isNaN(parsed) ? 0 : parsed });
              }}
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
        </div>

        <SectionGroup heading="Images" description="Upload one hero image and up to 15 gallery images for this property." />
        <div className="grid gap-6">
          <div className="grid max-w-sm gap-3">
            <ImageUploadField
              label="Hero image"
              value={propertyDraft.heroImageUrl ?? ""}
              alt={`${propertyDraft.name || "Property"} hero image`}
              onChange={(value) => setPropertyDraft({ ...propertyDraft, heroImageUrl: value })}
              onRemove={() => setPropertyDraft({ ...propertyDraft, heroImageUrl: null })}
              emptyLabel="No hero image uploaded"
              emptyDescription="This image is used as the primary property image."
              previewClassName={`${PROPERTY_GALLERY_ASPECT_CLASS} w-full object-contain bg-white`}
            />
            {!propertyDraft.heroImageUrl ? (
              <div className="overflow-hidden rounded-md border border-dashed border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPropertyImageSrc(propertyDraft.heroImageUrl)}
                  alt="Property placeholder preview"
                  className={`${PROPERTY_GALLERY_ASPECT_CLASS} w-full object-contain bg-white`}
                />
              </div>
            ) : null}
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="grid gap-1">
                <h3 className="text-sm font-semibold text-slate-900">Gallery images</h3>
                <p className="text-sm text-slate-500">
                  {propertyDraft.galleryImageUrls.length} / {PROPERTY_GALLERY_LIMIT} uploaded
                </p>
              </div>
            </div>

            {propertyDraft.galleryImageUrls.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {propertyDraft.galleryImageUrls.map((image, index) => (
                  <ImageUploadField
                    key={`${index}-${image.slice(0, 24)}`}
                    label={`Gallery image ${index + 1}`}
                    value={image}
                    alt={`${propertyDraft.name || "Property"} gallery image ${index + 1}`}
                    onChange={(value) =>
                      setPropertyDraft({
                        ...propertyDraft,
                        galleryImageUrls: propertyDraft.galleryImageUrls.map((entry, entryIndex) =>
                          entryIndex === index ? value : entry,
                        ),
                      })
                    }
                    onRemove={() =>
                      setPropertyDraft({
                        ...propertyDraft,
                        galleryImageUrls: propertyDraft.galleryImageUrls.filter((_, entryIndex) => entryIndex !== index),
                      })
                    }
                    previewClassName={`${PROPERTY_GALLERY_ASPECT_CLASS} w-full object-cover bg-white`}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-sm text-slate-500">
                No gallery images uploaded yet.
              </div>
            )}

            {propertyDraft.galleryImageUrls.length < PROPERTY_GALLERY_LIMIT ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                <ImageUploadField
                  label="Add gallery image"
                  value=""
                  alt={`${propertyDraft.name || "Property"} new gallery image`}
                  onChange={(value) =>
                    setPropertyDraft({
                      ...propertyDraft,
                      galleryImageUrls: [...propertyDraft.galleryImageUrls, value].slice(0, PROPERTY_GALLERY_LIMIT),
                    })
                  }
                  emptyLabel="Upload a gallery image"
                  emptyDescription="Add another property image using the same uploader as the editor."
                  previewClassName={`${PROPERTY_GALLERY_ASPECT_CLASS} w-full object-cover bg-white`}
                />
              </div>
            ) : null}
          </div>
        </div>

        <SectionGroup heading="Property address" description="Search for an address, store coordinates, and preview the location on OpenStreetMap." />
        <PropertyAddressPicker
          value={propertyDraft.address}
          onChange={(address) => setPropertyDraft({ ...propertyDraft, address })}
        />

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

        {footer}
      </CardContent>
    </Card>
  );
}

export function PropertyBookingSection({
  calendarDraft,
  setCalendarDraft,
  footer,
}: {
  calendarDraft: UpdatePropertyCalendarSettings;
  setCalendarDraft: (value: UpdatePropertyCalendarSettings) => void;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-500" />
          Booking & availability
        </CardTitle>
        <CardDescription>Check-in/out defaults, availability defaults, and iCal feeds for this property.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Check-in time">
            <Input
              value={calendarDraft.checkInTime ?? ""}
              onChange={(e) => setCalendarDraft({ ...calendarDraft, checkInTime: nullable(e.target.value) })}
            />
          </Field>
          <Field label="Check-out time">
            <Input
              value={calendarDraft.checkOutTime ?? ""}
              onChange={(e) => setCalendarDraft({ ...calendarDraft, checkOutTime: nullable(e.target.value) })}
            />
          </Field>
          <div />
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

        {footer}
      </CardContent>
    </Card>
  );
}

export function createEmptyPropertyDraft(): UpsertPropertySettings {
  return {
    name: "",
    shortName: null,
    sleepsMin: null,
    sleepsMax: 0,
    bedrooms: null,
    bathrooms: null,
    address: { addressLine1: null, addressLine2: null, city: null, region: null, postcode: null, country: null, latitude: null, longitude: null },
    shortDescription: null,
    longDescription: null,
    heroImageUrl: null,
    galleryImageUrls: [],
    themeId: null,
  };
}

export function createEmptyCalendarDraft(propertyId = "draft-property"): UpdatePropertyCalendarSettings {
  return {
    propertyId,
    checkInTime: null,
    checkOutTime: null,
    minimumStayDefault: null,
    maximumStayDefault: null,
    availabilityWindowDays: null,
    calendarFeeds: [],
  };
}

export function isPropertyDraftValid(propertyDraft: UpsertPropertySettings) {
  return Boolean(
    propertyDraft.name.trim()
    && propertyDraft.sleepsMax >= 1
    && ((propertyDraft.sleepsMin ?? null) === null || (propertyDraft.sleepsMin ?? 0) <= propertyDraft.sleepsMax),
  );
}

export function toPropertyDraft(property: PropertySettings): UpsertPropertySettings {
  return {
    name: property.name,
    shortName: property.shortName ?? null,
    sleepsMin: property.sleepsMin ?? null,
    sleepsMax: property.sleepsMax,
    bedrooms: property.bedrooms ?? null,
    bathrooms: property.bathrooms ?? null,
    address: property.address,
    shortDescription: property.shortDescription ?? null,
    longDescription: property.longDescription ?? null,
    heroImageUrl: property.heroImageUrl ?? null,
    galleryImageUrls: property.galleryImageUrls,
    themeId: property.themeId ?? null,
  };
}

export function preparePropertyDraftForSave(propertyDraft: UpsertPropertySettings): UpsertPropertySettings {
  return {
    ...propertyDraft,
    themeId: null,
  };
}

export function toCalendarDraft(calendar: PropertyCalendarSettings): UpdatePropertyCalendarSettings {
  return {
    propertyId: calendar.propertyId,
    checkInTime: calendar.checkInTime ?? null,
    checkOutTime: calendar.checkOutTime ?? null,
    minimumStayDefault: calendar.minimumStayDefault ?? null,
    maximumStayDefault: calendar.maximumStayDefault ?? null,
    availabilityWindowDays: calendar.availabilityWindowDays ?? null,
    calendarFeeds: calendar.calendarFeeds.map((feed) => ({ ...feed })),
  };
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
