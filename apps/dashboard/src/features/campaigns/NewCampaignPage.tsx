"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignChannelDialog } from "@/features/campaigns/CampaignChannelDialog";
import { CampaignForm } from "@/features/campaigns/CampaignForm";
import { EmailCampaignWorkspace } from "@/features/campaigns/EmailCampaignWorkspace";
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
        <div className="grid gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">New SMS campaign</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a mocked draft that persists through the MSW layer.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>SMS campaign</CardTitle>
              <CardDescription>Simple text-only composer for transactional-style or promotional SMS.</CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignForm
                forcedChannel="SMS"
                showChannelField={false}
                submitLabel={createCampaignMutation.isPending ? "Saving..." : "Save Draft"}
                disabled={createCampaignMutation.isPending}
                onSubmit={async (values) => {
                  const result = await createCampaignMutation.mutateAsync(values);
                  const dest = scheduledAt
                    ? `/campaigns/${result.id}?scheduledAt=${scheduledAt}`
                    : `/campaigns/${result.id}`;
                  router.push(dest);
                }}
              />
            </CardContent>
          </Card>
        </div>
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
