"use client";

import { useEffect, useState } from "react";
import { Building2, Megaphone, Palette, Send, Settings2 } from "lucide-react";
import type {
  Address,
  BrandingSettings,
  CompanySettings,
  MarketingSettings,
  SendingSettings,
} from "@repo/api-contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { toast } from "@/components/ui/sonner";
import {
  useSettings,
  useUpdateBrandingSettings,
  useUpdateCompanySettings,
  useUpdateMarketingSettings,
  useUpdateSendingSettings,
} from "@/features/settings/hooks";

const sectionItems = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "branding", label: "Branding & Theme", icon: Palette },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "sending", label: "Sending", icon: Send },
] as const;

const fontOptions = ["Fraunces", "Manrope", "Lora", "Source Serif 4", "DM Sans", "Work Sans"];

const companyThemeOptions = [
  { value: "", label: "No fixed company theme" },
  { value: "classic-coastal", label: "Classic Coastal" },
  { value: "coastal-soft", label: "Coastal Soft" },
  { value: "heritage-editorial", label: "Heritage Editorial" },
];

export function SettingsPage() {
  const settingsQuery = useSettings();
  const updateCompanyMutation = useUpdateCompanySettings();
  const updateBrandingMutation = useUpdateBrandingSettings();
  const updateMarketingMutation = useUpdateMarketingSettings();
  const updateSendingMutation = useUpdateSendingSettings();

  const [companyDraft, setCompanyDraft] = useState<CompanySettings | null>(null);
  const [brandingDraft, setBrandingDraft] = useState<BrandingSettings | null>(null);
  const [marketingDraft, setMarketingDraft] = useState<MarketingSettings | null>(null);
  const [sendingDraft, setSendingDraft] = useState<SendingSettings | null>(null);

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }

    setCompanyDraft(settingsQuery.data.company);
    setBrandingDraft(settingsQuery.data.branding);
    setMarketingDraft(settingsQuery.data.marketing);
    setSendingDraft(settingsQuery.data.sending);
  }, [settingsQuery.data]);

  if (settingsQuery.isLoading) {
    return <LoadingState rows={5} />;
  }

  if (settingsQuery.isError) {
    return (
      <ErrorState
        title="Settings unavailable"
        description={settingsQuery.error.message}
        onRetry={() => settingsQuery.refetch()}
      />
    );
  }

  if (!settingsQuery.data || !companyDraft || !brandingDraft || !marketingDraft || !sendingDraft) {
    return <LoadingState rows={4} />;
  }

  const saveCompany = async () => {
    await updateCompanyMutation.mutateAsync(companyDraft);
    toast.success("Company settings saved");
  };

  const saveBranding = async () => {
    await updateBrandingMutation.mutateAsync(brandingDraft);
    toast.success("Branding settings saved");
  };

  const saveMarketing = async () => {
    await updateMarketingMutation.mutateAsync(marketingDraft);
    toast.success("Marketing settings saved");
  };

  const saveSending = async () => {
    await updateSendingMutation.mutateAsync(sendingDraft);
    toast.success("Sending settings saved");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="xl:sticky xl:top-24 xl:self-start">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings2 className="h-4 w-4 text-slate-500" />
              Settings
            </CardTitle>
            <CardDescription>Company defaults, branding, marketing, and sending configuration.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-1">
            {sectionItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </CardContent>
        </Card>
      </aside>

      <div className="grid gap-6">
        <section id="company" className="scroll-mt-24">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Company</CardTitle>
              <CardDescription>Business identity, contact details, and account-level defaults.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Company name">
                  <Input value={companyDraft.companyName} onChange={(event) => setCompanyDraft({ ...companyDraft, companyName: event.target.value })} />
                </Field>
                <Field label="Business / trading name">
                  <Input value={companyDraft.tradingName ?? ""} onChange={(event) => setCompanyDraft({ ...companyDraft, tradingName: nullable(event.target.value) })} />
                </Field>
                <Field label="Contact email">
                  <Input type="email" value={companyDraft.contactEmail ?? ""} onChange={(event) => setCompanyDraft({ ...companyDraft, contactEmail: nullable(event.target.value) })} />
                </Field>
                <Field label="Contact phone">
                  <Input value={companyDraft.contactPhone ?? ""} onChange={(event) => setCompanyDraft({ ...companyDraft, contactPhone: nullable(event.target.value) })} />
                </Field>
                <Field label="Website URL">
                  <Input value={companyDraft.websiteUrl ?? ""} onChange={(event) => setCompanyDraft({ ...companyDraft, websiteUrl: nullable(event.target.value) })} />
                </Field>
                <Field label="Default timezone">
                  <Input value={companyDraft.defaultTimezone ?? ""} onChange={(event) => setCompanyDraft({ ...companyDraft, defaultTimezone: nullable(event.target.value) })} />
                </Field>
                <Field label="Default sender display name">
                  <Input value={companyDraft.defaultSenderName ?? ""} onChange={(event) => setCompanyDraft({ ...companyDraft, defaultSenderName: nullable(event.target.value) })} />
                </Field>
                <Field label="Default reply-to email">
                  <Input type="email" value={companyDraft.defaultReplyToEmail ?? ""} onChange={(event) => setCompanyDraft({ ...companyDraft, defaultReplyToEmail: nullable(event.target.value) })} />
                </Field>
                <Field label="Default currency">
                  <Input value={companyDraft.defaultCurrency ?? ""} onChange={(event) => setCompanyDraft({ ...companyDraft, defaultCurrency: nullable(event.target.value) })} />
                </Field>
              </div>

              <SectionGroup heading="Business address" />
              <AddressFields value={companyDraft.address} onChange={(address) => setCompanyDraft({ ...companyDraft, address })} />

              <div className="flex justify-end">
                <Button onClick={saveCompany} disabled={updateCompanyMutation.isPending}>
                  {updateCompanyMutation.isPending ? "Saving..." : "Save company"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="branding" className="scroll-mt-24">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Branding & Theme</CardTitle>
              <CardDescription>Company-level colours, fonts, and visual defaults for emails and branded surfaces.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <SectionGroup heading="Brand basics" />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Brand name">
                  <Input value={brandingDraft.brandName ?? ""} onChange={(event) => setBrandingDraft({ ...brandingDraft, brandName: nullable(event.target.value) })} />
                </Field>
                <Field label="Primary logo URL">
                  <Input value={brandingDraft.logoUrl ?? ""} onChange={(event) => setBrandingDraft({ ...brandingDraft, logoUrl: nullable(event.target.value) })} />
                </Field>
                <Field label="Default company theme">
                  <Select value={brandingDraft.companyThemeId ?? ""} onChange={(event) => setBrandingDraft({ ...brandingDraft, companyThemeId: nullable(event.target.value) })}>
                    {companyThemeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <SectionGroup heading="Colours" />
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Primary colour">
                  <Input value={brandingDraft.primaryColour ?? ""} onChange={(event) => setBrandingDraft({ ...brandingDraft, primaryColour: nullable(event.target.value) })} />
                </Field>
                <Field label="Secondary colour">
                  <Input value={brandingDraft.secondaryColour ?? ""} onChange={(event) => setBrandingDraft({ ...brandingDraft, secondaryColour: nullable(event.target.value) })} />
                </Field>
                <Field label="Accent colour">
                  <Input value={brandingDraft.accentColour ?? ""} onChange={(event) => setBrandingDraft({ ...brandingDraft, accentColour: nullable(event.target.value) })} />
                </Field>
                <Field label="Background colour">
                  <Input value={brandingDraft.backgroundColour ?? ""} onChange={(event) => setBrandingDraft({ ...brandingDraft, backgroundColour: nullable(event.target.value) })} />
                </Field>
                <Field label="Text colour">
                  <Input value={brandingDraft.textColour ?? ""} onChange={(event) => setBrandingDraft({ ...brandingDraft, textColour: nullable(event.target.value) })} />
                </Field>
                <Field label="Muted text colour">
                  <Input value={brandingDraft.mutedTextColour ?? ""} onChange={(event) => setBrandingDraft({ ...brandingDraft, mutedTextColour: nullable(event.target.value) })} />
                </Field>
              </div>

              <SectionGroup heading="Typography & style" />
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Heading font">
                  <Select value={brandingDraft.headingFont ?? ""} onChange={(event) => setBrandingDraft({ ...brandingDraft, headingFont: nullable(event.target.value) })}>
                    <option value="">Choose heading font</option>
                    {fontOptions.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Body font">
                  <Select value={brandingDraft.bodyFont ?? ""} onChange={(event) => setBrandingDraft({ ...brandingDraft, bodyFont: nullable(event.target.value) })}>
                    <option value="">Choose body font</option>
                    {fontOptions.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Button style">
                  <Select value={brandingDraft.buttonStyle ?? ""} onChange={(event) => setBrandingDraft({ ...brandingDraft, buttonStyle: nullable(event.target.value) as BrandingSettings["buttonStyle"] })}>
                    <option value="">Choose button style</option>
                    <option value="rounded">Rounded</option>
                    <option value="soft">Slightly rounded</option>
                    <option value="square">Square</option>
                  </Select>
                </Field>
                <Field label="Corner radius scale">
                  <Select value={brandingDraft.cornerRadius ?? ""} onChange={(event) => setBrandingDraft({ ...brandingDraft, cornerRadius: nullable(event.target.value) as BrandingSettings["cornerRadius"] })}>
                    <option value="">Choose radius scale</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </Select>
                </Field>
                <Field label="Section spacing scale">
                  <Select value={brandingDraft.spacingScale ?? ""} onChange={(event) => setBrandingDraft({ ...brandingDraft, spacingScale: nullable(event.target.value) as BrandingSettings["spacingScale"] })}>
                    <option value="">Choose spacing scale</option>
                    <option value="compact">Compact</option>
                    <option value="comfortable">Comfortable</option>
                    <option value="spacious">Spacious</option>
                  </Select>
                </Field>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveBranding} disabled={updateBrandingMutation.isPending}>
                  {updateBrandingMutation.isPending ? "Saving..." : "Save branding"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="marketing" className="scroll-mt-24">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Marketing</CardTitle>
              <CardDescription>Defaults used when creating campaigns and filling email or SMS content.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Default sign-off name">
                  <Input value={marketingDraft.defaultSignOffName ?? ""} onChange={(event) => setMarketingDraft({ ...marketingDraft, defaultSignOffName: nullable(event.target.value) })} />
                </Field>
                <Field label="Default property for campaign creation">
                  <Select value={marketingDraft.defaultPropertyId ?? ""} onChange={(event) => setMarketingDraft({ ...marketingDraft, defaultPropertyId: nullable(event.target.value) })}>
                    <option value="">No default property</option>
                    {settingsQuery.data.properties
                      .filter((property) => property.status === "ACTIVE")
                      .map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.name}
                        </option>
                      ))}
                  </Select>
                </Field>
                <Field label="Default email theme source">
                  <Select value={marketingDraft.defaultThemeSource ?? ""} onChange={(event) => setMarketingDraft({ ...marketingDraft, defaultThemeSource: nullable(event.target.value) as MarketingSettings["defaultThemeSource"] })}>
                    <option value="">Choose theme source</option>
                    <option value="company">Company default</option>
                    <option value="property">Property default</option>
                  </Select>
                </Field>
                <Field label="Default SMS sign-off">
                  <Input value={marketingDraft.defaultSmsSignOff ?? ""} onChange={(event) => setMarketingDraft({ ...marketingDraft, defaultSmsSignOff: nullable(event.target.value) })} />
                </Field>
              </div>
              <Field label="Default footer text">
                <Textarea
                  rows={4}
                  value={marketingDraft.defaultFooterText ?? ""}
                  onChange={(event) => setMarketingDraft({ ...marketingDraft, defaultFooterText: nullable(event.target.value) })}
                />
              </Field>
              <div className="flex justify-end">
                <Button onClick={saveMarketing} disabled={updateMarketingMutation.isPending}>
                  {updateMarketingMutation.isPending ? "Saving..." : "Save marketing"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="sending" className="scroll-mt-24">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Sending</CardTitle>
              <CardDescription>Sending identity and message delivery defaults across email and SMS.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Sender display name">
                  <Input value={sendingDraft.emailSenderName ?? ""} onChange={(event) => setSendingDraft({ ...sendingDraft, emailSenderName: nullable(event.target.value) })} />
                </Field>
                <Field label="Sender email address">
                  <Input type="email" value={sendingDraft.emailSenderAddress ?? ""} onChange={(event) => setSendingDraft({ ...sendingDraft, emailSenderAddress: nullable(event.target.value) })} />
                </Field>
                <Field label="Reply-to email address">
                  <Input type="email" value={sendingDraft.replyToEmail ?? ""} onChange={(event) => setSendingDraft({ ...sendingDraft, replyToEmail: nullable(event.target.value) })} />
                </Field>
                <Field label="SMS sender ID">
                  <Input value={sendingDraft.smsSenderId ?? ""} onChange={(event) => setSendingDraft({ ...sendingDraft, smsSenderId: nullable(event.target.value) })} />
                </Field>
              </div>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <Checkbox checked={sendingDraft.smsEnabled} onChange={(event) => setSendingDraft({ ...sendingDraft, smsEnabled: event.target.checked })} />
                SMS enabled for this account
              </label>
              <div className="flex justify-end">
                <Button onClick={saveSending} disabled={updateSendingMutation.isPending}>
                  {updateSendingMutation.isPending ? "Saving..." : "Save sending"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function SectionGroup({ heading, description }: { heading: string; description?: string }) {
  return (
    <div className="grid gap-1">
      <h3 className="text-sm font-semibold text-slate-900">{heading}</h3>
      {description ? <p className="text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}

function AddressFields({
  value,
  onChange,
}: {
  value: Address;
  onChange: (value: Address) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Address line 1">
        <Input value={value.addressLine1 ?? ""} onChange={(event) => onChange({ ...value, addressLine1: nullable(event.target.value) })} />
      </Field>
      <Field label="Address line 2">
        <Input value={value.addressLine2 ?? ""} onChange={(event) => onChange({ ...value, addressLine2: nullable(event.target.value) })} />
      </Field>
      <Field label="Town / city">
        <Input value={value.city ?? ""} onChange={(event) => onChange({ ...value, city: nullable(event.target.value) })} />
      </Field>
      <Field label="County / region">
        <Input value={value.region ?? ""} onChange={(event) => onChange({ ...value, region: nullable(event.target.value) })} />
      </Field>
      <Field label="Postcode">
        <Input value={value.postcode ?? ""} onChange={(event) => onChange({ ...value, postcode: nullable(event.target.value) })} />
      </Field>
      <Field label="Country">
        <Input value={value.country ?? ""} onChange={(event) => onChange({ ...value, country: nullable(event.target.value) })} />
      </Field>
    </div>
  );
}

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
