"use client";

import type { DraftCampaignSummary, TemplateSummary } from "@repo/api-contracts";
import { ChevronRightIcon, Mail, MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { DraftsList } from "@/features/campaigns/DraftsList";
import { filterTemplatesForPropertyCount, getGoalLabel, groupTemplatesByGoal } from "@/features/campaigns/campaignStarters";
import type { useTemplates } from "@/features/marketing/hooks";

export type TemplateLibraryChannelTab = "ALL" | TemplateSummary["channel"];

export function CreateCampaignDialog({
  open,
  step,
  selectedChannel,
  propertyCount,
  templatesQuery,
  draftCampaigns,
  onOpenChange,
  onViewAllDrafts,
  onBack,
  onSelectChannel,
  onSelectTemplate,
}: {
  open: boolean;
  step: "channel" | "template";
  selectedChannel: TemplateLibraryChannelTab | null;
  propertyCount: number;
  templatesQuery: ReturnType<typeof useTemplates>;
  draftCampaigns: DraftCampaignSummary[];
  onOpenChange: (open: boolean) => void;
  onViewAllDrafts: () => void;
  onBack: () => void;
  onSelectChannel: (channel: TemplateLibraryChannelTab) => void;
  onSelectTemplate: (template: TemplateSummary) => void;
}) {
  const visibleTemplates = selectedChannel
    ? filterTemplatesForPropertyCount(
        (templatesQuery.data?.items ?? []).filter((template) => template.channel === selectedChannel),
        propertyCount,
      )
    : [];
  const groupedTemplates = groupTemplatesByGoal(visibleTemplates).filter((group) => group.templates.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create campaign</DialogTitle>
        </DialogHeader>
        <DialogBody className="grid gap-6">
          {step === "channel" ? (
            <>
              <p className="text-sm text-muted-foreground">
                Choose the channel first. You will pick a ready-made campaign starter in the next step.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  className="grid gap-3 rounded-xl border border-slate-200 p-5 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  onClick={() => onSelectChannel("EMAIL")}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="grid gap-1">
                    <p className="text-base font-semibold text-slate-900">Email</p>
                    <p className="text-sm text-muted-foreground">
                      Branded campaigns, property storytelling, and richer promotional layouts.
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  className="grid gap-3 rounded-xl border border-slate-200 p-5 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  onClick={() => onSelectChannel("SMS")}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                    <MessageSquareText className="h-4 w-4" />
                  </div>
                  <div className="grid gap-1">
                    <p className="text-base font-semibold text-slate-900">SMS</p>
                    <p className="text-sm text-muted-foreground">
                      Short-notice offers, reminders, and direct text-only promotions.
                    </p>
                  </div>
                </button>
              </div>
              {draftCampaigns.length > 0 ? (
                <div className="grid gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Continue a draft instead</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Resume one of your in-progress campaigns.</p>
                  </div>
                  <DraftsList drafts={draftCampaigns} limit={1} onNavigate={() => onOpenChange(false)} />
                  {draftCampaigns.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground"
                      onClick={() => {
                        onOpenChange(false);
                        onViewAllDrafts();
                      }}
                    >
                      See all {draftCampaigns.length} drafts
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="grid gap-1">
                  <p className="text-sm font-medium text-slate-900">Step 2 of 2</p>
                  <p className="text-sm text-muted-foreground">
                    Pick a {selectedChannel === "EMAIL" ? "email" : "SMS"} starter. Compatible templates are filtered automatically.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={onBack}>
                  Back
                </Button>
              </div>
              {templatesQuery.isLoading ? <LoadingState rows={4} /> : null}
              {templatesQuery.isError ? (
                <ErrorState
                  title="Campaign starters unavailable"
                  description={templatesQuery.error.message}
                  onRetry={() => templatesQuery.refetch()}
                />
              ) : null}
              {!templatesQuery.isLoading && !templatesQuery.isError ? (
                groupedTemplates.length > 0 ? (
                  <div className="grid gap-6">
                    {groupedTemplates.map((group) => (
                      <section key={group.goal} className="grid gap-3">
                        <div className="grid gap-1">
                          <h3 className="text-base font-semibold text-slate-900">{getGoalLabel(group.goal)}</h3>
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                        </div>
                        <div className="grid gap-4 xl:grid-cols-2">
                          {group.templates.map((template) => (
                            <Card key={template.id} className="border-slate-200">
                              <CardHeader>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="grid gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge variant="outline">{template.channel === "EMAIL" ? "Email" : "SMS"}</Badge>
                                    </div>
                                    <CardTitle className="text-lg">{template.name}</CardTitle>
                                    <CardDescription>{template.description}</CardDescription>
                                  </div>
                                  <Button type="button" size="sm" onClick={() => onSelectTemplate(template)}>
                                    Open editor
                                    <ChevronRightIcon className="ml-2 h-4 w-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                {template.channel === "EMAIL" ? (
                                  <EmailTemplatePreview template={template} />
                                ) : (
                                  <SmsTemplatePreview template={template} />
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title={`No ${selectedChannel === "EMAIL" ? "email" : "SMS"} starters available`}
                    description="Add more active properties or switch channel to see more compatible starters."
                  />
                )
              ) : null}
            </>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

function EmailTemplatePreview({ template }: { template: TemplateSummary }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50">
      <div className="p-3">
        <div
          className="w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm [&_*]:max-w-full [&_a]:pointer-events-none [&_img]:h-auto [&_img]:max-w-full [&_table]:!w-full [&_table]:max-w-full [&_td]:max-w-full"
          dangerouslySetInnerHTML={{ __html: extractEmailBody(template.contentHtml) }}
        />
      </div>
    </div>
  );
}

function SmsTemplatePreview({ template }: { template: TemplateSummary }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="grid gap-3 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Messages</span>
          <span>Now</span>
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-900">
          {template.contentText}
        </div>
      </div>
    </div>
  );
}

function extractEmailBody(html: string) {
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match?.[1] ?? html;
}
