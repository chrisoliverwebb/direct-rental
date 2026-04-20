"use client";

import { Info, Mail, Phone } from "lucide-react";
import { contactSourceLabel, contactStatusLabel } from "@repo/marketing";
import { formatDate, formatDateTime } from "@repo/shared";
import { BackButton } from "@/components/navigation/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <BackButton href="/contacts" label="Back to contacts" />
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">
            {contact.firstName} {contact.lastName}
          </h1>
          <Badge variant={contact.status === "SUBSCRIBED" ? "success" : "secondary"}>
            {contactStatusLabel(contact.status)}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Contact record</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3">
            <DetailRow
              label="Email"
              value={contact.email ?? "No email"}
              icon={<Mail className="h-4 w-4" />}
            />
            <DetailRow
              label="Phone number"
              value={contact.phone ?? "Not provided"}
              icon={<Phone className="h-4 w-4" />}
            />
            <DetailRow
              label="Status"
              value={
                <Badge variant={contact.status === "SUBSCRIBED" ? "success" : "secondary"}>
                  {contactStatusLabel(contact.status)}
                </Badge>
              }
            />
            <DetailRow label="Last contacted" value={formatDate(contact.lastContactedAt)} />
            <DetailRow
              label="Created at"
              value={`${formatDate(contact.createdAt)} (${contactSourceLabel(contact.source)})`}
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Consent</p>
          </div>
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
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 rounded-lg border p-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 text-sm text-slate-900">
        {icon ? <span className="text-slate-400">{icon}</span> : null}
        <span>{value}</span>
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
