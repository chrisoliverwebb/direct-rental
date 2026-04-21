import type { EmailBlock, EmailDocument } from "@repo/api-contracts";
import type { LayoutDefinition } from "./LayoutDefinition";
import type { ThemeDefinition } from "../theme/ThemeDefinition";
import { createId, escapeHtml } from "../../shared";

const textBlock = (
  text: string,
  textStyle: "p" | "h1" | "h2" | "h3",
  styles: EmailBlock["styles"] = {},
): Extract<EmailBlock, { type: "text" }> => ({
  id: createId("text"),
  type: "text",
  textStyle,
  styles,
  content: {
    text,
    html: `<p>${escapeHtml(text)}</p>`,
  },
});

const buttonBlock = ({
  label,
  href,
  alignment = "left",
  buttonBackgroundColor,
  buttonTextColor,
  styles,
}: {
  label: string;
  href: string;
  alignment?: "left" | "center" | "right";
  buttonBackgroundColor: string;
  buttonTextColor: string;
  styles?: EmailBlock["styles"];
}): Extract<EmailBlock, { type: "button" }> => ({
  id: createId("button"),
  type: "button",
  alignment,
  href,
  buttonBackgroundColor,
  buttonTextColor,
  styles,
  label: {
    text: label,
    html: `<p>${escapeHtml(label)}</p>`,
  },
});

const spacerBlock = (height: number): Extract<EmailBlock, { type: "spacer" }> => ({
  id: createId("spacer"),
  type: "spacer",
  height,
});

const dividerBlock = (color: string, thickness: number): Extract<EmailBlock, { type: "divider" }> => ({
  id: createId("divider"),
  type: "divider",
  color,
  thickness,
});

const groupBlock = (blocks: EmailBlock[], styles?: EmailBlock["styles"]): Extract<EmailBlock, { type: "group" }> => ({
  id: createId("group"),
  type: "group",
  styles,
  blocks,
});

const columnsBlock = (
  layout: "50-50" | "33-66" | "66-33",
  leftBlocks: EmailBlock[],
  rightBlocks: EmailBlock[],
  styles?: EmailBlock["styles"],
): Extract<EmailBlock, { type: "columns" }> => ({
  id: createId("columns"),
  type: "columns",
  layout,
  styles,
  columns: [
    { id: createId("column"), blocks: leftBlocks },
    { id: createId("column"), blocks: rightBlocks },
  ],
});

function documentShell(input: {
  name: string;
  subject: string;
  previewText: string;
  blocks: EmailBlock[];
}): EmailDocument {
  return {
    id: createId("email"),
    name: input.name,
    subject: input.subject,
    previewText: input.previewText,
    blocks: input.blocks,
  };
}

function getString(content: Record<string, unknown>, key: string, fallback = "") {
  const value = content[key];
  return typeof value === "string" ? value : fallback;
}

function promoHeroLayout(theme: ThemeDefinition): LayoutDefinition {
  return {
    id: "promo-hero",
    name: "Promo Hero",
    description: "Hero-led promotional layout with supporting columns.",
    channel: "email",
    buildDocument: ({ name, subject, previewText, starterContent }) =>
      documentShell({
        name,
        subject,
        previewText,
        blocks: [
          groupBlock(
            [
              textBlock(getString(starterContent, "eyebrow"), "h3", {
                fontFamily: theme.tokens.fontSans,
                fontSize: "13px",
                fontWeight: "700",
                lineHeight: "1.4",
                textColor: theme.tokens.accent,
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 12,
                paddingLeft: 0,
              }),
              textBlock(getString(starterContent, "headline"), "h1", {
                fontFamily: theme.tokens.fontSans,
                fontSize: "34px",
                fontWeight: "700",
                lineHeight: "1.15",
                textColor: theme.tokens.heading,
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 16,
                paddingLeft: 0,
              }),
              textBlock(getString(starterContent, "intro"), "p", {
                fontFamily: theme.tokens.fontSans,
                fontSize: "17px",
                fontWeight: "400",
                lineHeight: "1.7",
                textColor: theme.tokens.body,
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 20,
                paddingLeft: 0,
              }),
              buttonBlock({
                label: getString(starterContent, "ctaLabel"),
                href: getString(starterContent, "ctaUrl", "#"),
                alignment: "left",
                buttonBackgroundColor: theme.tokens.accent,
                buttonTextColor: theme.tokens.buttonPrimaryText,
                styles: {
                  fontFamily: theme.tokens.fontSans,
                  fontSize: "15px",
                  fontWeight: "700",
                  lineHeight: "1.2",
                  textAlign: "center",
                  paddingTop: 0,
                  paddingRight: 0,
                  paddingBottom: 0,
                  paddingLeft: 0,
                },
              }),
            ],
            {
              backgroundColor: theme.tokens.surface,
              paddingTop: 32,
              paddingRight: 32,
              paddingBottom: 28,
              paddingLeft: 32,
            },
          ),
          spacerBlock(24),
          columnsBlock(
            "50-50",
            [
              textBlock(getString(starterContent, "leftTitle"), "h3", {
                fontFamily: theme.tokens.fontSans,
                fontSize: "18px",
                fontWeight: "700",
                lineHeight: "1.4",
                textColor: theme.tokens.heading,
                paddingTop: 0,
                paddingRight: 18,
                paddingBottom: 8,
                paddingLeft: 24,
              }),
              textBlock(getString(starterContent, "leftBody"), "p", {
                fontFamily: theme.tokens.fontSans,
                fontSize: "15px",
                fontWeight: "400",
                lineHeight: "1.7",
                textColor: theme.tokens.muted,
                paddingTop: 0,
                paddingRight: 18,
                paddingBottom: 0,
                paddingLeft: 24,
              }),
            ],
            [
              textBlock(getString(starterContent, "rightTitle"), "h3", {
                fontFamily: theme.tokens.fontSans,
                fontSize: "18px",
                fontWeight: "700",
                lineHeight: "1.4",
                textColor: theme.tokens.heading,
                paddingTop: 0,
                paddingRight: 24,
                paddingBottom: 8,
                paddingLeft: 18,
              }),
              textBlock(getString(starterContent, "rightBody"), "p", {
                fontFamily: theme.tokens.fontSans,
                fontSize: "15px",
                fontWeight: "400",
                lineHeight: "1.7",
                textColor: theme.tokens.muted,
                paddingTop: 0,
                paddingRight: 24,
                paddingBottom: 0,
                paddingLeft: 18,
              }),
            ],
          ),
        ],
      }),
  };
}

function warmOfferLayout(theme: ThemeDefinition): LayoutDefinition {
  return {
    id: "warm-offer",
    name: "Warm Offer",
    description: "Editorial-style offer layout with a warm hero and supporting copy.",
    channel: "email",
    buildDocument: ({ name, subject, previewText, starterContent }) =>
      documentShell({
        name,
        subject,
        previewText,
        blocks: [
          groupBlock(
            [
              textBlock(getString(starterContent, "headline"), "h1", {
                fontFamily: theme.tokens.fontSerif,
                fontSize: "36px",
                fontWeight: "700",
                lineHeight: "1.15",
                textColor: "#7c2d12",
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 14,
                paddingLeft: 0,
              }),
              textBlock(getString(starterContent, "intro"), "p", {
                fontFamily: theme.tokens.fontSans,
                fontSize: "16px",
                fontWeight: "400",
                lineHeight: "1.75",
                textColor: "#7c2d12",
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 18,
                paddingLeft: 0,
              }),
              buttonBlock({
                label: getString(starterContent, "ctaLabel"),
                href: getString(starterContent, "ctaUrl", "#"),
                alignment: "left",
                buttonBackgroundColor: theme.tokens.accentAlt,
                buttonTextColor: theme.tokens.buttonPrimaryText,
                styles: {
                  fontFamily: theme.tokens.fontSans,
                  fontSize: "15px",
                  fontWeight: "700",
                  lineHeight: "1.2",
                  textAlign: "center",
                  paddingTop: 0,
                  paddingRight: 0,
                  paddingBottom: 0,
                  paddingLeft: 0,
                },
              }),
            ],
            {
              backgroundColor: "#fff7ed",
              paddingTop: 30,
              paddingRight: 30,
              paddingBottom: 30,
              paddingLeft: 30,
            },
          ),
          dividerBlock("#fdba74", 1),
          groupBlock(
            [
              textBlock(getString(starterContent, "supportTitle"), "h3", {
                fontFamily: theme.tokens.fontSans,
                fontSize: "18px",
                fontWeight: "700",
                lineHeight: "1.4",
                textColor: theme.tokens.heading,
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 10,
                paddingLeft: 0,
              }),
              textBlock(getString(starterContent, "supportBody"), "p", {
                fontFamily: theme.tokens.fontSans,
                fontSize: "15px",
                fontWeight: "400",
                lineHeight: "1.7",
                textColor: theme.tokens.muted,
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0,
              }),
            ],
            {
              paddingTop: 22,
              paddingRight: 30,
              paddingBottom: 18,
              paddingLeft: 30,
            },
          ),
        ],
      }),
  };
}

function loyaltyOfferLayout(theme: ThemeDefinition): LayoutDefinition {
  return {
    id: "loyalty-offer",
    name: "Loyalty Offer",
    description: "Simple loyalty campaign with offer panel and CTA-led close.",
    channel: "email",
    buildDocument: ({ name, subject, previewText, starterContent }) =>
      documentShell({
        name,
        subject,
        previewText,
        blocks: [
          groupBlock(
            [
              textBlock(getString(starterContent, "headline"), "h1", {
                fontFamily: theme.tokens.fontSans,
                fontSize: "32px",
                fontWeight: "700",
                lineHeight: "1.2",
                textColor: theme.tokens.heading,
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 14,
                paddingLeft: 0,
              }),
              textBlock(getString(starterContent, "intro"), "p", {
                fontFamily: theme.tokens.fontSans,
                fontSize: "16px",
                fontWeight: "400",
                lineHeight: "1.7",
                textColor: theme.tokens.body,
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 20,
                paddingLeft: 0,
              }),
              groupBlock(
                [
                  textBlock(getString(starterContent, "offerTitle"), "h3", {
                    fontFamily: theme.tokens.fontSans,
                    fontSize: "18px",
                    fontWeight: "700",
                    lineHeight: "1.4",
                    textColor: theme.tokens.heading,
                    paddingTop: 0,
                    paddingRight: 0,
                    paddingBottom: 8,
                    paddingLeft: 0,
                  }),
                  textBlock(getString(starterContent, "offerBody"), "p", {
                    fontFamily: theme.tokens.fontSans,
                    fontSize: "15px",
                    fontWeight: "400",
                    lineHeight: "1.7",
                    textColor: theme.tokens.muted,
                    paddingTop: 0,
                    paddingRight: 0,
                    paddingBottom: 0,
                    paddingLeft: 0,
                  }),
                ],
                {
                  backgroundColor: theme.tokens.surfaceAlt,
                  borderRadius: 16,
                  paddingTop: 18,
                  paddingRight: 18,
                  paddingBottom: 18,
                  paddingLeft: 18,
                },
              ),
              spacerBlock(20),
              buttonBlock({
                label: getString(starterContent, "ctaLabel"),
                href: getString(starterContent, "ctaUrl", "#"),
                alignment: "left",
                buttonBackgroundColor: theme.tokens.buttonPrimaryBackground,
                buttonTextColor: theme.tokens.buttonPrimaryText,
                styles: {
                  fontFamily: theme.tokens.fontSans,
                  fontSize: "15px",
                  fontWeight: "700",
                  lineHeight: "1.2",
                  textAlign: "center",
                  paddingTop: 0,
                  paddingRight: 0,
                  paddingBottom: 0,
                  paddingLeft: 0,
                },
              }),
            ],
            {
              paddingTop: 32,
              paddingRight: 32,
              paddingBottom: 24,
              paddingLeft: 32,
            },
          ),
        ],
      }),
  };
}

export function getLayoutDefinitions(theme: ThemeDefinition) {
  return [promoHeroLayout(theme), warmOfferLayout(theme), loyaltyOfferLayout(theme)];
}

export function getLayoutById(layoutId: string, theme: ThemeDefinition) {
  return getLayoutDefinitions(theme).find((layout) => layout.id === layoutId) ?? null;
}
