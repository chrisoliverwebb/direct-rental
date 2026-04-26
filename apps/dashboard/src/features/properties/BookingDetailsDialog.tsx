"use client";

import type { PropertyAvailabilityRange } from "@repo/api-contracts";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function BookingDetailsDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: PropertyAvailabilityRange | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{booking?.bookingName ?? "Booking details"}</DialogTitle>
        </DialogHeader>
        <DialogBody className="grid gap-6">
          {booking ? (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <Detail label="External Booking ID" value={booking.externalBookingId} />
                <Detail label="Creation date" value={formatDate(booking.creationDate)} />
                <Detail label="Name" value={booking.guestName ?? "Not provided"} />
                <Detail label="Email" value={booking.guestEmail ?? "Not provided"} />
                <Detail label="Number" value={booking.guestPhone ?? "Not provided"} />
                <Detail label="Referrer" value={booking.referrer ?? "Not provided"} />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Detail label="Adults" value={String(booking.adults)} />
                <Detail label="Children" value={String(booking.children)} />
                <Detail label="Dog" value={booking.dog ? "true" : "false"} />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Detail label="Property" value={booking.propertyName} />
                <Detail label="Unit" value={booking.unitName ?? "Not provided"} />
              </div>

              <Detail
                label="Stay"
                value={`${formatDate(booking.startDate)} to ${formatDate(booking.endDate)}`}
              />

              <Detail label="Notes" value={booking.notes ?? "No notes"} multiline />
            </>
          ) : null}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <p className={multiline ? "text-sm leading-6 text-slate-900" : "text-sm text-slate-900"}>{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
