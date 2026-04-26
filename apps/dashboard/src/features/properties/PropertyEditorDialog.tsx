"use client";

import { useEffect, useState } from "react";
import type { UpdatePropertyCalendarSettings, UpsertPropertySettings } from "@repo/api-contracts";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import {
  PropertyBookingSection,
  PropertyDetailsSection,
  isPropertyDraftValid,
  preparePropertyDraftForSave,
  toCalendarDraft,
  toPropertyDraft,
} from "@/features/properties/PropertyEditorSections";
import {
  useArchivePropertySettings,
  useSettings,
  useUpdatePropertyCalendarSettings,
  useUpdatePropertySettings,
} from "@/features/settings/hooks";

export function PropertyEditorDialog({
  propertyId,
  open,
  onOpenChange,
}: {
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const settingsQuery = useSettings();
  const updatePropertyMutation = useUpdatePropertySettings();
  const archivePropertyMutation = useArchivePropertySettings();
  const updatePropertyCalendarMutation = useUpdatePropertyCalendarSettings();

  const [propertyDraft, setPropertyDraft] = useState<UpsertPropertySettings | null>(null);
  const [calendarDraft, setCalendarDraft] = useState<UpdatePropertyCalendarSettings | null>(null);

  const property = settingsQuery.data?.properties.find((p) => p.id === propertyId) ?? null;
  const calendar = settingsQuery.data?.bookingAvailability.find((b) => b.propertyId === propertyId) ?? null;

  useEffect(() => {
    if (open) {
      if (property) {
        setPropertyDraft(toPropertyDraft(property));
      }
      if (calendar) {
        setCalendarDraft(toCalendarDraft(calendar));
      }
    }
  }, [open, property, calendar]);

  const saveProperty = async () => {
    if (!propertyDraft) return;
    await updatePropertyMutation.mutateAsync({ propertyId, request: preparePropertyDraftForSave(propertyDraft) });
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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>{property ? `Edit ${property.name}` : "Edit property"}</DialogTitle>
        </DialogHeader>
        <DialogBody className="grid gap-6">
          {settingsQuery.isLoading ? <LoadingState rows={5} /> : null}
          {settingsQuery.isError ? (
            <ErrorState
              title="Property unavailable"
              description={settingsQuery.error.message}
              onRetry={() => settingsQuery.refetch()}
            />
          ) : null}
          {!settingsQuery.isLoading && !settingsQuery.isError && (!property || !propertyDraft || !calendarDraft) ? (
            <ErrorState
              title="Property not found"
              description="This property does not exist or may have been removed."
            />
          ) : null}
          {property && propertyDraft && calendarDraft ? (
            <>
              <PropertyDetailsSection
                propertyDraft={propertyDraft}
                setPropertyDraft={setPropertyDraft}
                footer={(
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      {property.status === "ARCHIVED"
                        ? "This property is archived."
                        : "Property details and imagery are reused across templates and widgets."}
                    </div>
                    <div className="flex items-center gap-2">
                      {property.status !== "ARCHIVED" ? (
                        <Button variant="outline" onClick={archiveProperty} disabled={archivePropertyMutation.isPending}>
                          {archivePropertyMutation.isPending ? "Archiving..." : "Archive property"}
                        </Button>
                      ) : null}
                      <Button onClick={saveProperty} disabled={updatePropertyMutation.isPending || !isPropertyDraftValid(propertyDraft)}>
                        {updatePropertyMutation.isPending ? "Saving..." : "Save property"}
                      </Button>
                    </div>
                  </div>
                )}
              />

              <PropertyBookingSection
                calendarDraft={calendarDraft}
                setCalendarDraft={setCalendarDraft}
                footer={(
                  <div className="flex justify-end">
                    <Button onClick={saveCalendar} disabled={updatePropertyCalendarMutation.isPending}>
                      {updatePropertyCalendarMutation.isPending ? "Saving..." : "Save booking & availability"}
                    </Button>
                  </div>
                )}
              />
            </>
          ) : null}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
