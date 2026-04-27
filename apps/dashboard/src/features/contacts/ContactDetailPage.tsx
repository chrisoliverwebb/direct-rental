"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CalendarDays, CircleUser, Info, Mail, Phone } from "lucide-react";
import { contactSourceLabel, contactStatusLabel } from "@repo/marketing";
import { formatDate, formatDateTime } from "@repo/shared";
import { DetailPageHeader } from "@/components/layout/DetailPageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/sonner";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ContactEditorDialog } from "@/features/contacts/ContactEditorDialog";
import { useContact, useDeleteContact } from "@/features/marketing/hooks";

export function ContactDetailPage({ contactId }: { contactId: string }) {
  const router = useRouter();
  const contactQuery = useContact(contactId);
  const deleteMutation = useDeleteContact();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
  const contactName = `${contact.firstName} ${contact.lastName}`;

  return (
    <div className="grid gap-6">
      <DetailPageHeader
        title={contactName}
        listHref="/contacts"
        listLabel="Contacts"
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      >
        <div className="mt-2 flex w-full flex-col gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3">
          <div className="grid gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-medium tracking-tight text-slate-900">{contactName}</h1>
              <Badge variant={contact.status === "SUBSCRIBED" ? "success" : "secondary"}>
                {contactStatusLabel(contact.status)}
              </Badge>
            </div>
            <p className="text-sm text-slate-600">
              {[contact.email, contact.phone].filter(Boolean).join(" · ") || "No contact details"}
            </p>
          </div>
        </div>
      </DetailPageHeader>

      <ContactEditorDialog contact={contact} open={editOpen} onOpenChange={setEditOpen} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete contact"
        description={`Remove ${contactName} from your contacts. This cannot be undone.`}
        confirmLabel="Delete"
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(contactId);
          toast.success("Contact deleted");
          router.push("/contacts");
        }}
      />

      <Card className="mx-auto w-full max-w-[1440px]">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <DetailRow
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={contact.email ?? "No email"}
          />
          <DetailRow
            icon={<Phone className="h-4 w-4" />}
            label="Phone number"
            value={contact.phone ?? "Not provided"}
          />
          <DetailRow
            icon={<CircleUser className="h-4 w-4" />}
            label="Status"
            value={
              <Badge variant={contact.status === "SUBSCRIBED" ? "success" : "secondary"}>
                {contactStatusLabel(contact.status)}
              </Badge>
            }
          />
          <DetailRow
            icon={<CalendarClock className="h-4 w-4" />}
            label="Last contacted"
            value={formatDate(contact.lastContactedAt)}
          />
          <DetailRow
            icon={<CalendarDays className="h-4 w-4" />}
            label="Created at"
            value={`${formatDate(contact.createdAt)} (${contactSourceLabel(contact.source)})`}
          />
        </CardContent>
      </Card>

      <Card className="mx-auto w-full max-w-[1440px]">
        <CardHeader>
          <CardTitle>Consent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <ConsentCard
              label="Email marketing"
              enabled={contact.consents.emailMarketing}
              capturedAt={contact.consents.capturedAt}
              unsubscribedAt={contact.consents.emailUnsubscribedAt}
            />
            <ConsentCard
              label="SMS marketing"
              enabled={contact.consents.smsMarketing}
              capturedAt={contact.consents.capturedAt}
              unsubscribedAt={contact.consents.smsUnsubscribedAt}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="mt-0.5 rounded-md border border-slate-200 bg-white p-1.5 text-slate-500">{icon}</div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ConsentCard({
  label,
  enabled,
  capturedAt,
  unsubscribedAt,
}: {
  label: string;
  enabled: boolean;
  capturedAt: string;
  unsubscribedAt: string | null;
}) {
  const statusLabel = enabled ? "Subscribed" : unsubscribedAt ? "Unsubscribed" : "Not subscribed";
  const badgeVariant = enabled ? "success" : unsubscribedAt ? "destructive" : "secondary";
  const hadMarketingConsent = enabled || Boolean(unsubscribedAt);

  return (
    <div className="relative rounded-lg border p-4">
      <div className="absolute right-3 top-3 group">
        <button
          type="button"
          aria-label={`${label} collected at ${formatDateTime(capturedAt)}`}
          className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <Info className="h-4 w-4" />
        </button>
        <div className="pointer-events-none absolute right-0 top-8 z-10 hidden w-max max-w-[220px] rounded-md bg-slate-900 px-2 py-1.5 text-xs text-white shadow-lg group-hover:block">
          Collected at {formatDateTime(capturedAt)}
        </div>
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <div className="mt-3 space-y-2">
        <Badge variant={badgeVariant}>{statusLabel}</Badge>
        <div className="space-y-1 text-sm text-muted-foreground">
          {hadMarketingConsent ? <p>Signed up on {formatDateTime(capturedAt)}</p> : <p>No marketing consent recorded</p>}
          {unsubscribedAt ? <p>Unsubscribed on {formatDateTime(unsubscribedAt)}</p> : null}
        </div>
      </div>
    </div>
  );
}
