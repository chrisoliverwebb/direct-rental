import type {
  EmailBlock,
  EmailButtonBlock,
  EmailColumn,
  EmailColumnsBlock,
  EmailDividerBlock,
  EmailDocument,
  EmailFooterBlock,
  EmailGroupBlock,
  EmailHeaderBlock,
  EmailImageBlock,
  EmailSpacerBlock,
  EmailTextBlock,
  EmailTextContent,
} from "@repo/api-contracts";

type EmailBlockType = EmailBlock["type"];

export const createEmptyEmailDocument = (overrides: Partial<EmailDocument> = {}): EmailDocument => ({
  id: createBlockId("email"),
  name: "",
  subject: "",
  previewText: "",
  blocks: [],
  ...overrides,
});

export const createEmailBlock = (type: EmailBlockType): EmailBlock => {
  switch (type) {
    case "text":
      return {
        id: createBlockId("text"),
        type: "text",
        styles: defaultTextStyles(),
        content: {
          html: "",
          text: "",
        },
      };
    case "header":
      return {
        id: createBlockId("header"),
        type: "header",
        styles: defaultTextStyles(),
        logoUrl: null,
        title: {
          html: "",
          text: "",
        },
        subtitle: {
          html: "",
          text: "",
        },
      };
    case "image":
      return {
        id: createBlockId("image"),
        type: "image",
        imageUrl: "",
        alt: "",
        href: null,
        width: "full",
      };
    case "button":
      return {
        id: createBlockId("button"),
        type: "button",
        styles: defaultTextStyles(),
        label: {
          html: "",
          text: "",
        },
        href: "https://",
        alignment: "center",
        buttonBackgroundColor: "#0f172a",
        buttonTextColor: "#ffffff",
      };
    case "divider":
      return {
        id: createBlockId("divider"),
        type: "divider",
        color: "#e2e8f0",
        thickness: 1,
      };
    case "spacer":
      return {
        id: createBlockId("spacer"),
        type: "spacer",
        height: 24,
      };
    case "columns":
      return {
        id: createBlockId("columns"),
        type: "columns",
        layout: "50-50",
        columns: [
          {
            id: createBlockId("column"),
            blocks: [],
          },
          {
            id: createBlockId("column"),
            blocks: [],
          },
        ],
      };
    case "footer":
      return {
        id: createBlockId("footer"),
        type: "footer",
        styles: defaultTextStyles(),
        content: {
          html: "",
          text: "",
        },
      };
  }
};

export const duplicateEmailBlock = (block: EmailBlock): EmailBlock => ({
  ...block,
  id: createBlockId(block.type),
  ...(block.type === "columns"
    ? {
        columns: block.columns.map((column: EmailColumn) => duplicateEmailColumn(column)),
      }
    : {}),
});

export const renderEmailDocumentToHtml = (document: EmailDocument): string => {
  const body = renderEmailBlocksToHtml(document.blocks);

  return `<!doctype html><html><body style="margin:0;padding:0;background:#f8fafc;"><div style="max-width:600px;margin:0 auto;padding:24px;background:#ffffff;">${body}</div></body></html>`;
};

export const renderEmailDocumentToText = (document: EmailDocument): string => renderEmailBlocksToText(document.blocks);

export const resolveEmailDocumentTitle = (document: EmailDocument) =>
  document.name.trim() || "Untitled email";

export const createEmailDocumentFromCampaignContent = (input: {
  id?: string;
  name: string;
  subject: string | null;
  previewText: string | null;
  contentDocument?: EmailDocument | null;
  contentText: string;
}): EmailDocument => {
  if (input.contentDocument) {
    return {
      ...input.contentDocument,
      id: input.contentDocument.id || input.id || createBlockId("email"),
      name: input.name,
      subject: input.subject ?? "",
      previewText: input.previewText ?? "",
    };
  }

  return {
    id: input.id ?? createBlockId("email"),
    name: input.name,
    subject: input.subject ?? "",
    previewText: input.previewText ?? "",
      blocks: [
        {
          id: createBlockId("text"),
          type: "text",
          styles: defaultTextStyles(),
          content: {
            html: `<p>${escapeHtml(input.contentText)}</p>`,
            text: input.contentText,
          },
        } satisfies EmailTextBlock,
    ],
  };
};

function renderEmailBlocksToHtml(blocks: EmailBlock[]): string {
  return blocks.map(renderBlockToHtml).join("");
}

function renderEmailBlocksToText(blocks: EmailBlock[]): string {
  return blocks.map(renderBlockToText).filter(Boolean).join("\n\n").trim();
}

function renderBlockToHtml(block: EmailBlock): string {
  const baseStyles = renderBlockStyles(block.styles);

  switch (block.type) {
    case "text":
      return `<div style="${baseStyles}">${normalizeTextHtml(block.content.html, block.content.text)}</div>`;
    case "header":
      return `<div style="${baseStyles}">${block.logoUrl ? `<div style="margin-bottom:16px;"><img src="${escapeAttr(block.logoUrl)}" alt="" style="max-width:160px;height:auto;display:block;" /></div>` : ""}<div style="font-size:28px;font-weight:700;line-height:1.2;">${normalizeTextHtml(block.title.html, block.title.text)}</div><div style="margin-top:8px;color:#64748b;">${normalizeTextHtml(block.subtitle.html, block.subtitle.text)}</div></div>`;
    case "image":
      return `<div style="${baseStyles}">${renderImage(block)}</div>`;
    case "button":
      return `<div style="${baseStyles}text-align:${block.alignment};"><a href="${escapeAttr(block.href)}" style="display:inline-block;background:${escapeAttr(block.buttonBackgroundColor ?? "#0f172a")};color:${escapeAttr(block.buttonTextColor ?? "#ffffff")};padding:12px 20px;border-radius:9999px;text-decoration:none;font-weight:600;">${normalizeTextHtml(block.label.html, block.label.text)}</a></div>`;
    case "spacer":
      return `<div style="${baseStyles}height:${block.height}px;line-height:${block.height}px;font-size:0;">&nbsp;</div>`;
    case "divider":
      return `<div style="${baseStyles}"><hr style="border:none;border-top:${block.thickness}px solid ${escapeAttr(block.color ?? "#e2e8f0")};margin:16px 0;" /></div>`;
    case "columns":
      return `<div style="${baseStyles}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr><td width="${columnWidthPercent(block.layout, "left")}%" valign="top" style="padding-right:12px;">${renderEmailBlocksToHtml(block.columns[0]?.blocks ?? [])}</td><td width="${columnWidthPercent(block.layout, "right")}%" valign="top" style="padding-left:12px;">${renderEmailBlocksToHtml(block.columns[1]?.blocks ?? [])}</td></tr></table></div>`;
    case "footer":
      return `<div style="${baseStyles}color:#64748b;font-size:12px;line-height:1.6;">${normalizeTextHtml(block.content.html, block.content.text)}</div>`;
  }
}

function renderBlockToText(block: EmailBlock): string {
  switch (block.type) {
    case "text":
      return block.content.text;
    case "header":
      return [block.title.text, block.subtitle.text].filter(Boolean).join(" ");
    case "image":
      return block.alt || block.imageUrl;
    case "button":
      return block.label.text;
    case "spacer":
      return "";
    case "divider":
      return "";
    case "columns":
      return block.columns.map((column: EmailColumn) => renderEmailBlocksToText(column.blocks)).filter(Boolean).join(" ");
    case "footer":
      return block.content.text;
  }
}

function renderBlockStyles(styles: EmailBlock["styles"]) {
  if (!styles) {
    return "";
  }

  const parts = [
    styles.paddingTop !== undefined ? `padding-top:${styles.paddingTop}px;` : "",
    styles.paddingRight !== undefined ? `padding-right:${styles.paddingRight}px;` : "",
    styles.paddingBottom !== undefined ? `padding-bottom:${styles.paddingBottom}px;` : "",
    styles.paddingLeft !== undefined ? `padding-left:${styles.paddingLeft}px;` : "",
    styles.backgroundColor ? `background:${escapeAttr(styles.backgroundColor)};` : "",
    styles.textColor ? `color:${escapeAttr(styles.textColor)};` : "",
    styles.fontFamily ? `font-family:${escapeAttr(styles.fontFamily)};` : "",
    styles.fontSize ? `font-size:${escapeAttr(styles.fontSize)};` : "",
    styles.fontWeight ? `font-weight:${escapeAttr(styles.fontWeight)};` : "",
    styles.lineHeight ? `line-height:${escapeAttr(styles.lineHeight)};` : "",
    styles.fontStyle ? `font-style:${escapeAttr(styles.fontStyle)};` : "",
    styles.textDecoration ? `text-decoration:${escapeAttr(styles.textDecoration)};` : "",
    styles.borderRadius !== undefined ? `border-radius:${styles.borderRadius}px;` : "",
    styles.textAlign ? `text-align:${styles.textAlign};` : "",
  ];

  return parts.join("");
}

function renderImage(block: EmailImageBlock) {
  const width = block.width === "full" ? "100%" : `${block.width}px`;
  const img = `<img src="${escapeAttr(block.imageUrl)}" alt="${escapeAttr(block.alt)}" style="display:block;width:${width};max-width:100%;height:auto;" />`;

  if (!block.href) {
    return img;
  }

  return `<a href="${escapeAttr(block.href)}" target="_blank" rel="noreferrer">${img}</a>`;
}

function normalizeTextHtml(html: string, text: string) {
  const trimmedHtml = html.trim();
  if (trimmedHtml) {
    return trimmedHtml;
  }

  return `<p>${escapeHtml(text)}</p>`;
}

function defaultTextStyles() {
  return {
    fontFamily: "Arial, sans-serif",
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "1.5",
    fontStyle: "normal",
    textDecoration: "none",
  };
}

function columnWidthPercent(layout: EmailColumnsBlock["layout"], side: "left" | "right"): number {
  const map: Record<EmailColumnsBlock["layout"], [number, number]> = {
    "50-50": [50, 50],
    "33-66": [33, 67],
    "66-33": [67, 33],
  };

  const widths = map[layout];
  return widths[side === "left" ? 0 : 1];
}

function duplicateEmailColumn(column: EmailColumn): EmailColumn {
  return {
    id: createBlockId("column"),
    blocks: column.blocks.map((block: EmailBlock) => duplicateEmailBlock(block)),
  };
}

function createBlockId(prefix: string) {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value: string) {
  return escapeHtml(value).replaceAll("\n", " ");
}
