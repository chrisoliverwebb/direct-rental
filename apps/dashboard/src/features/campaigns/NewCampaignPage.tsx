"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignChannelDialog } from "@/features/campaigns/CampaignChannelDialog";
import { EmailCampaignWorkspace } from "@/features/campaigns/EmailCampaignWorkspace";
import { SmsCampaignWorkspace } from "@/features/campaigns/SmsCampaignWorkspace";
import { useCreateCampaign, useDraftCampaigns, useTemplates } from "@/features/marketing/hooks";
import type { DraftCampaignSummary, TemplateSummary } from "@repo/api-contracts";

export function NewCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createCampaignMutation = useCreateCampaign();

  const channel = normalizeChannel(searchParams.get("channel"));
  const templateId = searchParams.get("templateId");
  const scheduledAt = searchParams.get("scheduledAt") ?? undefined;
  const draftCampaignsQuery = useDraftCampaigns();
  const templatesQuery = useTemplates();
  const defaultName = generateDefaultName(draftCampaignsQuery.data?.items ?? []);
  const template = templateId ? templatesQuery.data?.items.find((item) => item.id === templateId) : undefined;
  const resolvedChannel = channel ?? normalizeTemplateChannel(template?.channel);
  const initialCampaign = template
    ? {
        name: template.name,
        channel: template.channel,
        subject: template.subject,
        previewText: template.previewText,
        contentText: template.contentText,
        contentDocument: template.contentDocument ?? null,
      }
    : { name: defaultName };

  return (
    <div className="grid gap-6">
      <CampaignChannelDialog
        open={!channel}
        onOpenChange={(open) => {
          if (!open && !channel) {
            router.push("/campaigns");
          }
        }}
        onSelectChannel={(nextChannel) => {
          router.replace(`/campaigns/new?channel=${nextChannel}`);
        }}
      />

      {resolvedChannel === "EMAIL" ? (
        <EmailCampaignWorkspace
          mode="create"
          scheduledAt={scheduledAt}
          initialCampaign={initialCampaign}
          onBack={() => router.push("/campaigns")}
          submitLabel={createCampaignMutation.isPending ? "Saving..." : "Save Draft"}
          onSave={async (values) => {
            const result = await createCampaignMutation.mutateAsync(values);
            return result.id;
          }}
        />
      ) : resolvedChannel === "SMS" ? (
        <SmsCampaignWorkspace
          mode="create"
          scheduledAt={scheduledAt}
          initialCampaign={initialCampaign}
          onBack={() => router.push("/campaigns")}
          submitLabel={createCampaignMutation.isPending ? "Saving..." : "Save Draft"}
          onSave={async (values) => {
            const result = await createCampaignMutation.mutateAsync(values);
            const dest = scheduledAt
              ? `/campaigns/${result.id}?scheduledAt=${scheduledAt}`
              : `/campaigns/${result.id}`;
            router.push(dest);
            return result.id;
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>New campaign</CardTitle>
            <CardDescription>Choose a channel to start building your campaign.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
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
  const names = new Set(drafts.map((d) => d.name));
  if (!names.has(base)) return base;
  let i = 1;
  while (names.has(`${base} (${i})`)) i++;
  return `${base} (${i})`;
}
