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
  ].filter(Boolean);
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
        <div className="mt-3 flex justify-end">
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1440px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_280px] md:items-stretch md:p-8">
          <div className={`relative w-full overflow-hidden rounded-[24px] ${PROPERTY_HERO_ASPECT_CLASS} md:h-full md:w-auto md:max-w-full`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={galleryImages[0]}
              alt={`${property.name} hero`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={property.status === "ACTIVE" ? "success" : "outline"}>
                    {property.status === "ACTIVE" ? "Active" : "Archived"}
                  </Badge>
                  {property.shortName ? (
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                      {property.shortName}
                    </span>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{property.name}</h1>
                  <p className="max-w-2xl text-sm leading-6 text-white/85 md:text-base">
                    {property.shortDescription ?? "A direct-booking property profile with imagery, availability details, and core stay information."}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid w-full max-w-[280px] gap-4 sm:grid-cols-2 md:grid-cols-1">
            <ProfileStatCard
              icon={Users}
              label="Sleeps"
              value={formatSleepsRange(property.sleepsMin, property.sleepsMax)}
              description="Guest capacity"
            />
            <ProfileStatCard
              icon={BedDouble}
              label="Bedrooms"
              value={property.bedrooms ?? "Not set"}
              description="Sleeping spaces"
            />
            <ProfileStatCard
              icon={Bath}
              label="Bathrooms"
              value={property.bathrooms ?? "Not set"}
              description="Bath and shower rooms"
            />
            <ProfileStatCard
              icon={Camera}
              label="Images"
              value={formatPropertyImageCount(property.galleryImageUrls.length)}
              description={`Up to ${PROPERTY_GALLERY_LIMIT} gallery images`}
              action={(
                <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => openGalleryAt(0)}>
                  <Images className="mr-2 h-4 w-4" />
                  Open gallery
                </Button>
              )}
            />
          </div>
        </div>

        <div className="grid gap-6 border-t border-slate-200 p-6 md:p-8">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Profile summary for this property.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="text-sm leading-7 text-slate-700">{description}</p>
              {property.shortDescription && property.longDescription ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {property.shortDescription}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {hasAddress ? (
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)] lg:items-start">
                  {hasCoordinates ? (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <PropertyMap
                        latitude={property.address.latitude as number}
                        longitude={property.address.longitude as number}
                        label={property.name}
                        className="relative h-64 w-full"
                        zoom={14}
                      />
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-sm text-slate-500">
                      No map preview available yet.
                    </div>
                  )}
                  <div className="flex h-64 flex-col rounded-xl bg-slate-50 p-4">
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-slate-900">Address</h3>
                    </div>
                    <div className="grid gap-1 text-sm text-slate-700">
                      {addressLines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No address added yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-500" />
                Booking & availability
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <KeyValue
                label="Check-in"
                value={calendar?.checkInTime ?? "Not set"}
                icon={Clock3}
              />
              <KeyValue
                label="Check-out"
                value={calendar?.checkOutTime ?? "Not set"}
                icon={Clock3}
              />
              <KeyValue
                label="Minimum stay"
                value={calendar?.minimumStayDefault ? `${calendar.minimumStayDefault} nights` : "Not set"}
              />
              <KeyValue
                label="Maximum stay"
                value={calendar?.maximumStayDefault ? `${calendar.maximumStayDefault} nights` : "Not set"}
              />
              <KeyValue
                label="Availability window"
                value={calendar?.availabilityWindowDays ? `${calendar.availabilityWindowDays} days` : "Not set"}
              />
              {calendar?.calendarFeeds.length ? (
                <>
                  <div className="my-2 border-t border-slate-200" />
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
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading booking data.
                      </div>
                    ) : null}

                    {bookingsQuery.isError ? (
                      <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        {bookingsQuery.error.message}
                      </div>
                    ) : null}

                    {!bookingsQuery.isLoading && !bookingsQuery.isError ? (
                      <div className="grid gap-2">
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
                </>
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

function ProfileStatCard({
  icon: Icon,
  label,
  value,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        {action}
      </div>
      <div className="grid gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
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
