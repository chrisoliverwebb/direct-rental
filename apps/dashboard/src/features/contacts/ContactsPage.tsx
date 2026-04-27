"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info, Mail, MessageSquare, Search } from "lucide-react";
import { contactStatusLabel } from "@repo/marketing";
import { formatDate } from "@repo/shared";
import { useState } from "react";
import { DEFAULT_DATA_TABLE_PAGE_SIZE } from "@/components/data-table/constants";
import { DataTablePanel } from "@/components/data-table/DataTablePanel";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { PageNavigation } from "@/components/navigation/PageNavigation";
import { Badge } from "@/components/ui/badge";
import { AddButton } from "@/components/ui/AddButton";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { TabbedPage } from "@/components/layout/TabbedPage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ContactCreateDialog } from "@/features/contacts/ContactCreateDialog";
import { usePageTab } from "@/hooks/usePageTab";
import { CONTACTS_TABS, CONTACTS_DEFAULT_TAB, type ContactsTab } from "@/lib/pageTabConfigs";
import { useContacts } from "@/features/marketing/hooks";

export function ContactsPage() {
  const router = useRouter();
  const [activeTab, setTab] = usePageTab<ContactsTab>(CONTACTS_TABS, CONTACTS_DEFAULT_TAB);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_DATA_TABLE_PAGE_SIZE);
  const [createOpen, setCreateOpen] = useState(false);

  const statusFilter: "SUBSCRIBED" | "UNSUBSCRIBED" | undefined =
    activeTab === "subscribed" ? "SUBSCRIBED" :
    activeTab === "unsubscribed" ? "UNSUBSCRIBED" :
    undefined;

  const contactsQuery = useContacts({
    page,
    pageSize,
    search: search || undefined,
    status: statusFilter,
  });

  const totalPages = contactsQuery.data?.totalPages ?? 1;
  const totalItems = contactsQuery.data?.totalItems ?? 0;

  return (
    <TabbedPage
      title="Contacts"
      navigation={<PageNavigation items={[{ label: "Contacts" }]} />}
      tabs={CONTACTS_TABS}
      activeTab={activeTab}
      onTabChange={(tab) => {
        setTab(tab);
        setPage(1);
      }}
      tabsTrailing={
        <DataTableToolbar>
          <InputGroup className="h-9 max-w-xs">
            <InputGroupAddon>
              <Search className="text-slate-400" />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search contacts"
            />
            <InputGroupAddon align="inline-end">
              {contactsQuery.data ? `${contactsQuery.data.totalItems} results` : null}
            </InputGroupAddon>
          </InputGroup>
          <AddButton label="Add Contact" onClick={() => setCreateOpen(true)} />
        </DataTableToolbar>
      }
    >
      {contactsQuery.isLoading ? <LoadingState rows={6} /> : null}
      {contactsQuery.isError ? (
        <ErrorState
          title="Contacts unavailable"
          description={contactsQuery.error.message}
          onRetry={() => contactsQuery.refetch()}
        />
      ) : null}
      {contactsQuery.data && contactsQuery.data.items.length === 0 ? (
        <EmptyState
          title="No contacts found"
          description="Try broadening the search or clearing filters."
        />
      ) : null}
      {contactsQuery.data && contactsQuery.data.items.length > 0 ? (
        <DataTablePanel
          pagination={{
            page,
            pageSize,
            totalPages,
            totalItems,
            itemLabel: "contacts",
            onPageChange: setPage,
            onPageSizeChange: (nextPageSize) => {
              setPageSize(nextPageSize);
              setPage(1);
            },
          }}
        >
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
                        className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                      <div className="pointer-events-none absolute left-0 top-6 z-10 hidden w-72 rounded-md bg-slate-900 px-3 py-2 text-xs font-normal leading-5 text-white shadow-lg group-hover:block">
                        In line with GDPR, marketing should only be sent to
                        contacts who are subscribed. Transactional emails can
                        still be sent to unsubscribed contacts when needed.
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
                      <Badge
                        variant={
                          contact.status === "SUBSCRIBED"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {contactStatusLabel(contact.status)}
                      </Badge>
                      <div className="flex items-center gap-1 text-slate-500">
                        {contact.emailMarketing ? (
                          <Mail
                            className="h-3.5 w-3.5"
                            aria-label="Email subscribed"
                          />
                        ) : null}
                        {contact.smsMarketing ? (
                          <MessageSquare
                            className="h-3.5 w-3.5"
                            aria-label="SMS subscribed"
                          />
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(contact.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTablePanel>
      ) : null}

      <ContactCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </TabbedPage>
  );
}
