"use client";

import {
  $getRoot,
} from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
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
  minHeightClassName?: string;
  placeholder?: string;
  contentClassName?: string;
  placeholderClassName?: string;
};

const editorTheme = {
  paragraph: "mb-3 last:mb-0",
  heading: {
    h1: "mb-3 text-2xl font-semibold leading-tight",
    h2: "mb-3 text-xl font-semibold leading-tight",
    h3: "mb-3 text-lg font-semibold leading-tight",
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
  minHeightClassName = "min-h-[240px]",
  placeholder = "Type here...",
  contentClassName = "",
  placeholderClassName = "text-muted-foreground",
}: CampaignEmailEditorProps) {
  const lastSyncedHtmlRef = useRef<string>("");
  const skipInitialSyncRef = useRef(Boolean(initialHtml.trim()));

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
      <SyncHtmlContent
        html={initialHtml}
        lastSyncedHtmlRef={lastSyncedHtmlRef}
        skipInitialSyncRef={skipInitialSyncRef}
      />
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              aria-label="Email content"
              className={`${minHeightClassName} ${contentClassName} bg-transparent text-sm outline-none`}
              onFocus={onActivate}
              onMouseDown={onActivate}
            />
          }
          placeholder={
            <div className={`pointer-events-none absolute inset-x-0 top-0 text-sm ${placeholderClassName}`}>
              {placeholder}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <HistoryPlugin />
      <OnChangePlugin
        onChange={(editorState, editor) => {
          if (skipInitialSyncRef.current) {
            skipInitialSyncRef.current = false;
            return;
          }

          editorState.read(() => {
            const text = $getRoot().getTextContent().trim();
            const html = text ? $generateHtmlFromNodes(editor, null) : "";
            lastSyncedHtmlRef.current = html;
            onChange({ html, text });
          });
        }}
      />
    </LexicalComposer>
  );
}

function SyncHtmlContent({
  html,
  lastSyncedHtmlRef,
  skipInitialSyncRef,
}: {
  html: string;
  lastSyncedHtmlRef: MutableRefObject<string>;
  skipInitialSyncRef: MutableRefObject<boolean>;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (html === lastSyncedHtmlRef.current) {
      return;
    }

    editor.update(() => {
      const root = $getRoot();
      root.clear();

      if (!html.trim()) {
        lastSyncedHtmlRef.current = "";
        return;
      }

      const dom = new DOMParser().parseFromString(html, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      root.append(...nodes);
      lastSyncedHtmlRef.current = html;
    });
    skipInitialSyncRef.current = true;
  }, [editor, html, lastSyncedHtmlRef, skipInitialSyncRef]);

  return null;
}
