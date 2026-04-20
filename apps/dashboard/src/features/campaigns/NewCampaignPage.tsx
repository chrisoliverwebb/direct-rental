"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignChannelDialog } from "@/features/campaigns/CampaignChannelDialog";
import { EmailCampaignWorkspace } from "@/features/campaigns/EmailCampaignWorkspace";
import { SmsCampaignWorkspace } from "@/features/campaigns/SmsCampaignWorkspace";
import { useCreateCampaign, useDraftCampaigns } from "@/features/marketing/hooks";
import type { DraftCampaignSummary } from "@repo/api-contracts";

export function NewCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createCampaignMutation = useCreateCampaign();

  const channel = normalizeChannel(searchParams.get("channel"));
  const scheduledAt = searchParams.get("scheduledAt") ?? undefined;
  const draftCampaignsQuery = useDraftCampaigns();
  const defaultName = generateDefaultName(draftCampaignsQuery.data?.items ?? []);

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

      {channel === "EMAIL" ? (
        <EmailCampaignWorkspace
          mode="create"
          scheduledAt={scheduledAt}
          initialCampaign={{ name: defaultName }}
          onBack={() => router.push("/campaigns")}
          submitLabel={createCampaignMutation.isPending ? "Saving..." : "Save Draft"}
          onSave={async (values) => {
            const result = await createCampaignMutation.mutateAsync(values);
            return result.id;
          }}
        />
      ) : channel === "SMS" ? (
        <SmsCampaignWorkspace
          mode="create"
          scheduledAt={scheduledAt}
          initialCampaign={{ name: defaultName }}
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

function generateDefaultName(drafts: DraftCampaignSummary[]): string {
  const base = "Untitled Campaign";
  const names = new Set(drafts.map((d) => d.name));
  if (!names.has(base)) return base;
  let i = 1;
  while (names.has(`${base} (${i})`)) i++;
  return `${base} (${i})`;
}
