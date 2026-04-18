"use client";

import { channelLabel } from "@repo/marketing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useTemplates } from "@/features/marketing/hooks";

export function TemplatesPage() {
  const templatesQuery = useTemplates();

  if (templatesQuery.isLoading) {
    return <LoadingState rows={4} />;
  }

  if (templatesQuery.isError) {
    return <ErrorState title="Templates unavailable" description={templatesQuery.error.message} onRetry={() => templatesQuery.refetch()} />;
  }

  if (!templatesQuery.data) {
    return <LoadingState rows={3} />;
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">Seeded starter templates for realistic mocked workflows.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {templatesQuery.data.items.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{template.name}</CardTitle>
                <Badge variant="outline">{channelLabel(template.channel)}</Badge>
              </div>
              <CardDescription>{template.previewText ?? "No preview text"}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{template.subject ?? "No subject"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
