import type { EmailDocument } from "@repo/api-contracts";
import type { ThemeDefinition } from "../theme/ThemeDefinition";

export type EmailLayoutInput = {
  name: string;
  subject: string;
  previewText: string;
  starterContent: Record<string, unknown>;
  theme: ThemeDefinition;
};

export type LayoutDefinition = {
  id: string;
  name: string;
  description: string;
  channel: "email";
  buildDocument: (input: EmailLayoutInput) => EmailDocument;
};
