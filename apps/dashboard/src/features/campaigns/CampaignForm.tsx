"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createCampaignRequestSchema, type CampaignDetail, type CreateCampaignRequest } from "@repo/api-contracts";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CampaignFormProps = {
  defaultValues?: Partial<CampaignDetail>;
  onSubmit: (values: CreateCampaignRequest) => Promise<void>;
  submitLabel: string;
  disabled?: boolean;
};

export function CampaignForm({ defaultValues, onSubmit, submitLabel, disabled = false }: CampaignFormProps) {
  const form = useForm<CreateCampaignRequest>({
    resolver: zodResolver(createCampaignRequestSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      channel: defaultValues?.channel ?? "EMAIL",
      subject: defaultValues?.subject ?? "",
      previewText: defaultValues?.previewText ?? "",
      contentHtml: defaultValues?.contentHtml ?? "",
      contentText: defaultValues?.contentText ?? "",
      recipientSelection: defaultValues?.recipientSelection ?? { type: "ALL_SUBSCRIBED" },
    },
  });

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormField label="Name" error={form.formState.errors.name?.message} htmlFor="name">
        <Input id="name" {...form.register("name")} />
      </FormField>
      <FormField label="Channel" error={form.formState.errors.channel?.message} htmlFor="channel">
        <Select id="channel" {...form.register("channel")}>
          <option value="EMAIL">Email</option>
          <option value="SMS">SMS</option>
        </Select>
      </FormField>
      <FormField label="Subject" error={form.formState.errors.subject?.message} htmlFor="subject">
        <Input id="subject" {...form.register("subject")} />
      </FormField>
      <FormField label="Preview text" error={form.formState.errors.previewText?.message} htmlFor="previewText">
        <Input id="previewText" {...form.register("previewText")} />
      </FormField>
      <FormField label="Content HTML" error={form.formState.errors.contentHtml?.message} htmlFor="contentHtml">
        <Textarea id="contentHtml" {...form.register("contentHtml")} />
      </FormField>
      <FormField label="Content text" error={form.formState.errors.contentText?.message} htmlFor="contentText">
        <Textarea id="contentText" {...form.register("contentText")} />
      </FormField>
      <Button type="submit" disabled={disabled}>
        {submitLabel}
      </Button>
    </form>
  );
}
