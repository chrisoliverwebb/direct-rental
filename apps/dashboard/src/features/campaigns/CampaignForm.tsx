"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCampaignRequestSchema,
  type CampaignDetail,
  type CreateCampaignRequest,
} from "@repo/api-contracts";
import { useEffect } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CampaignEmailEditor } from "@/features/campaigns/CampaignEmailEditor";

type CampaignFormProps = {
  defaultValues?: Partial<CampaignDetail>;
  onSubmit: (values: CreateCampaignRequest) => Promise<void>;
  submitLabel: string;
  disabled?: boolean;
  forcedChannel?: CreateCampaignRequest["channel"];
  showChannelField?: boolean;
};

export function CampaignForm({
  defaultValues,
  onSubmit,
  submitLabel,
  disabled = false,
  forcedChannel,
  showChannelField = true,
}: CampaignFormProps) {
  const form = useForm<CreateCampaignRequest>({
    resolver: zodResolver(createCampaignRequestSchema) as Resolver<CreateCampaignRequest>,
    defaultValues: {
      name: defaultValues?.name ?? "",
      channel: forcedChannel ?? defaultValues?.channel ?? "EMAIL",
      subject: defaultValues?.subject ?? "",
      previewText: defaultValues?.previewText ?? "",
      contentHtml: defaultValues?.contentHtml ?? "",
      contentText: defaultValues?.contentText ?? "",
      recipientSelection: defaultValues?.recipientSelection ?? {
        type: "ALL",
      },
    },
  });

  const channel = useWatch({ control: form.control, name: "channel" });
  const contentHtml = useWatch({ control: form.control, name: "contentHtml" });
  const contentText = useWatch({ control: form.control, name: "contentText" });

  useEffect(() => {
    if (channel !== "SMS") {
      return;
    }

    form.setValue("contentHtml", smsTextToHtml(contentText ?? ""), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [channel, contentText, form]);

  const handleSubmit = form.handleSubmit(async (values: CreateCampaignRequest) => {
    await onSubmit(
      values.channel === "SMS"
        ? {
            ...values,
            subject: null,
            previewText: null,
            contentHtml: smsTextToHtml(values.contentText),
          }
        : values,
    );
  });

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <FormField label="Name" error={form.formState.errors.name?.message} htmlFor="name">
        <Input id="name" {...form.register("name")} />
      </FormField>

      {showChannelField ? (
        <FormField label="Channel" error={form.formState.errors.channel?.message} htmlFor="channel">
          <Select id="channel" {...form.register("channel")}>
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
          </Select>
        </FormField>
      ) : (
        <input type="hidden" {...form.register("channel")} />
      )}

      {channel === "EMAIL" ? (
        <div className="grid gap-4">
          <FormField label="Subject" error={form.formState.errors.subject?.message} htmlFor="subject">
            <Input id="subject" {...form.register("subject")} />
          </FormField>

          <FormField
            label="Preview text"
            error={form.formState.errors.previewText?.message}
            htmlFor="previewText"
          >
            <Input id="previewText" {...form.register("previewText")} />
          </FormField>

          <FormField
            label="Email content"
            error={form.formState.errors.contentHtml?.message}
          >
            <input type="hidden" {...form.register("contentHtml")} />
            <input type="hidden" {...form.register("contentText")} />
            <CampaignEmailEditor
              key={channel}
              initialHtml={contentHtml ?? ""}
              disabled={disabled}
              onChange={({ html, text }) => {
                form.setValue("contentHtml", html, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                form.setValue("contentText", text, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />
          </FormField>
        </div>
      ) : (
        <div className="grid gap-4">
          <FormField
            label="SMS message"
            error={form.formState.errors.contentText?.message}
            htmlFor="contentText"
          >
            <div className="grid gap-3">
              <input type="hidden" {...form.register("contentHtml")} />
              <Textarea
                id="contentText"
                {...form.register("contentText")}
                placeholder="Write the SMS message..."
                rows={8}
              />
            </div>
          </FormField>
        </div>
      )}

      <Button type="submit" disabled={disabled}>
        {submitLabel}
      </Button>
    </form>
  );
}

function smsTextToHtml(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return `<p>${escapeHtml(trimmed)}</p>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
