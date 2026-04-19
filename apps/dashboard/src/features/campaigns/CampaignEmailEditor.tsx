"use client";

import {
  $getRoot,
} from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useEffect, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

type CampaignEmailEditorProps = {
  initialHtml: string;
  onChange: (next: { html: string; text: string }) => void;
  disabled?: boolean;
  onActivate?: () => void;
};

const editorTheme = {
  paragraph: "mb-3 last:mb-0",
  heading: {
    h1: "mb-3 text-2xl font-semibold leading-tight",
    h2: "mb-3 text-xl font-semibold leading-tight",
  },
  quote: "mb-3 border-l-4 border-slate-300 pl-4 italic text-slate-700",
  list: {
    ul: "mb-3 list-disc pl-6",
    ol: "mb-3 list-decimal pl-6",
    listitem: "mb-1",
  },
};

export function CampaignEmailEditor({
  initialHtml,
  onChange,
  disabled = false,
  onActivate,
}: CampaignEmailEditorProps) {
  const initialStateRef = useRef<string>(initialHtml);

  return (
    <LexicalComposer
      initialConfig={{
        namespace: "CampaignEmailEditor",
        editable: !disabled,
        theme: editorTheme,
        nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
        onError: (error) => {
          throw error;
        },
      }}
    >
      <SeedInitialHtml initialHtml={initialStateRef.current} />
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              aria-label="Email content"
              className="min-h-[240px] w-full bg-transparent text-sm outline-none"
              onFocus={onActivate}
              onMouseDown={onActivate}
            />
          }
          placeholder={
            <div className="pointer-events-none absolute left-0 top-0 text-sm text-muted-foreground">
              Type here...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <HistoryPlugin />
      <OnChangePlugin
        onChange={(editorState, editor) => {
          editorState.read(() => {
            const text = $getRoot().getTextContent().trim();
            const html = text ? $generateHtmlFromNodes(editor, null) : "";
            onChange({ html, text });
          });
        }}
      />
    </LexicalComposer>
  );
}

function SeedInitialHtml({ initialHtml }: { initialHtml: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!initialHtml.trim()) {
      return;
    }

    editor.update(() => {
      const dom = new DOMParser().parseFromString(initialHtml, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      root.append(...nodes);
    });
  }, [editor, initialHtml]);

  return null;
}
