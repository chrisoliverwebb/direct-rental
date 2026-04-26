"use client";

import { type ComponentType, type ReactNode, useMemo, useState } from "react";
import type { PropertyAvailabilityRange } from "@repo/api-contracts";
import { GalleryLightbox } from "@repo/shared";
import {
  Bath,
  BedDouble,
  CalendarDays,
  Camera,
  Clock3,
  Images,
  Loader2,
  MapPin,
  Pencil,
  Users,
} from "lucide-react";
import { EventMonthCalendar, type EventMonthCalendarEvent } from "@/components/calendar/EventMonthCalendar";
import { BackButton } from "@/components/navigation/BackButton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingDetailsDialog } from "@/features/properties/BookingDetailsDialog";
import { PropertyEditorDialog } from "@/features/properties/PropertyEditorDialog";
import { PropertyMap } from "@/features/properties/PropertyMap";
import {
  PROPERTY_GALLERY_LIMIT,
  PROPERTY_HERO_ASPECT_CLASS,
  PROPERTY_THUMBNAIL_ASPECT_CLASS,
  formatPropertyImageCount,
  getPropertyImageSrc,
} from "@/features/properties/propertyImages";
import { usePropertyBookings, useSettings } from "@/features/settings/hooks";

export function PropertyDetailPage({ propertyId }: { propertyId: string }) {
  const settingsQuery = useSettings();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<PropertyAvailabilityRange | null>(null);
  const calendarInitialMonth = useMemo(() => new Date(), []);
  const property = settingsQuery.data?.properties.find((p) => p.id === propertyId) ?? null;
  const calendar = settingsQuery.data?.bookingAvailability.find((b) => b.propertyId === propertyId) ?? null;
  const bookingsQuery = usePropertyBookings(propertyId, Boolean(property));
  const address = property?.address ?? {
    addressLine1: null,
    addressLine2: null,
    city: null,
    region: null,
    postcode: null,
    country: null,
    latitude: null,
    longitude: null,
  };

  const galleryImages = useMemo(() => {
    const images = [property?.heroImageUrl, ...(property?.galleryImageUrls ?? [])]
      .filter((image): image is string => Boolean(image))
      .map((image) => getPropertyImageSrc(image));

    return images.length > 0 ? images : [getPropertyImageSrc(null)];
  }, [property?.galleryImageUrls, property?.heroImageUrl]);
  const galleryLightboxItems = useMemo(
    () => galleryImages.map((image, index) => ({ src: image, alt: `${property?.name ?? "Property"} image ${index + 1}` })),
    [galleryImages, property?.name],
  );
  const hasAddress = Object.values(address).some(Boolean);
  const hasCoordinates =
    address.latitude !== null
    && address.latitude !== undefined
    && address.longitude !== null
    && address.longitude !== undefined;
  const addressLines = [
    address.addressLine1,
    address.addressLine2,
    [address.city, address.region].filter(Boolean).join(", ") || null,
    [address.postcode, address.country].filter(Boolean).join(", ") || null,
  ].filter((line): line is string => Boolean(line));
  const description = property?.longDescription ?? property?.shortDescription ?? "No description added yet.";
  const availabilityEvents = useMemo<EventMonthCalendarEvent[]>(
    () =>
      (bookingsQuery.data?.ranges ?? []).map((range, index) => ({
        id: `${range.externalBookingId}-${index}`,
        title: range.bookingName,
        date: parseDateKey(range.startDate),
        endDate: parseDateKey(range.endDate),
        tone: "default",
        meta: range.guestName ?? range.sourceName,
      })),
    [bookingsQuery.data?.ranges],
  );
  const bookingsByEventId = useMemo(
    () =>
      new Map<string, PropertyAvailabilityRange>(
        (bookingsQuery.data?.ranges ?? []).map((range, index) => [`${range.externalBookingId}-${index}`, range] as const),
      ),
    [bookingsQuery.data?.ranges],
  );

  const openGalleryAt = (index: number) => {
    setSelectedImageIndex(index);
    setGalleryOpen(true);
  };

  if (settingsQuery.isLoading) return <LoadingState rows={4} />;

  if (settingsQuery.isError) {
    return (
      <ErrorState
        title="Property unavailable"
        description={settingsQuery.error.message}
        onRetry={() => settingsQuery.refetch()}
      />
    );
  }

  if (!settingsQuery.data) return <LoadingState rows={3} />;

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
        <BackButton href="/properties" label="Back to properties" />
        <div className="mx-auto mt-3 flex w-full max-w-[1440px] flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{property.name}</h1>
              <Badge variant={property.status === "ACTIVE" ? "success" : "outline"}>
                {property.status === "ACTIVE" ? "Active" : "Archived"}
              </Badge>
            </div>
            <p className="max-w-3xl text-sm text-slate-600">
              {property.shortDescription ?? "Internal property summary and operational details."}
            </p>
          </div>
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1440px]">
        <div className="grid gap-6">
          <Card className="border-slate-200">
            <CardContent className="grid gap-4 p-4 lg:grid-cols-3 lg:items-stretch">
              <div className="grid h-full gap-2">
                <button
                  type="button"
                  className={`h-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-left ${PROPERTY_HERO_ASPECT_CLASS} lg:min-h-[340px] lg:[aspect-ratio:auto]`}
                  onClick={() => openGalleryAt(0)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={galleryImages[0]}
                    alt={`${property.name} hero`}
                    className="h-full w-full object-cover"
                  />
                </button>
              </div>
              <ImageGallerySummaryCard
                icon={Camera}
                label="Images"
                value={formatPropertyImageCount(property.galleryImageUrls.length)}
                images={galleryImages}
                propertyName={property.name}
                onOpenGallery={openGalleryAt}
              />
              <LocationSummaryCard
                hasAddress={hasAddress}
                hasCoordinates={hasCoordinates}
                addressLines={addressLines}
                propertyName={property.name}
                latitude={property.address.latitude}
                longitude={property.address.longitude}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="text-sm leading-7 text-slate-700">{description}</p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <SummaryStat
                  icon={Users}
                  label="Sleeps"
                  value={formatSleepsRange(property.sleepsMin, property.sleepsMax)}
                />
                <SummaryStat
                  icon={BedDouble}
                  label="Bedrooms"
                  value={property.bedrooms ?? "Not set"}
                />
                <SummaryStat
                  icon={Bath}
                  label="Bathrooms"
                  value={property.bathrooms ?? "Not set"}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <BookingMetaStat
                  icon={Clock3}
                  label="Check-in"
                  value={calendar?.checkInTime ?? "Not set"}
                />
                <BookingMetaStat
                  icon={Clock3}
                  label="Check-out"
                  value={calendar?.checkOutTime ?? "Not set"}
                />
                <BookingMetaStat
                  icon={CalendarDays}
                  label="Minimum stay"
                  value={calendar?.minimumStayDefault ? `${calendar.minimumStayDefault} nights` : "Not set"}
                />
                <BookingMetaStat
                  icon={CalendarDays}
                  label="Maximum stay"
                  value={calendar?.maximumStayDefault ? `${calendar.maximumStayDefault} nights` : "Not set"}
                />
                <BookingMetaStat
                  icon={CalendarDays}
                  label="Availability window"
                  value={calendar?.availabilityWindowDays ? `${calendar.availabilityWindowDays} days` : "Not set"}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-500" />
                Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {calendar?.calendarFeeds.length ? (
                <div className="grid gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {(bookingsQuery.data?.feeds ?? []).map((feed) => (
                      <Badge key={feed.sourceName} variant="outline" className="flex items-center gap-2 bg-slate-50 py-1.5">
                        <span className={`h-2 w-2 rounded-full ${feed.isConnected ? "bg-emerald-500" : "bg-slate-300"}`} />
                        <span>{feed.sourceName}</span>
                        <span className="text-[11px] text-slate-500">
                          {feed.isConnected ? `Synced ${formatRelativeSync(feed.lastSyncedAt)}` : "Not connected"}
                        </span>
                      </Badge>
                    ))}
                  </div>

                  {bookingsQuery.isLoading ? (
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading booking data.
                    </div>
                  ) : null}

                  {bookingsQuery.isError ? (
                    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      {bookingsQuery.error.message}
                    </div>
                  ) : null}

                  {!bookingsQuery.isLoading && !bookingsQuery.isError ? (
                    <div className="grid gap-4">
                      <div className="overflow-hidden rounded-lg border border-slate-200">
                        <EventMonthCalendar
                          initialMonth={calendarInitialMonth}
                          events={availabilityEvents}
                          emptyMessage="No booked dates were returned for this property."
                          renderEvent={(event, context) => {
                            const booking = bookingsByEventId.get(event.id) ?? null;
                            const colorClasses = getBookingCalendarClasses(booking);

                            return (
                              <button
                                type="button"
                                onClick={() => setSelectedBooking(booking)}
                                className={`flex h-full w-full items-center overflow-hidden px-2 text-left text-[11px] transition ${colorClasses} ${
                                  context.continuesBefore && context.continuesAfter
                                    ? ""
                                    : context.continuesBefore
                                      ? "rounded-r-md"
                                      : context.continuesAfter
                                        ? "rounded-l-md"
                                        : "rounded-md"
                                }`}
                              >
                                <p className="truncate font-medium">{event.title}</p>
                                {event.meta ? <p className="ml-2 truncate opacity-80">{event.meta}</p> : null}
                              </button>
                            );
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>

      <GalleryLightbox
        items={galleryLightboxItems}
        open={galleryOpen}
        index={selectedImageIndex}
        onOpenChange={setGalleryOpen}
        onIndexChange={setSelectedImageIndex}
      />
      <PropertyEditorDialog propertyId={propertyId} open={editOpen} onOpenChange={setEditOpen} />
      <BookingDetailsDialog
        booking={selectedBooking}
        open={Boolean(selectedBooking)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBooking(null);
          }
        }}
      />
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="h-full rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="text-base font-semibold text-slate-900">{value}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function ImageGallerySummaryCard({
  icon: Icon,
  label,
  value,
  images,
  propertyName,
  onOpenGallery,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  images: string[];
  propertyName: string;
  onOpenGallery: (index: number) => void;
}) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="text-base font-semibold text-slate-900">{value}</p>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-3 gap-2">
        {images.slice(0, 6).map((image, index) => (
          <button
            key={`${index}-${image.slice(0, 24)}`}
            type="button"
            className={`overflow-hidden rounded-md border border-slate-200 bg-white ${PROPERTY_THUMBNAIL_ASPECT_CLASS}`}
            onClick={() => onOpenGallery(index)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={`${propertyName} preview ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" className="mt-3 w-fit" onClick={() => onOpenGallery(0)}>
        <Images className="mr-2 h-4 w-4" />
        Open gallery
      </Button>
    </div>
  );
}

function LocationSummaryCard({
  hasAddress,
  hasCoordinates,
  addressLines,
  propertyName,
  latitude,
  longitude,
}: {
  hasAddress: boolean;
  hasCoordinates: boolean;
  addressLines: string[];
  propertyName: string;
  latitude: number | null | undefined;
  longitude: number | null | undefined;
}) {
  return (
    <div className="h-full rounded-lg border border-slate-200 bg-slate-50 p-3 sm:col-span-2 xl:col-span-1">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm">
          <MapPin className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Location</p>
          <p className="text-base font-semibold text-slate-900">Address</p>
        </div>
      </div>
      {hasAddress ? (
        <div className="grid gap-3">
          {hasCoordinates ? (
            <div className="grid gap-2">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <PropertyMap
                  latitude={latitude as number}
                  longitude={longitude as number}
                  label={propertyName}
                  className="relative h-36 w-full"
                  zoom={14}
                />
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-900"
                >
                  © OpenStreetMap contributors
                </a>
              </div>
            </div>
          ) : (
            <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white px-4 text-sm text-slate-500">
              No map preview available yet.
            </div>
          )}
          <div className="grid gap-1 text-sm text-slate-700">
            {addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No address added yet.</p>
      )}
    </div>
  );
}

function KeyValue({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-slate-400" /> : null}
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <span className="text-right text-sm text-slate-900">{value}</span>
    </div>
  );
}

function BookingMetaStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="text-sm font-medium text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function formatSleepsRange(sleepsMin: number | null | undefined, sleepsMax: number) {
  if (sleepsMin !== null && sleepsMin !== undefined && sleepsMin < sleepsMax) {
    return `${sleepsMin}-${sleepsMax}`;
  }

  return String(sleepsMax);
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}

function formatRelativeSync(value: string) {
  const syncedAt = new Date(value);
  if (Number.isNaN(syncedAt.getTime())) return "recently";

  const diffMinutes = Math.max(0, Math.round((Date.now() - syncedAt.getTime()) / 60000));
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return syncedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getBookingCalendarClasses(booking: PropertyAvailabilityRange | null) {
  const source = `${booking?.referrer ?? booking?.sourceName ?? ""}`.toLowerCase();

  if (source.includes("booking")) {
    return "bg-sky-600 text-white hover:bg-sky-500";
  }

  if (source.includes("airbnb")) {
    return "bg-rose-500 text-white hover:bg-rose-400";
  }

  return "bg-slate-900 text-white hover:bg-slate-800";
}
