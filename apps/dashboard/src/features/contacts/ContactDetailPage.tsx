"use client";

import { contactStatusLabel } from "@repo/marketing";
import { formatDate, formatDateTime } from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useContact } from "@/features/marketing/hooks";

export function ContactDetailPage({ contactId }: { contactId: string }) {
  const contactQuery = useContact(contactId);

  if (contactQuery.isLoading) {
    return <LoadingState rows={4} />;
  }

  if (contactQuery.isError) {
    return <ErrorState title="Contact unavailable" description={contactQuery.error.message} onRetry={() => contactQuery.refetch()} />;
  }

  if (!contactQuery.data) {
    return <LoadingState rows={3} />;
  }

  const contact = contactQuery.data;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {contact.firstName} {contact.lastName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{contact.email}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Core contact and property details.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <DetailRow label="Phone" value={contact.phone ?? "Not provided"} />
            <DetailRow label="Property" value={contact.propertyName} />
            <DetailRow label="Source" value={contact.source} />
            <DetailRow label="Status" value={<Badge variant={contact.status === "SUBSCRIBED" ? "success" : "secondary"}>{contactStatusLabel(contact.status)}</Badge>} />
            <DetailRow label="Created" value={formatDate(contact.createdAt)} />
            <DetailRow label="Last booking" value={formatDate(contact.lastBookingAt)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Consent</CardTitle>
            <CardDescription>Current marketing consent flags and capture timing.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <DetailRow label="Email marketing" value={contact.consents.emailMarketing ? "Yes" : "No"} />
            <DetailRow label="SMS marketing" value={contact.consents.smsMarketing ? "Yes" : "No"} />
            <DetailRow label="Captured at" value={formatDateTime(contact.consents.capturedAt)} />
            <DetailRow label="Notes" value={contact.notes ?? "No notes yet"} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 rounded-lg border p-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <div className="text-sm text-slate-900">{value}</div>
    </div>
  );
}
