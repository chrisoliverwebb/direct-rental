"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info, Mail, MessageSquare, Plus, Search } from "lucide-react";
import { contactStatusLabel } from "@repo/marketing";
import { formatDate } from "@repo/shared";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useContacts } from "@/features/marketing/hooks";

export function ContactsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"SUBSCRIBED" | "UNSUBSCRIBED" | "">("SUBSCRIBED");

  const contactsQuery = useContacts({
    page: 1,
    pageSize: 10,
    search: search || undefined,
    status: status ? (status as "SUBSCRIBED" | "UNSUBSCRIBED") : undefined,
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">Contacts</h1>
        <Link
          href="/contacts/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New contact
        </Link>
      </div>

      <div className="grid gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search contacts"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={status === "SUBSCRIBED" ? "default" : "outline"}
            onClick={() => setStatus("SUBSCRIBED")}
          >
            Subscribed
          </Button>
          <Button
            type="button"
            size="sm"
            variant={status === "UNSUBSCRIBED" ? "default" : "outline"}
            onClick={() => setStatus("UNSUBSCRIBED")}
          >
            Unsubscribed
          </Button>
          <Button type="button" size="sm" variant={status === "" ? "default" : "outline"} onClick={() => setStatus("")}>
            All
          </Button>
        </div>
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
                <TableHead>Phone number</TableHead>
                <TableHead>Last contacted</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">
                    <span>Marketing</span>
                    <div className="group relative">
                      <button
                        type="button"
                        aria-label="Marketing consent guidance"
                        className="rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                      <div className="pointer-events-none absolute left-0 top-6 z-10 hidden w-72 rounded-md bg-slate-900 px-3 py-2 text-xs font-normal leading-5 text-white shadow-lg group-hover:block">
                        In line with GDPR, marketing should only be sent to contacts who are subscribed. Transactional
                        emails can still be sent to unsubscribed contacts when needed.
                      </div>
                    </div>
                  </div>
                </TableHead>
                <TableHead>Created at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contactsQuery.data.items.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/contacts/${contact.id}`)}
                >
                  <TableCell>
                    <Link
                      className="font-medium text-primary"
                      href={`/contacts/${contact.id}`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {contact.firstName} {contact.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{contact.email ?? "No email"}</TableCell>
                  <TableCell>{contact.phone ?? "No phone"}</TableCell>
                  <TableCell>{formatDate(contact.lastContactedAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={contact.status === "SUBSCRIBED" ? "success" : "secondary"}>
                        {contactStatusLabel(contact.status)}
                      </Badge>
                      <div className="flex items-center gap-1 text-slate-500">
                        {contact.emailMarketing ? <Mail className="h-3.5 w-3.5" aria-label="Email subscribed" /> : null}
                        {contact.smsMarketing ? <MessageSquare className="h-3.5 w-3.5" aria-label="SMS subscribed" /> : null}
                      </div>
                    </div>
                  </TableCell>
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
