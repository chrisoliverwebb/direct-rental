"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DraftCampaignSummary, TemplateSummary } from "@repo/api-contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailCampaignWorkspace } from "@/features/campaigns/EmailCampaignWorkspace";
import { SmsCampaignWorkspace } from "@/features/campaigns/SmsCampaignWorkspace";
import { useCreateCampaign, useDraftCampaigns, useTemplates } from "@/features/marketing/hooks";

export function NewCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createCampaignMutation = useCreateCampaign();
  const draftCampaignsQuery = useDraftCampaigns();
  const templatesQuery = useTemplates();

  const channel = normalizeChannel(searchParams.get("channel"));
  const templateId = searchParams.get("templateId");
  const scheduledAt = searchParams.get("scheduledAt") ?? undefined;
  const defaultName = generateDefaultName(draftCampaignsQuery.data?.items ?? []);
  const template = templateId ? templatesQuery.data?.items.find((item) => item.id === templateId) : undefined;
  const resolvedChannel = channel ?? normalizeTemplateChannel(template?.channel);

  useEffect(() => {
    if (resolvedChannel && template) {
      return;
    }

    const timeout = window.setTimeout(() => {
      router.replace("/campaigns");
    }, 50);

    return () => window.clearTimeout(timeout);
  }, [resolvedChannel, router, template]);

  if (!resolvedChannel || !template) {
    return (
      <Card className="mx-auto mt-8 max-w-xl">
        <CardHeader>
          <CardTitle>Redirecting to campaigns</CardTitle>
          <CardDescription>
            Start a new campaign from the campaign creation dialog, then the editor will open here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={() => router.replace("/campaigns")}>
            Back to campaigns
          </Button>
        </CardContent>
      </Card>
    );
  }

  const initialCampaign = {
    name: template.name || defaultName,
    channel: template.channel,
    subject: template.subject,
    previewText: template.previewText,
    contentText: template.contentText,
    contentDocument: template.contentDocument ?? null,
  };

  return resolvedChannel === "EMAIL" ? (
    <EmailCampaignWorkspace
      mode="create"
      scheduledAt={scheduledAt}
      initialCampaign={initialCampaign}
      onBack={() => router.push("/campaigns")}
      submitLabel={createCampaignMutation.isPending ? "Saving..." : "Save draft"}
      onSave={async (values) => {
        const result = await createCampaignMutation.mutateAsync(values);
        return result.id;
      }}
    />
  ) : (
    <SmsCampaignWorkspace
      mode="create"
      scheduledAt={scheduledAt}
      initialCampaign={initialCampaign}
      onBack={() => router.push("/campaigns")}
      submitLabel={createCampaignMutation.isPending ? "Saving..." : "Save draft"}
      onSave={async (values) => {
        const result = await createCampaignMutation.mutateAsync(values);
        return result.id;
      }}
    />
  );
}

function normalizeChannel(value: string | null) {
  return value === "EMAIL" || value === "SMS" ? value : null;
}

function normalizeTemplateChannel(value: TemplateSummary["channel"] | undefined) {
  return value === "EMAIL" || value === "SMS" ? value : null;
}

function generateDefaultName(drafts: DraftCampaignSummary[]): string {
  const base = "Untitled Campaign";
  const names = new Set(drafts.map((draft) => draft.name));
  if (!names.has(base)) return base;
  let index = 1;
  while (names.has(`${base} (${index})`)) index += 1;
  return `${base} (${index})`;
}
