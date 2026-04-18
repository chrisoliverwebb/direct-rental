"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createContactRequestSchema, type ContactImportResult, type CreateContactRequest } from "@repo/api-contracts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, LoaderCircle, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCreateContact, useImportContacts } from "@/features/marketing/hooks";

const phoneCountries = [
  { code: "GB", label: "🇬🇧 +44", dialCode: "+44" },
  { code: "IE", label: "🇮🇪 +353", dialCode: "+353" },
  { code: "US", label: "🇺🇸 +1", dialCode: "+1" },
  { code: "CA", label: "🇨🇦 +1", dialCode: "+1" },
  { code: "AU", label: "🇦🇺 +61", dialCode: "+61" },
  { code: "NZ", label: "🇳🇿 +64", dialCode: "+64" },
  { code: "FR", label: "🇫🇷 +33", dialCode: "+33" },
  { code: "DE", label: "🇩🇪 +49", dialCode: "+49" },
  { code: "ES", label: "🇪🇸 +34", dialCode: "+34" },
  { code: "IT", label: "🇮🇹 +39", dialCode: "+39" },
] as const;

const CONTACT_FIELDS: Array<{ value: string; label: string; required: boolean }> = [
  { value: "firstName", label: "First name", required: true },
  { value: "lastName", label: "Last name", required: true },
  { value: "email", label: "Email", required: false },
  { value: "phone", label: "Phone", required: false },
  { value: "emailMarketing", label: "Email marketing", required: false },
  { value: "smsMarketing", label: "SMS marketing", required: false },
];

export function ContactCreatePage() {
  const router = useRouter();
  const createContact = useCreateContact();
  const importContacts = useImportContacts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ContactImportResult | null>(null);
  const [csvPreview, setCsvPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [phoneCountry, setPhoneCountry] = useState<(typeof phoneCountries)[number]["code"]>("GB");

  const form = useForm<CreateContactRequest>({
    resolver: zodResolver(createContactRequestSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      consents: {
        emailMarketing: false,
        smsMarketing: false,
      },
    },
  });

  const emailValue = form.watch("email");
  const phoneValue = form.watch("phone");
  const canEnableEmailMarketing = Boolean(emailValue?.trim());
  const canEnableSmsMarketing = Boolean(phoneValue?.trim());

  useEffect(() => {
    if (!canEnableEmailMarketing && form.getValues("consents.emailMarketing")) {
      form.setValue("consents.emailMarketing", false, { shouldValidate: true, shouldDirty: true });
    }
  }, [canEnableEmailMarketing, form]);

  useEffect(() => {
    if (!canEnableSmsMarketing && form.getValues("consents.smsMarketing")) {
      form.setValue("consents.smsMarketing", false, { shouldValidate: true, shouldDirty: true });
    }
  }, [canEnableSmsMarketing, form]);

  const handleCreateContact = async (values: CreateContactRequest) => {
    const selectedCountry = phoneCountries.find((country) => country.code === phoneCountry) ?? phoneCountries[0];
    const normalizedLocalPhone = values.phone?.replace(/[^\d]/g, "").replace(/^0+/, "") ?? "";
    const formattedPhone = normalizedLocalPhone ? `${selectedCountry.dialCode}${normalizedLocalPhone}` : null;

    const result = await createContact.mutateAsync({
      ...values,
      phone: formattedPhone,
    });
    router.push(`/contacts/${result.id}`);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      return;
    }

    const text = await selectedFile.text();
    const mappedCsv = applyMapping(text, fieldMapping);
    const mappedFile = new File([mappedCsv], selectedFile.name, { type: "text/csv" });

    const formData = new FormData();
    formData.append("file", mappedFile);

    const result = await importContacts.mutateAsync(formData);
    setImportResult(result);

    if (result.status === "COMPLETED") {
      setSelectedFile(null);
      setCsvPreview(null);
      setFieldMapping({});
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = async (file: File | null) => {
    setSelectedFile(file);
    setImportResult(null);
    setFieldMapping({});

    if (!file) {
      setCsvPreview(null);
      return;
    }

    const text = await file.text();
    const preview = parseCsvPreview(text);
    setCsvPreview(preview);
    setFieldMapping(autoDetectMapping(preview.headers));
  };

  const mappedFieldValues = Object.values(fieldMapping);
  const unmappedRequired = CONTACT_FIELDS.filter((f) => f.required && !mappedFieldValues.includes(f.value));
  const hasEmailOrPhone = mappedFieldValues.includes("email") || mappedFieldValues.includes("phone");
  const canImport = selectedFile !== null && unmappedRequired.length === 0 && hasEmailOrPhone;

  return (
    <div className="grid gap-6">
      <div>
        <Link
          href="/contacts"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to contacts
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">New contact</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enter manually</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={form.handleSubmit(handleCreateContact)}>
              <div className="grid gap-4 md:grid-cols-2">
                <InlineFormField label="First name" error={form.formState.errors.firstName?.message} htmlFor="firstName">
                  <Input id="firstName" {...form.register("firstName")} />
                </InlineFormField>
                <InlineFormField label="Last name" error={form.formState.errors.lastName?.message} htmlFor="lastName">
                  <Input id="lastName" {...form.register("lastName")} />
                </InlineFormField>
              </div>
              <div className="grid gap-4">
                <InlineFormField label="Email" error={form.formState.errors.email?.message} htmlFor="email">
                  <Input id="email" type="email" {...form.register("email")} />
                </InlineFormField>
                <div className="grid gap-2">
                  <label className="flex items-center gap-2 text-sm text-slate-900">
                    <Checkbox {...form.register("consents.emailMarketing")} disabled={!canEnableEmailMarketing} />
                    <span>Email marketing</span>
                  </label>
                  <span className={form.formState.errors.consents?.emailMarketing ? "text-sm text-destructive" : "hidden"}>
                    {form.formState.errors.consents?.emailMarketing?.message}
                  </span>
                </div>
                <InlineFormField label="Phone number" error={form.formState.errors.phone?.message} htmlFor="phone">
                  <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
                    <Select value={phoneCountry} onChange={(event) => setPhoneCountry(event.target.value as (typeof phoneCountries)[number]["code"])}>
                      {phoneCountries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.label}
                        </option>
                      ))}
                    </Select>
                    <Input id="phone" {...form.register("phone")} placeholder="7700 900123" />
                  </div>
                </InlineFormField>
                <div className="grid gap-2">
                  <label className="flex items-center gap-2 text-sm text-slate-900">
                    <Checkbox {...form.register("consents.smsMarketing")} disabled={!canEnableSmsMarketing} />
                    <span>SMS marketing</span>
                  </label>
                  <span className={form.formState.errors.consents?.smsMarketing ? "text-sm text-destructive" : "hidden"}>
                    {form.formState.errors.consents?.smsMarketing?.message}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={createContact.isPending}>
                  Save contact
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/contacts")} disabled={createContact.isPending}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <CardTitle>Upload CSV</CardTitle>
            <a
              href="/test-contacts.csv"
              download
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Download example CSV
            </a>
          </CardHeader>
          <CardContent className="grid gap-4">
            <InlineFormField label="CSV file" htmlFor="contactsCsv">
              <Input
                ref={fileInputRef}
                id="contactsCsv"
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
              />
            </InlineFormField>

            {csvPreview ? (
              <div className="grid gap-3 rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Map columns</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Match each column in your CSV to a contact field.</p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 gap-3">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">CSV column</span>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contact field</span>
                  </div>
                  {csvPreview.headers.map((header) => {
                    const currentValue = fieldMapping[header] ?? "";
                    return (
                      <div key={header} className="grid grid-cols-2 items-center gap-3">
                        <span className="truncate rounded bg-slate-100 px-2 py-1 font-mono text-sm text-slate-700">
                          {header}
                        </span>
                        <Select
                          value={currentValue}
                          onChange={(e) =>
                            setFieldMapping((prev) => ({ ...prev, [header]: e.target.value }))
                          }
                        >
                          <option value="">Don't import</option>
                          {CONTACT_FIELDS.map((field) => (
                            <option
                              key={field.value}
                              value={field.value}
                              disabled={field.value !== currentValue && mappedFieldValues.includes(field.value)}
                            >
                              {field.label}{field.required ? " *" : ""}
                            </option>
                          ))}
                        </Select>
                      </div>
                    );
                  })}
                </div>
                {unmappedRequired.length > 0 ? (
                  <p className="text-sm text-destructive">
                    Required: {unmappedRequired.map((f) => f.label).join(", ")}
                  </p>
                ) : null}
                {unmappedRequired.length === 0 && !hasEmailOrPhone ? (
                  <p className="text-sm text-destructive">Map at least Email or Phone</p>
                ) : null}
              </div>
            ) : null}

            {csvPreview ? (
              <div className="grid gap-3 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900">Preview</p>
                  <p className="text-sm text-muted-foreground">
                    {csvPreview.rows.length} {csvPreview.rows.length === 1 ? "record" : "records"}
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {csvPreview.headers.map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvPreview.rows.map((row, rowIndex) => (
                      <TableRow key={`${rowIndex}-${row.join("-")}`}>
                        {csvPreview.headers.map((header, columnIndex) => (
                          <TableCell key={`${header}-${rowIndex}`}>{row[columnIndex] || "—"}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <Button type="button" onClick={handleImport} disabled={!canImport || importContacts.isPending}>
                {importContacts.isPending ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Adding contacts...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Add
                  </>
                )}
              </Button>
              {selectedFile ? <span className="text-sm text-muted-foreground">{selectedFile.name}</span> : null}
            </div>

            {importContacts.isPending ? (
              <div className="grid gap-3 rounded-lg border border-dashed p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <LoaderCircle className="h-4 w-4 animate-spin text-slate-500" />
                  Processing import
                </div>
                <div className="grid gap-2">
                  <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ) : null}

            {importResult ? (
              <div className="grid gap-3 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Badge variant={importResult.status === "COMPLETED" ? "success" : "destructive"}>
                    {importResult.status === "COMPLETED" ? "Import completed" : "Import failed"}
                  </Badge>
                </div>
                {importResult.status === "COMPLETED" ? (
                  <p className="text-sm text-slate-900">Imported {importResult.importedRows} contacts successfully.</p>
                ) : null}
                {importResult.errors.length > 0 ? (
                  <div className="grid gap-1 text-sm text-muted-foreground">
                    <p className="text-sm text-slate-900">
                      Import failed. All {importResult.totalRows} contacts were rejected.
                    </p>
                    {importResult.errors.map((error) => (
                      <p key={`${error.rowNumber}-${error.message}`}>
                        Row {error.rowNumber}: {error.message}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InlineFormField({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-foreground" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? <span className="text-sm text-destructive">{error}</span> : null}
    </div>
  );
}

function autoDetectMapping(headers: string[]): Record<string, string> {
  const normalize = (s: string) => s.toLowerCase().replace(/[_\s-]/g, "");
  const mapping: Record<string, string> = {};
  for (const header of headers) {
    const normalized = normalize(header);
    const match = CONTACT_FIELDS.find((f) => normalize(f.value) === normalized || normalize(f.label) === normalized);
    mapping[header] = match?.value ?? "";
  }
  return mapping;
}

function applyMapping(csvText: string, mapping: Record<string, string>): string {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return csvText;

  const [headerLine, ...dataLines] = lines;
  const originalHeaders = splitCsvLine(headerLine);

  const mappedColumns = originalHeaders
    .map((h, i) => ({ mappedHeader: mapping[h] ?? "", index: i }))
    .filter((col) => col.mappedHeader !== "");

  if (mappedColumns.length === 0) return csvText;

  const newHeaderLine = mappedColumns.map((col) => col.mappedHeader).join(",");
  const newDataLines = dataLines.map((line) => {
    const values = splitCsvLine(line);
    return mappedColumns.map((col) => values[col.index] ?? "").join(",");
  });

  return [newHeaderLine, ...newDataLines].join("\n");
}

function parseCsvPreview(csvText: string) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const [headerLine, ...rowLines] = lines;
  const headers = splitCsvLine(headerLine);
  const rows = rowLines.map(splitCsvLine);

  return { headers, rows };
}

function splitCsvLine(line: string) {
  return line.split(",").map((value) => value.trim());
}
