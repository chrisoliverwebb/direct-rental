"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MessageSquareText } from "lucide-react";
import type { TemplateSummary } from "@repo/api-contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useTemplates } from "@/features/marketing/hooks";
import { cn } from "@/lib/utils";

type TemplateTab = "EMAIL" | "SMS";

export function TemplatesPage() {
  const router = useRouter();
  const templatesQuery = useTemplates();
  const [activeTab, setActiveTab] = useState<TemplateTab>("EMAIL");

  const groupedTemplates = useMemo(() => {
    const items = templatesQuery.data?.items ?? [];

    return {
      EMAIL: items.filter((template) => template.channel === "EMAIL"),
      SMS: items.filter((template) => template.channel === "SMS"),
    };
  }, [templatesQuery.data?.items]);

  if (templatesQuery.isLoading) {
    return <LoadingState rows={4} />;
  }

  if (templatesQuery.isError) {
    return (
      <ErrorState
        title="Templates unavailable"
        description={templatesQuery.error.message}
        onRetry={() => templatesQuery.refetch()}
      />
    );
  }

  if (!templatesQuery.data) {
    return <LoadingState rows={3} />;
  }

  const activeTemplates = groupedTemplates[activeTab];

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">Template library</h1>
        <p className="text-sm text-muted-foreground">
          Start from a ready-made campaign layout, then tailor the copy, timing, and audience.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("EMAIL")}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
            activeTab === "EMAIL"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("SMS")}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
            activeTab === "SMS"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          <MessageSquareText className="h-4 w-4" />
          SMS
        </button>
      </div>

      {activeTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-sm text-muted-foreground">
            {activeTab === "EMAIL" ? "No email templates yet." : "No SMS templates yet."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {activeTemplates.map((template) =>
            template.channel === "EMAIL" ? (
              <EmailTemplateCard
                key={template.id}
                template={template}
                onCreate={() => router.push(`/campaigns/new?channel=EMAIL&templateId=${template.id}`)}
              />
            ) : (
              <SmsTemplateCard
                key={template.id}
                template={template}
                onCreate={() => router.push(`/campaigns/new?channel=SMS&templateId=${template.id}`)}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function EmailTemplateCard({
  template,
  onCreate,
}: {
  template: TemplateSummary;
  onCreate: () => void;
}) {
  return (
    <Card className="overflow-hidden border-slate-200">
      <CardHeader className="border-b bg-slate-50">
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-1.5">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
            {template.subject ? <p className="pt-2 text-sm font-medium text-slate-900">{template.subject}</p> : null}
            {template.previewText ? <p className="text-sm text-slate-500">{template.previewText}</p> : null}
          </div>
          <Badge variant="outline">Email</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-5">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <div className="max-h-[380px] overflow-hidden p-4">
            <div
              className={cn(
                "mx-auto max-w-[600px] overflow-hidden border border-slate-200 bg-white shadow-sm",
                "[&_a]:pointer-events-none",
              )}
              dangerouslySetInnerHTML={{ __html: extractEmailBody(template.contentHtml) }}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={onCreate}>
            Create with template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SmsTemplateCard({
  template,
  onCreate,
}: {
  template: TemplateSummary;
  onCreate: () => void;
}) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-1.5">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
            {template.previewText ? <p className="pt-2 text-sm text-slate-500">{template.previewText}</p> : null}
          </div>
          <Badge variant="outline">SMS</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="rounded-[20px] border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
              <span>Messages</span>
              <span>Now</span>
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-900">
              {template.contentText}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={onCreate}>
            Create with template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function extractEmailBody(html: string) {
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match?.[1] ?? html;
}
