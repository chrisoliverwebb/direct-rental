import { templateSummarySchema, type TemplateSummary } from "@repo/api-contracts";
import { renderEmailDocumentToHtml, renderEmailDocumentToText } from "@repo/marketing";
import { getCampaignTemplateById, getCampaignTemplates } from "../domain/campaign-template/CampaignTemplateRegistry";
import { getLayoutById } from "../domain/layout/LayoutRegistry";
import { resolveDefaultTheme } from "../domain/theme/ThemeRegistry";

export function buildTemplateSummaryFromCampaignTemplate(templateId: string): TemplateSummary {
  const template = getCampaignTemplateById(templateId);
  if (!template) {
    throw new Error(`Unknown campaign template: ${templateId}`);
  }

  if (template.channel === "SMS") {
    const text = String(template.starterContent.text ?? "");

    return templateSummarySchema.parse({
      id: template.id,
      name: template.name,
      channel: template.channel,
      description: template.description,
      subject: null,
      previewText: template.previewText ?? null,
      contentDocument: null,
      contentHtml: `<p>${escapeHtml(text)}</p>`,
      contentText: text,
      thumbnailUrl: template.previewThumbnail ?? null,
    });
  }

  const theme = resolveDefaultTheme();
  const layout = getLayoutById(template.layoutId ?? "", theme);
  if (!layout) {
    throw new Error(`Unknown email layout: ${template.layoutId}`);
  }

  const contentDocument = layout.buildDocument({
    name: template.name,
    subject: template.subject ?? "",
    previewText: template.previewText ?? "",
    starterContent: template.starterContent,
    theme,
  });

  return templateSummarySchema.parse({
    id: template.id,
    name: template.name,
    channel: template.channel,
    description: template.description,
    subject: template.subject ?? null,
    previewText: template.previewText ?? null,
    contentDocument,
    contentHtml: renderEmailDocumentToHtml(contentDocument),
    contentText: renderEmailDocumentToText(contentDocument),
    thumbnailUrl: template.previewThumbnail ?? null,
  });
}

export function buildTemplateLibrary(): TemplateSummary[] {
  return getCampaignTemplates().map((template) => buildTemplateSummaryFromCampaignTemplate(template.id));
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
