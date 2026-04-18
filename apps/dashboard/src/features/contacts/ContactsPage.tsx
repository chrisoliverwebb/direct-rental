"use client";

import Link from "next/link";
import { contactStatusLabel } from "@repo/marketing";
import { formatDate } from "@repo/shared";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useContacts } from "@/features/marketing/hooks";

export function ContactsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");

  const contactsQuery = useContacts({
    page: 1,
    pageSize: 10,
    search: search || undefined,
    status: status ? (status as "SUBSCRIBED" | "UNSUBSCRIBED") : undefined,
    source: source ? (source as "MANUAL_IMPORT" | "CSV_IMPORT" | "MANUAL_ENTRY" | "WIFI_CAPTURE") : undefined,
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Contacts</h1>
        <p className="mt-1 text-sm text-muted-foreground">Guest database with search and basic filtering.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contacts" />
        <Select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="SUBSCRIBED">Subscribed</option>
          <option value="UNSUBSCRIBED">Unsubscribed</option>
        </Select>
        <Select value={source} onChange={(event) => setSource(event.target.value)}>
          <option value="">All sources</option>
          <option value="MANUAL_IMPORT">Manual import</option>
          <option value="CSV_IMPORT">CSV import</option>
          <option value="MANUAL_ENTRY">Manual entry</option>
          <option value="WIFI_CAPTURE">WiFi capture</option>
        </Select>
      </div>

      {contactsQuery.isLoading ? <LoadingState rows={6} /> : null}
      {contactsQuery.isError ? (
        <ErrorState title="Contacts unavailable" description={contactsQuery.error.message} onRetry={() => contactsQuery.refetch()} />
      ) : null}
      {contactsQuery.data && contactsQuery.data.items.length === 0 ? (
        <EmptyState title="No contacts found" description="Try broadening the search or clearing filters." />
      ) : null}
      {contactsQuery.data && contactsQuery.data.items.length > 0 ? (
        <div className="rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contactsQuery.data.items.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Link className="font-medium text-primary" href={`/contacts/${contact.id}`}>
                      {contact.firstName} {contact.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>
                    <Badge variant={contact.status === "SUBSCRIBED" ? "success" : "secondary"}>
                      {contactStatusLabel(contact.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{contact.propertyName}</TableCell>
                  <TableCell>{formatDate(contact.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}
