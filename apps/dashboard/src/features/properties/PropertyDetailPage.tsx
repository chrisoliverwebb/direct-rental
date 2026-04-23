"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/navigation/BackButton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useSettings } from "@/features/settings/hooks";

const propertyTypeLabels: Record<string, string> = {
  COTTAGE: "Cottage",
  LODGE: "Lodge",
  APARTMENT: "Apartment",
  HOUSE: "House",
  B_AND_B: "B&B",
  OTHER: "Other",
};

export function PropertyDetailPage({ propertyId }: { propertyId: string }) {
  const settingsQuery = useSettings();

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

  const property = settingsQuery.data.properties.find((p) => p.id === propertyId);
  const calendar = settingsQuery.data.bookingAvailability.find((b) => b.propertyId === propertyId);

  if (!property) {
    return (
      <ErrorState
        title="Property not found"
        description="This property does not exist or may have been removed."
      />
    );
  }

  const hasAddress = Object.values(property.address).some(Boolean);
  const hasDescriptions = Boolean(property.shortDescription || property.longDescription);

  return (
    <div className="grid gap-6">
      <div>
        <BackButton href="/properties" label="Back to properties" />
        <div className="mt-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{property.name}</h1>
            <Badge variant={property.status === "ACTIVE" ? "success" : "outline"}>
              {property.status === "ACTIVE" ? "Active" : "Archived"}
            </Badge>
          </div>
          <Link href={`/properties/${propertyId}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
        {property.shortName ? (
          <p className="mt-1 text-sm text-muted-foreground">{property.shortName}</p>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <DetailRow label="Property type" value={property.propertyType ? (propertyTypeLabels[property.propertyType] ?? property.propertyType) : "Not set"} />
          <DetailRow label="Sleeps" value={property.sleeps ?? "Not set"} />
          <DetailRow label="Bedrooms" value={property.bedrooms ?? "Not set"} />
          <DetailRow label="Bathrooms" value={property.bathrooms ?? "Not set"} />
          <DetailRow label="Check-in time" value={property.checkInTime ?? "Not set"} />
          <DetailRow label="Check-out time" value={property.checkOutTime ?? "Not set"} />
          <DetailRow label="Booking email" value={property.bookingEmail ?? "Not set"} />
          <DetailRow label="Booking phone" value={property.bookingPhone ?? "Not set"} />
          <DetailRow label="Website" value={property.websiteUrl ?? "Not set"} />
          <DetailRow label="Direct booking URL" value={property.directBookingUrl ?? "Not set"} />
        </CardContent>
      </Card>

      {hasAddress ? (
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {property.address.addressLine1 ? <DetailRow label="Address line 1" value={property.address.addressLine1} /> : null}
            {property.address.addressLine2 ? <DetailRow label="Address line 2" value={property.address.addressLine2} /> : null}
            {property.address.city ? <DetailRow label="Town / city" value={property.address.city} /> : null}
            {property.address.region ? <DetailRow label="County / region" value={property.address.region} /> : null}
            {property.address.postcode ? <DetailRow label="Postcode" value={property.address.postcode} /> : null}
            {property.address.country ? <DetailRow label="Country" value={property.address.country} /> : null}
          </CardContent>
        </Card>
      ) : null}

      {hasDescriptions ? (
        <Card>
          <CardHeader>
            <CardTitle>Descriptions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {property.shortDescription ? <DetailRow label="Short description" value={property.shortDescription} /> : null}
            {property.longDescription ? <DetailRow label="Long description" value={property.longDescription} /> : null}
          </CardContent>
        </Card>
      ) : null}

      {calendar ? (
        <Card>
          <CardHeader>
            <CardTitle>Booking & availability</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <DetailRow
              label="Minimum stay"
              value={calendar.minimumStayDefault ? `${calendar.minimumStayDefault} nights` : "Not set"}
            />
            <DetailRow
              label="Maximum stay"
              value={calendar.maximumStayDefault ? `${calendar.maximumStayDefault} nights` : "Not set"}
            />
            <DetailRow
              label="Availability window"
              value={calendar.availabilityWindowDays ? `${calendar.availabilityWindowDays} days` : "Not set"}
            />
            <DetailRow
              label="iCal feeds"
              value={calendar.calendarFeeds.length > 0 ? `${calendar.calendarFeeds.length} feed(s) configured` : "None"}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 rounded-lg border p-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <span className="text-sm text-slate-900">{value}</span>
    </div>
  );
}
