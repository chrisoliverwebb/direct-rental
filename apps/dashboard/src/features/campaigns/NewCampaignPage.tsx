"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignForm } from "@/features/campaigns/CampaignForm";
import { useCreateCampaign } from "@/features/marketing/hooks";

export function NewCampaignPage() {
  const router = useRouter();
  const createCampaignMutation = useCreateCampaign();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">New campaign</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create a mocked draft that persists through the MSW layer.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Campaign draft</CardTitle>
          <CardDescription>All fields validate against the shared Zod schema.</CardDescription>
        </CardHeader>
        <CardContent>
          <CampaignForm
            submitLabel={createCampaignMutation.isPending ? "Saving…" : "Save draft"}
            disabled={createCampaignMutation.isPending}
            onSubmit={async (values) => {
              const result = await createCampaignMutation.mutateAsync(values);
              router.push(`/campaigns/${result.id}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
