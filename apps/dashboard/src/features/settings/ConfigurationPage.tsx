"use client";

import { useEffect, useState } from "react";
import type {
  BrandingSettings,
  CompanySettings,
  MessageBrandingSettings,
} from "@repo/api-contracts";
import { Facebook, Globe, Info, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddressPicker } from "@/components/forms/AddressPicker";
import { PhoneNumberInput, formatPhoneNumber, parsePhoneNumber, type PhoneCountryCode } from "@/components/forms/PhoneNumberInput";
import { ColourInput } from "@/components/ui/colour-input";
import { FontDropdown } from "@/components/forms/FontDropdown";
import { SaveStatusActions } from "@/components/forms/SaveStatusActions";
import { UnsavedChangesDialog } from "@/components/forms/UnsavedChangesDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { TabbedPage } from "@/components/layout/TabbedPage";
import { usePageTab } from "@/hooks/usePageTab";
import { CONFIGURATION_TABS, CONFIGURATION_DEFAULT_TAB, type ConfigurationTab } from "@/lib/pageTabConfigs";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { DEFAULT_BRAND_FONT, getBrandFontByFontFamily, getBrandFontById } from "@/lib/brandFonts";
import { toast } from "@/components/ui/sonner";
import {
  useSettings,
  useUpdateBrandingSettings,
  useUpdateCompanySettings,
  useUpdateMessageBrandingSettings,
} from "@/features/settings/hooks";

export function ConfigurationPage() {
  const settingsQuery = useSettings();
  const updateCompanyMutation = useUpdateCompanySettings();
  const updateBrandingMutation = useUpdateBrandingSettings();
  const updateMessageBrandingMutation = useUpdateMessageBrandingSettings();

  const [activeTab, setTab] = usePageTab<ConfigurationTab>(CONFIGURATION_TABS, CONFIGURATION_DEFAULT_TAB);
  const [companyDraft, setCompanyDraft] = useState<CompanySettings | null>(null);
  const [brandingDraft, setBrandingDraft] = useState<BrandingSettings | null>(null);
  const [messageBrandingDraft, setMessageBrandingDraft] = useState<MessageBrandingSettings | null>(null);
  const [savedCompanySnapshot, setSavedCompanySnapshot] = useState<string | null>(null);
  const [savedBrandingSnapshot, setSavedBrandingSnapshot] = useState<string | null>(null);
  const [savedMessageBrandingSnapshot, setSavedMessageBrandingSnapshot] = useState<string | null>(null);
  const [showBrandingErrors, setShowBrandingErrors] = useState(false);
  const [contactPhoneCountry, setContactPhoneCountry] = useState<PhoneCountryCode>("GB");
  const [campaignSignOffsDialogOpen, setCampaignSignOffsDialogOpen] = useState(false);

  const draftsReady = Boolean(settingsQuery.data && companyDraft && brandingDraft && messageBrandingDraft);
  const companySnapshot = draftsReady ? createSnapshot(companyDraft) : null;
  const brandingSnapshot = draftsReady ? createSnapshot(brandingDraft) : null;
  const messageBrandingSnapshot = draftsReady ? createSnapshot(messageBrandingDraft) : null;
  const hasUnsavedCompany = draftsReady && companySnapshot !== savedCompanySnapshot;
  const hasUnsavedBranding = draftsReady && brandingSnapshot !== savedBrandingSnapshot;
  const hasUnsavedMessageBranding = draftsReady && messageBrandingSnapshot !== savedMessageBrandingSnapshot;
  const hasUnsavedChanges = hasUnsavedCompany || hasUnsavedBranding || hasUnsavedMessageBranding;
  const unsavedChangesGuard = useUnsavedChangesGuard(hasUnsavedChanges);

  useEffect(() => {
    if (!settingsQuery.data) return;
    setCompanyDraft(settingsQuery.data.company);
    setBrandingDraft(settingsQuery.data.branding);
    setMessageBrandingDraft(settingsQuery.data.messageBranding);
    setContactPhoneCountry(parsePhoneNumber(settingsQuery.data.company.contactPhone).countryCode);
    setSavedCompanySnapshot(createSnapshot(settingsQuery.data.company));
    setSavedBrandingSnapshot(createSnapshot(settingsQuery.data.branding));
    setSavedMessageBrandingSnapshot(createSnapshot(settingsQuery.data.messageBranding));
  }, [settingsQuery.data]);

  if (settingsQuery.isLoading) return <LoadingState rows={5} />;

  if (settingsQuery.isError) {
    return (
      <ErrorState
        title="Settings unavailable"
        description={settingsQuery.error.message}
        onRetry={() => settingsQuery.refetch()}
      />
    );
  }

  if (!settingsQuery.data || !companyDraft || !brandingDraft || !messageBrandingDraft) {
    return <LoadingState rows={4} />;
  }

  const companyFieldPermissions = settingsQuery.data.companyFieldPermissions;
  const selectedPrimaryFont =
    getBrandFontById(brandingDraft.primaryFontId) ??
    getBrandFontByFontFamily(brandingDraft.headingFont) ??
    DEFAULT_BRAND_FONT;
  const selectedSecondaryFont =
    getBrandFontById(brandingDraft.secondaryFontId) ??
    getBrandFontByFontFamily(brandingDraft.bodyFont) ??
    DEFAULT_BRAND_FONT;
  const brandingValidationErrors = getBrandingValidationErrors(brandingDraft);
  const hasBrandingValidationErrors = Object.values(brandingValidationErrors).some(Boolean);
  const logoAltBase = brandingDraft.brandName ?? companyDraft.legalName ?? companyDraft.companyName ?? "Brand";
  const primaryPropertyName = getPrimaryPropertyName(settingsQuery.data.properties);
  const displayBusinessName =
    companyDraft.legalName?.trim() ||
    brandingDraft.brandName?.trim() ||
    companyDraft.companyName ||
    "Your business";
  const displayBusinessAddress = getBusinessAddress(companyDraft);
  const campaignSignOffWarnings = getCampaignSignOffWarnings(companyDraft, brandingDraft);
  const hasContactEmail = Boolean(companyDraft.contactEmail);
  const availableSocialIcons = [
    companyDraft.socialLinks.facebook ? "facebook" : null,
    companyDraft.socialLinks.instagram ? "instagram" : null,
    companyDraft.socialLinks.x ? "x" : null,
    companyDraft.socialLinks.website ? "website" : null,
  ].filter(Boolean) as Array<"facebook" | "instagram" | "x" | "website">;
  const hasSocialLinks = Boolean(
    companyDraft.socialLinks.website ||
    companyDraft.socialLinks.instagram ||
    companyDraft.socialLinks.facebook ||
    companyDraft.socialLinks.x,
  );

  const updateBrandingDraft = (nextBrandingDraft: BrandingSettings) => {
    setBrandingDraft(nextBrandingDraft);

    if (!Object.values(getBrandingValidationErrors(nextBrandingDraft)).some(Boolean)) {
      setShowBrandingErrors(false);
    }
  };

  const saveCompany = async () => {
    await updateCompanyMutation.mutateAsync(companyDraft);
    setSavedCompanySnapshot(createSnapshot(companyDraft));
    toast.success("Company information saved");
  };

  const saveBranding = async () => {
    if (hasBrandingValidationErrors) {
      setShowBrandingErrors(true);
      toast.error("Complete the required branding fields");
      return;
    }

    const nextBranding = {
      ...brandingDraft,
      brandName: brandingDraft.brandName?.trim() ?? null,
      primaryFontId: selectedPrimaryFont.id,
      secondaryFontId: selectedSecondaryFont.id,
      headingFont: selectedPrimaryFont.fontFamily,
      bodyFont: selectedSecondaryFont.fontFamily,
    };

    await updateBrandingMutation.mutateAsync(nextBranding);
    setBrandingDraft(nextBranding);
    setSavedBrandingSnapshot(createSnapshot(nextBranding));
    setShowBrandingErrors(false);
    toast.success("Branding saved");
  };

  const saveMessageBranding = async () => {
    await updateMessageBrandingMutation.mutateAsync(messageBrandingDraft);
    setSavedMessageBrandingSnapshot(createSnapshot(messageBrandingDraft));
    toast.success("Campaign sign offs saved");
  };

  return (
    <TabbedPage
      title="Settings"
      tabs={CONFIGURATION_TABS}
      activeTab={activeTab}
      onTabChange={setTab}
    >

      {activeTab === "business_info" ? (
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="grid gap-1">
                <CardTitle>Company and legal info</CardTitle>
                <CardDescription>Legal entity details and contact information used across your account.</CardDescription>
              </div>
              <SaveStatusActions
                hasUnsavedChanges={hasUnsavedCompany}
                isSaving={updateCompanyMutation.isPending}
                onSave={saveCompany}
              />
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2 md:items-start">
              <Field label="Legal name">
                <Input
                  value={companyDraft.legalName ?? ""}
                  onChange={(e) => setCompanyDraft({ ...companyDraft, legalName: nullable(e.target.value) })}
                />
              </Field>
              <Field label="Contact email">
                <Input
                  type="email"
                  value={companyDraft.contactEmail ?? ""}
                  disabled={!companyFieldPermissions.canEditContactEmail}
                  onChange={(e) => setCompanyDraft({ ...companyDraft, contactEmail: nullable(e.target.value) })}
                />
              </Field>
              <PhoneNumberInput
                label="Contact phone"
                countryCode={contactPhoneCountry}
                value={parsePhoneNumber(companyDraft.contactPhone).localNumber}
                onCountryChange={(countryCode) => {
                  const localNumber = parsePhoneNumber(companyDraft.contactPhone).localNumber;
                  setContactPhoneCountry(countryCode);
                  setCompanyDraft({
                    ...companyDraft,
                    contactPhone: formatPhoneNumber(countryCode, localNumber),
                  });
                }}
                onChange={(value) =>
                  setCompanyDraft({
                    ...companyDraft,
                    contactPhone: formatPhoneNumber(contactPhoneCountry, value),
                  })
                }
              />
            </div>

            <SectionGroup heading="Business address" />
            <AddressPicker
              value={companyDraft.address}
              onChange={(address) => setCompanyDraft({ ...companyDraft, address })}
              withPreview={false}
            />
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "branding" ? (
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="grid gap-1">
                <CardTitle>Branding</CardTitle>
                <CardDescription>Logo, colours, and typography used across branded surfaces.</CardDescription>
              </div>
              <SaveStatusActions
                hasUnsavedChanges={hasUnsavedBranding}
                isSaving={updateBrandingMutation.isPending}
                onSave={saveBranding}
              />
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <Field label="Brand name">
              <Input
                value={brandingDraft.brandName ?? ""}
                onChange={(e) => updateBrandingDraft({ ...brandingDraft, brandName: nullable(e.target.value) })}
                aria-invalid={showBrandingErrors && brandingValidationErrors.brandName ? true : undefined}
                className={showBrandingErrors && brandingValidationErrors.brandName ? "border-destructive focus-visible:ring-destructive" : undefined}
              />
              {showBrandingErrors && brandingValidationErrors.brandName ? (
                <span className="text-sm text-destructive">{brandingValidationErrors.brandName}</span>
              ) : null}
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Website">
                <Input
                  value={companyDraft.socialLinks.website ?? ""}
                  disabled={!companyFieldPermissions.canEditWebsiteUrl}
                  onChange={(e) =>
                    setCompanyDraft({
                      ...companyDraft,
                      socialLinks: { ...companyDraft.socialLinks, website: nullable(e.target.value) },
                    })
                  }
                />
              </Field>
              <Field label="Facebook">
                <Input
                  value={companyDraft.socialLinks.facebook ?? ""}
                  onChange={(e) =>
                    setCompanyDraft({
                      ...companyDraft,
                      socialLinks: { ...companyDraft.socialLinks, facebook: nullable(e.target.value) },
                    })
                  }
                />
              </Field>
              <Field label="Instagram">
                <Input
                  value={companyDraft.socialLinks.instagram ?? ""}
                  onChange={(e) =>
                    setCompanyDraft({
                      ...companyDraft,
                      socialLinks: { ...companyDraft.socialLinks, instagram: nullable(e.target.value) },
                    })
                  }
                />
              </Field>
              <Field label="X">
                <Input
                  value={companyDraft.socialLinks.x ?? ""}
                  onChange={(e) =>
                    setCompanyDraft({
                      ...companyDraft,
                      socialLinks: { ...companyDraft.socialLinks, x: nullable(e.target.value) },
                    })
                  }
                />
              </Field>
            </div>

            <SectionGroup heading="Logo" />
            <div className="max-w-[220px]">
              <ImageUploadField
                label="Logo"
                showLabel={false}
                value={brandingDraft.logoUrl ?? ""}
                alt={`${logoAltBase} logo`}
                onChange={(value) => updateBrandingDraft({ ...brandingDraft, logoUrl: value })}
                onRemove={() => updateBrandingDraft({ ...brandingDraft, logoUrl: null })}
                emptyLabel="No logo uploaded"
                previewClassName="h-40 w-full object-contain bg-white p-4"
              />
            </div>

            <SectionGroup heading="Typography" />
            <div className="grid gap-4 md:grid-cols-2 md:items-start">
              <FontDropdown
                label="Primary font"
                value={selectedPrimaryFont.id}
                error={showBrandingErrors ? brandingValidationErrors.primaryFont : undefined}
                onChange={(fontId) => {
                  const nextFont = getBrandFontById(fontId) ?? DEFAULT_BRAND_FONT;
                  updateBrandingDraft({
                    ...brandingDraft,
                    primaryFontId: nextFont.id,
                    headingFont: nextFont.fontFamily,
                  });
                }}
              />
              <FontDropdown
                label="Secondary font"
                value={selectedSecondaryFont.id}
                error={showBrandingErrors ? brandingValidationErrors.secondaryFont : undefined}
                onChange={(fontId) => {
                  const nextFont = getBrandFontById(fontId) ?? DEFAULT_BRAND_FONT;
                  updateBrandingDraft({
                    ...brandingDraft,
                    secondaryFontId: nextFont.id,
                    bodyFont: nextFont.fontFamily,
                  });
                }}
              />
              <div className="rounded-md border border-slate-200 bg-slate-50 p-5 text-slate-700 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
                <div className="mt-4 grid gap-4">
                  <h1 className="text-4xl leading-tight text-slate-900" style={{ fontFamily: selectedPrimaryFont.fontFamily }}>
                    Your main brand heading
                  </h1>
                  <h3 className="text-2xl leading-snug text-slate-900" style={{ fontFamily: selectedPrimaryFont.fontFamily }}>
                    Supporting heading style
                  </h3>
                  <p className="text-sm leading-6 text-slate-700" style={{ fontFamily: selectedSecondaryFont.fontFamily }}>
                    This is how your main body copy will appear across branded surfaces, using the selected secondary font and its fallback stack for longer-form readable text.
                  </p>
                </div>
              </div>
            </div>

            <SectionGroup heading="Colours" />
            <div className="grid gap-4 md:grid-cols-3">
              <ColourInput
                label="Primary colour"
                value={brandingDraft.primaryColour ?? undefined}
                allowNone
                error={showBrandingErrors ? brandingValidationErrors.primaryColour : undefined}
                onChange={(value) => updateBrandingDraft({ ...brandingDraft, primaryColour: value ?? null })}
              />
              <ColourInput
                label="Secondary colour"
                value={brandingDraft.secondaryColour ?? undefined}
                allowNone
                error={showBrandingErrors ? brandingValidationErrors.secondaryColour : undefined}
                onChange={(value) => updateBrandingDraft({ ...brandingDraft, secondaryColour: value ?? null })}
              />
              <ColourInput
                label="Accent colour"
                value={brandingDraft.accentColour ?? undefined}
                allowNone
                error={showBrandingErrors ? brandingValidationErrors.accentColour : undefined}
                onChange={(value) => updateBrandingDraft({ ...brandingDraft, accentColour: value ?? null })}
              />
              <ColourInput
                label="Background colour"
                value={brandingDraft.backgroundColour ?? undefined}
                allowNone
                error={showBrandingErrors ? brandingValidationErrors.backgroundColour : undefined}
                onChange={(value) => updateBrandingDraft({ ...brandingDraft, backgroundColour: value ?? null })}
              />
              <ColourInput
                label="Text colour"
                value={brandingDraft.textColour ?? undefined}
                allowNone
                error={showBrandingErrors ? brandingValidationErrors.textColour : undefined}
                onChange={(value) => updateBrandingDraft({ ...brandingDraft, textColour: value ?? null })}
              />
              <ColourInput
                label="Muted text colour"
                value={brandingDraft.mutedTextColour ?? undefined}
                allowNone
                error={showBrandingErrors ? brandingValidationErrors.mutedTextColour : undefined}
                onChange={(value) => updateBrandingDraft({ ...brandingDraft, mutedTextColour: value ?? null })}
              />
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 md:col-span-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
                <div className="mt-4 flex max-w-md gap-0 overflow-hidden rounded-md border border-slate-200">
                  {[
                    brandingDraft.primaryColour,
                    brandingDraft.secondaryColour,
                    brandingDraft.accentColour,
                    brandingDraft.backgroundColour,
                    brandingDraft.textColour,
                    brandingDraft.mutedTextColour,
                  ].map((colour, index) => (
                    <div
                      key={index}
                      className="h-28 flex-1"
                      style={{
                        backgroundColor: colour ?? "transparent",
                        backgroundImage: colour
                          ? undefined
                          : "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
                        backgroundSize: colour ? undefined : "16px 16px",
                        backgroundPosition: colour ? undefined : "0 0, 0 8px, 8px -8px, -8px 0px",
                      }}
                      aria-label={colour ? `Colour preview ${colour}` : "No colour preview"}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "campaign_sign_off" ? (
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <CardTitle>Campaign sign offs</CardTitle>
                  <CardDescription>Control how your brand appears across email and SMS communications.</CardDescription>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  We automatically include required sender details and opt-out options to help keep your messages compliant.
                  <Button type="button" variant="link" className="ml-1 h-auto p-0" onClick={() => setCampaignSignOffsDialogOpen(true)}>
                    Learn more
                  </Button>
                </div>
              </div>
              <SaveStatusActions
                hasUnsavedChanges={hasUnsavedMessageBranding}
                isSaving={updateMessageBrandingMutation.isPending}
                onSave={saveMessageBranding}
              />
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="grid gap-4">
                <SectionGroup
                  heading="Email Footer & Branding"
                  description="Choose which branding elements appear in your email footer. Compliance-critical elements are included automatically."
                />
                {campaignSignOffWarnings.length > 0 ? (
                  <div className="grid gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    {campaignSignOffWarnings.map((warning) => (
                      <div key={warning} className="flex items-start gap-2">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  <Checkbox
                    checked={messageBrandingDraft.email.includeLogo}
                    onChange={(e) =>
                      setMessageBrandingDraft({
                        ...messageBrandingDraft,
                        email: { ...messageBrandingDraft.email, includeLogo: e.target.checked },
                      })
                    }
                  />
                  Include logo
                </label>
                <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  <Checkbox
                    checked={hasSocialLinks && messageBrandingDraft.email.showSocialLinks}
                    disabled={!hasSocialLinks}
                    onChange={(e) =>
                      setMessageBrandingDraft({
                        ...messageBrandingDraft,
                        email: { ...messageBrandingDraft.email, showSocialLinks: e.target.checked },
                      })
                    }
                  />
                  Show social links
                </label>
                <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  <Checkbox
                    checked={hasContactEmail && messageBrandingDraft.email.showContactEmail}
                    disabled={!hasContactEmail}
                    onChange={(e) =>
                      setMessageBrandingDraft({
                        ...messageBrandingDraft,
                        email: { ...messageBrandingDraft.email, showContactEmail: e.target.checked },
                      })
                    }
                  />
                  Show contact email
                </label>
                <Field label="Custom footer message">
                  <Textarea
                    rows={4}
                    value={messageBrandingDraft.email.customFooterMessage ?? ""}
                    onChange={(e) =>
                      setMessageBrandingDraft({
                        ...messageBrandingDraft,
                        email: { ...messageBrandingDraft.email, customFooterMessage: nullable(e.target.value) },
                      })
                    }
                  />
                  <span className="text-sm text-slate-500">Shown above the system-managed footer.</span>
                </Field>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:max-w-[420px]">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
                <div className="mt-4 grid gap-4 text-center text-sm text-slate-700">
                  {messageBrandingDraft.email.includeLogo && brandingDraft.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brandingDraft.logoUrl} alt={`${displayBusinessName} logo`} className="mx-auto h-12 w-auto object-contain" />
                  ) : null}
                  {messageBrandingDraft.email.customFooterMessage ? (
                    <p>{messageBrandingDraft.email.customFooterMessage}</p>
                  ) : null}
                  <div className="grid gap-3 border-t border-slate-200 pt-4">
                    <p>You're receiving this email because you previously stayed with {brandingDraft.brandName ?? "your brand"} or requested updates.</p>
                    <div className="grid gap-1 text-slate-900">
                      <p>{displayBusinessName}</p>
                      <p>{displayBusinessAddress}</p>
                    </div>
                    {messageBrandingDraft.email.showContactEmail && hasContactEmail ? (
                      <p>Questions? Contact us at {companyDraft.contactEmail}</p>
                    ) : null}
                  </div>
                  {messageBrandingDraft.email.showSocialLinks && hasSocialLinks ? (
                    <div className="flex items-center justify-center gap-3 text-slate-500">
                      {availableSocialIcons.map((icon) => {
                        if (icon === "facebook") return <Facebook key={icon} className="h-4 w-4" />;
                        if (icon === "instagram") return <Instagram key={icon} className="h-4 w-4" />;
                        if (icon === "website") return <Globe key={icon} className="h-4 w-4" />;
                        return (
                          <span key={icon} className="text-xs font-semibold leading-none">
                            X
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                  <Button type="button" variant="link" className="mx-auto h-auto p-0 text-sm">
                    unsubscribe
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="grid gap-4">
                <SectionGroup
                  heading="SMS Sign-off"
                  description="Control how your brand appears in marketing text messages. Opt-out instructions are added automatically."
                />
                <Field label="Sender name">
                  <Input
                    value={messageBrandingDraft.sms.smsSenderName ?? ""}
                    onChange={(e) =>
                      setMessageBrandingDraft({
                        ...messageBrandingDraft,
                        sms: { ...messageBrandingDraft.sms, smsSenderName: nullable(e.target.value) },
                      })
                    }
                  />
                </Field>
                <Field label="SMS sign-off">
                  <Input
                    value={messageBrandingDraft.sms.smsSignoff ?? ""}
                    onChange={(e) =>
                      setMessageBrandingDraft({
                        ...messageBrandingDraft,
                        sms: { ...messageBrandingDraft.sms, smsSignoff: nullable(e.target.value) },
                      })
                    }
                  />
                  <span className="text-sm text-slate-500">Reply STOP handling is managed automatically.</span>
                </Field>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-900 p-3 shadow-sm md:max-w-[360px]">
                <div className="rounded-[20px] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
                  <div className="mt-4 grid gap-3">
                    <div className="max-w-[280px] rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-800">
                      <p>Last-minute availability this weekend at {primaryPropertyName}. Book direct: yoursite.com</p>
                      {messageBrandingDraft.sms.smsSignoff ? <p className="mt-3">{messageBrandingDraft.sms.smsSignoff}</p> : null}
                      <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-500">
                        <p className="font-semibold uppercase tracking-wide text-slate-500">System-managed opt-out</p>
                        <p className="mt-1">Reply STOP to opt out.</p>
                      </div>
                    </div>
                    {messageBrandingDraft.sms.smsSenderName ? (
                      <p className="text-xs text-slate-500">Sender ID preview: {messageBrandingDraft.sms.smsSenderName}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={campaignSignOffsDialogOpen} onOpenChange={setCampaignSignOffsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Keeping your messages compliant</DialogTitle>
            <DialogDescription>
              We automatically include important sender and opt-out information in your email and SMS marketing to help you meet regulations such as UK GDPR and PECR.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="grid gap-4 text-sm text-slate-700">
            <p>This includes things like sender identification, unsubscribe links, and SMS STOP handling where required.</p>
            <p>These elements are system-managed to protect deliverability and reduce complaints.</p>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        open={unsavedChangesGuard.dialogOpen}
        onOpenChange={unsavedChangesGuard.setDialogOpen}
        onConfirm={unsavedChangesGuard.confirmNavigation}
      />
    </TabbedPage>
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

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function getPrimaryPropertyName(properties: Array<{ name: string; status: string }>) {
  return properties.find((property) => property.status === "ACTIVE")?.name ?? properties[0]?.name ?? "your property";
}

function getBusinessAddress(company: CompanySettings) {
  const parts = [
    company.address.addressLine1,
    company.address.addressLine2,
    company.address.city,
    company.address.region,
    company.address.postcode,
    company.address.country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Business address not set";
}

function getCampaignSignOffWarnings(company: CompanySettings, branding: BrandingSettings) {
  const warnings: string[] = [];
  const businessName = company.legalName ?? branding.brandName ?? company.companyName ?? null;
  const businessAddress = getBusinessAddress(company);

  if (!nullable(businessName ?? "")) {
    warnings.push("Add your business name to complete your email footer");
  }

  if (businessAddress === "Business address not set") {
    warnings.push("Add your business address to support marketing compliance");
  }

  if (!company.contactEmail) {
    warnings.push("Add a contact email to display recipient support details");
  }

  return warnings;
}

function getBrandingValidationErrors(branding: BrandingSettings) {
  return {
    brandName: !nullable(branding.brandName ?? "") ? "Brand name is required" : undefined,
    primaryFont: !branding.primaryFontId && !branding.headingFont ? "Primary font is required" : undefined,
    secondaryFont: !branding.secondaryFontId && !branding.bodyFont ? "Secondary font is required" : undefined,
    primaryColour: !branding.primaryColour ? "Primary colour is required" : undefined,
    secondaryColour: !branding.secondaryColour ? "Secondary colour is required" : undefined,
    accentColour: !branding.accentColour ? "Accent colour is required" : undefined,
    backgroundColour: !branding.backgroundColour ? "Background colour is required" : undefined,
    textColour: !branding.textColour ? "Text colour is required" : undefined,
    mutedTextColour: !branding.mutedTextColour ? "Muted text colour is required" : undefined,
  };
}

function createSnapshot(value: unknown) {
  return JSON.stringify(value);
}
