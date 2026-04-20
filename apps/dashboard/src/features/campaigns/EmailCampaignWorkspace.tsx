"use client";

import {
  Fragment,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Bold,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  Minus,
  PanelBottom,
  PanelTop,
  Italic,
  Save,
  Send,
  Square,
  Trash2,
  Underline,
  Strikethrough,
  Type,
  Columns2,
} from "lucide-react";
import {
  createCampaignRequestSchema,
  type CampaignDetail,
  type CreateCampaignRequest,
  type EmailBlock,
  type EmailColumn,
  type EmailDocument,
  type EmailTextContent,
  type SendCampaignRequest,
} from "@repo/api-contracts";
import {
  createEmptyEmailDocument,
  createEmailBlock,
  createEmailDocumentFromCampaignContent,
  duplicateEmailBlock,
  renderEmailDocumentToHtml,
  renderEmailDocumentToText,
} from "@repo/marketing";
import { BackButton } from "@/components/navigation/BackButton";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ColourInput } from "@/components/ui/colour-input";
import { CampaignEmailEditor } from "@/features/campaigns/CampaignEmailEditor";
import { EmailCampaignPreview } from "@/features/campaigns/EmailCampaignPreview";
import { cn } from "@/lib/utils";

type EmailCampaignWorkspaceProps = {
  mode: "create" | "edit";
  onBack: () => void;
  onSave: (request: CreateCampaignRequest) => Promise<string>;
  onSend?: (request: SendCampaignRequest) => Promise<void>;
  submitLabel: string;
  initialCampaign?: Partial<CampaignDetail>;
  autoFocusTitle?: boolean;
  scheduledAt?: string;
  campaignStatus?: "DRAFT" | "SCHEDULED";
  initialScheduledAt?: string;
};

type BlockLibraryItem = {
  type: EmailBlock["type"];
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const blockLibrary: BlockLibraryItem[] = [
  { type: "header", label: "Header", description: "Brand header and intro", icon: PanelTop },
  { type: "text", label: "Text", description: "Rich text content", icon: Type },
  { type: "image", label: "Image", description: "Image with optional link", icon: ImageIcon },
  { type: "button", label: "Button", description: "Call to action", icon: Square },
  { type: "divider", label: "Divider", description: "A thin dividing line", icon: Minus },
  { type: "spacer", label: "Spacer", description: "Vertical white space", icon: LayoutGrid },
  { type: "columns", label: "Columns", description: "Two column layout", icon: Columns2 },
  { type: "footer", label: "Footer", description: "Legal and sign off", icon: PanelBottom },
];

type BlockParent =
  | {
      type: "root";
    }
  | {
      type: "column";
      columnsBlockId: string;
      columnId: string;
    };

const ROOT_PARENT: BlockParent = { type: "root" };

type BlockLocation = {
  parent: BlockParent;
  index: number;
};

function findBlockById(blocks: EmailBlock[], blockId: string): EmailBlock | null {
  for (const block of blocks) {
    if (block.id === blockId) {
      return block;
    }

    if (block.type === "columns") {
      for (const column of block.columns) {
        const nested = findBlockById(column.blocks, blockId);
        if (nested) {
          return nested;
        }
      }
    }
  }

  return null;
}

function findBlockLocation(blocks: EmailBlock[], blockId: string, parent: BlockParent = ROOT_PARENT): BlockLocation | null {
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (!block) {
      continue;
    }

    if (block.id === blockId) {
      return { parent, index };
    }

    if (block.type === "columns") {
      for (const column of block.columns) {
        const nested = findBlockLocation(column.blocks, blockId, {
          type: "column",
          columnsBlockId: block.id,
          columnId: column.id,
        });
        if (nested) {
          return nested;
        }
      }
    }
  }

  return null;
}

function insertBlockIntoParent(blocks: EmailBlock[], parent: BlockParent, index: number, nextBlock: EmailBlock): EmailBlock[] {
  if (parent.type === "root") {
    const nextBlocks = [...blocks];
    nextBlocks.splice(index, 0, nextBlock);
    return nextBlocks;
  }

  return blocks.map((block) => {
    if (block.type !== "columns" || block.id !== parent.columnsBlockId) {
      return block;
    }

    return {
      ...block,
      columns: block.columns.map((column: EmailColumn) => {
        if (column.id !== parent.columnId) {
          return column;
        }

        const nextBlocks = [...column.blocks];
        nextBlocks.splice(index, 0, nextBlock);
        return { ...column, blocks: nextBlocks };
      }),
    };
  });
}

function updateBlockById(blocks: EmailBlock[], blockId: string, updater: (block: EmailBlock) => EmailBlock): EmailBlock[] {
  return blocks.map((block) => {
    if (block.id === blockId) {
      return updater(block);
    }

    if (block.type !== "columns") {
      return block;
    }

    let columnsChanged = false;
    const columns = block.columns.map((column: EmailColumn) => {
      const nextBlocks = updateBlockById(column.blocks, blockId, updater);
      if (nextBlocks !== column.blocks) {
        columnsChanged = true;
        return { ...column, blocks: nextBlocks };
      }

      return column;
    });

    return columnsChanged ? { ...block, columns } : block;
  });
}

function removeBlockById(blocks: EmailBlock[], blockId: string): { blocks: EmailBlock[]; removed: EmailBlock | null } {
  const nextBlocks: EmailBlock[] = [];
  let removed: EmailBlock | null = null;

  for (const block of blocks) {
    if (removed) {
      nextBlocks.push(block);
      continue;
    }

    if (block.id === blockId) {
      removed = block;
      continue;
    }

    if (block.type === "columns") {
      let columnsChanged = false;
      const columns = block.columns.map((column: EmailColumn) => {
        const result = removeBlockById(column.blocks, blockId);
        if (result.removed) {
          removed = result.removed;
          columnsChanged = true;
          return { ...column, blocks: result.blocks };
        }

        return column;
      });

      nextBlocks.push(columnsChanged ? { ...block, columns } : block);
      continue;
    }

    nextBlocks.push(block);
  }

  return { blocks: nextBlocks, removed };
}

function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = reader.result;
      if (typeof value === "string") {
        resolve(value);
        return;
      }

      reject(new Error("Unable to read image file"));
    };
    reader.onerror = () => reject(new Error("Unable to read image file"));
    reader.readAsDataURL(file);
  });
}

function createDocumentSnapshot(
  document: EmailDocument,
  recipientSelection: CreateCampaignRequest["recipientSelection"] = { type: "ALL" },
) {
  return JSON.stringify({
    name: document.name,
    subject: document.subject,
    previewText: document.previewText,
    blocks: document.blocks,
    recipientSelection,
  });
}

export function EmailCampaignWorkspace({
  mode,
  onBack,
  onSave,
  onSend,
  submitLabel,
  initialCampaign,
  scheduledAt,
  campaignStatus = "DRAFT",
  initialScheduledAt,
}: EmailCampaignWorkspaceProps) {
  const router = useRouter();
  const [previewMode, setPreviewMode] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "saved">("content");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<EmailBlock["type"] | null>(null);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [scheduledAtInput, setScheduledAtInput] = useState(() => {
    const seed = initialScheduledAt ?? scheduledAt;
    return seed ? new Date(seed).toISOString().slice(0, 16) : "";
  });
  const [recipientSelection, setRecipientSelection] = useState<CreateCampaignRequest["recipientSelection"]>(
    initialCampaign?.recipientSelection ?? { type: "ALL" },
  );
  const emailCanvasRef = useRef<HTMLDivElement>(null);
  const initialDocument = useMemo(
    () =>
    initialCampaign
      ? createEmailDocumentFromCampaignContent({
          id: initialCampaign.id,
          name: initialCampaign.name ?? "",
          subject: initialCampaign.subject ?? "",
          previewText: initialCampaign.previewText ?? "",
          contentDocument: initialCampaign.contentDocument ?? null,
          contentText: initialCampaign.contentText ?? "",
        })
      : createEmptyEmailDocument(),
    [initialCampaign],
  );
  const [document, setDocument] = useState<EmailDocument>(initialDocument);
  const savedSnapshotRef = useRef(
    createDocumentSnapshot(initialDocument, initialCampaign?.recipientSelection ?? { type: "ALL" }),
  );

  const selectedBlock = selectedBlockId ? findBlockById(document.blocks, selectedBlockId) : null;
  const hasUnsavedChanges = createDocumentSnapshot(document, recipientSelection) !== savedSnapshotRef.current;
  const sendDisabledReason = !document.name.trim()
    ? "Campaign name is required"
    : !document.subject.trim()
      ? "Subject is required to send"
      : hasUnsavedChanges
        ? "Save your changes before sending"
        : null;
  const selectBlock = (blockId: string) => {
    setSelectedBlockId(blockId);
  };
  const clearSelectedBlockIfOutsideCanvas = (event: ReactMouseEvent<HTMLElement>) => {
    if (!emailCanvasRef.current) {
      return;
    }

    if (!emailCanvasRef.current.contains(event.target as Node)) {
      setSelectedBlockId(null);
    }
  };

  const updateDocument = (updater: (current: EmailDocument) => EmailDocument) => {
    setDocument((current) => updater(current));
  };

  const updateField = (field: "name" | "subject" | "previewText", value: string) => {
    updateDocument((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleAttemptExit = () => {
    if (!hasUnsavedChanges) {
      onBack();
      return;
    }

    setExitDialogOpen(true);
  };

  const insertBlockAt = (index: number, blockType: EmailBlock["type"], parent: BlockParent = ROOT_PARENT) => {
    const nextBlock = createEmailBlock(blockType);

    updateDocument((current) => {
      return {
        ...current,
        blocks: insertBlockIntoParent(current.blocks, parent, index, nextBlock),
      };
    });

    setSelectedBlockId(nextBlock.id);
  };

  const moveBlock = (blockId: string, toIndex: number, targetParent: BlockParent = ROOT_PARENT) => {
    updateDocument((current) => {
      const sourceLocation = findBlockLocation(current.blocks, blockId);
      if (!sourceLocation) {
        return current;
      }

      const { blocks: withoutBlock, removed } = removeBlockById(current.blocks, blockId);
      if (!removed) {
        return current;
      }

      const sameRootParent = sourceLocation.parent.type === "root" && targetParent.type === "root";
      const sameColumnParent =
        sourceLocation.parent.type === "column" &&
        targetParent.type === "column" &&
        sourceLocation.parent.columnsBlockId === targetParent.columnsBlockId &&
        sourceLocation.parent.columnId === targetParent.columnId;
      const adjustedIndex = (sameRootParent || sameColumnParent) && sourceLocation.index < toIndex ? toIndex - 1 : toIndex;

      return {
        ...current,
        blocks: insertBlockIntoParent(withoutBlock, targetParent, Math.max(0, adjustedIndex), removed),
      };
    });
  };

  const duplicateBlockAt = (blockId: string) => {
    updateDocument((current) => {
      const location = findBlockLocation(current.blocks, blockId);
      if (!location) {
        return current;
      }

      const source = findBlockById(current.blocks, blockId);
      if (!source) {
        return current;
      }

      const duplicate = duplicateEmailBlock(source);
      setSelectedBlockId(duplicate.id);
      return {
        ...current,
        blocks: insertBlockIntoParent(current.blocks, location.parent, location.index + 1, duplicate),
      };
    });
  };

  const deleteBlock = (blockId: string) => {
    updateDocument((current) => {
      const { blocks } = removeBlockById(current.blocks, blockId);
      return { ...current, blocks };
    });

    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const updateBlock = (blockId: string, updater: (block: EmailBlock) => EmailBlock) => {
    updateDocument((current) => ({
      ...current,
      blocks: updateBlockById(current.blocks, blockId, updater),
    }));
  };

  const createCampaignPayload = (): CreateCampaignRequest => {
    const contentHtml = renderEmailDocumentToHtml(document);
    const contentText = renderEmailDocumentToText(document);

    return createCampaignRequestSchema.parse({
      name: document.name,
      channel: "EMAIL",
      subject: document.subject.trim() ? document.subject : null,
      previewText: document.previewText.trim() ? document.previewText : null,
      contentHtml,
      contentText,
      contentDocument: document,
      recipientSelection,
    });
  };

  const handleSave = async () => {
    if (!document.name.trim()) {
      toast.error("Campaign name is required");
      return;
    }

    if (!document.blocks.length) {
      toast.error("Add at least one block before saving");
      return;
    }

    try {
      setIsSaving(true);
      const payload = createCampaignPayload();
      const campaignId = await onSave(payload);
      savedSnapshotRef.current = createDocumentSnapshot(document, recipientSelection);
      toast.success(mode === "create" ? "Campaign draft saved" : "Campaign updated");
      if (mode === "create") {
        const dest = scheduledAt
          ? `/campaigns/${campaignId}/edit?scheduledAt=${scheduledAt}`
          : "/campaigns";
        router.push(dest);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save campaign";
      toast.error("Save failed", { description: message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    if (!onSend) {
      return;
    }

    try {
      setIsSending(true);
      await onSend({ sendMode: "IMMEDIATE" });
      setSendDialogOpen(false);
      toast.success("Campaign sent");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send campaign";
      toast.error("Send failed", { description: message });
    } finally {
      setIsSending(false);
    }
  };

  const handleSchedule = async () => {
    if (!onSend) {
      return;
    }

    if (!scheduledAtInput) {
      toast.error("Choose a scheduled send time");
      return;
    }

    try {
      setIsSending(true);
      await onSend({ sendMode: "SCHEDULED", scheduledAt: new Date(scheduledAtInput).toISOString() });
      setSendDialogOpen(false);
      toast.success("Campaign scheduled");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to schedule campaign";
      toast.error("Schedule failed", { description: message });
    } finally {
      setIsSending(false);
    }
  };

  const previewContent = useMemo(() => renderEmailDocumentToHtml(document), [document]);
  const handleDropBlock = (
    index: number,
    payload: { type: "library"; blockType: EmailBlock["type"] } | { type: "block"; blockId: string },
    parent: BlockParent = ROOT_PARENT,
  ) => {
    if (payload.type === "library") {
      insertBlockAt(index, payload.blockType, parent);
      return;
    }

    moveBlock(payload.blockId, index, parent);
  };

  const renderNestedColumns = (block: Extract<EmailBlock, { type: "columns" }>) => (
    <div className="grid gap-4 md:grid-cols-2">
      {block.columns.map((column: EmailColumn, columnIndex) => {
        const parent: BlockParent = {
          type: "column",
          columnsBlockId: block.id,
          columnId: column.id,
        };

        return (
          <div key={column.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {columnIndex === 0 ? "Left column" : "Right column"}
              </p>
              <Badge variant="secondary">{column.blocks.length} blocks</Badge>
            </div>

            <div className="grid gap-3 pt-4">
              {column.blocks.length === 0 ? (
                <div
                  className="grid min-h-[160px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center"
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDropIndex(0);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const blockType = event.dataTransfer.getData("application/x-email-block-type");
                    const blockId = event.dataTransfer.getData("application/x-email-block-id");

                    if (blockType) {
                      handleDropBlock(0, { type: "library", blockType: blockType as EmailBlock["type"] }, parent);
                    } else if (blockId) {
                      handleDropBlock(0, { type: "block", blockId }, parent);
                    }

                    setDropIndex(null);
                  }}
                >
                  <div className="grid gap-3">
                    <div className="max-w-[220px]">
                      <p className="text-sm font-medium text-slate-900">Drop blocks here</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Build each column by adding blocks from the sidebar.
                      </p>
                    </div>
                    <div className="mx-auto">
                      <BlockInsertControl onInsertBlock={(blockType) => insertBlockAt(0, blockType, parent)} />
                    </div>
                  </div>
                </div>
              ) : null}

              {column.blocks.map((nestedBlock: EmailBlock, nestedIndex: number) => (
                <Fragment key={nestedBlock.id}>
                  <BlockCard
                    block={nestedBlock}
                    selected={nestedBlock.id === selectedBlockId}
                    previewMode={previewMode}
                    onSelect={() => selectBlock(nestedBlock.id)}
                    onDuplicate={() => duplicateBlockAt(nestedBlock.id)}
                    onDelete={() => deleteBlock(nestedBlock.id)}
                    onMoveUp={() => moveBlock(nestedBlock.id, Math.max(0, nestedIndex - 1), parent)}
                    onMoveDown={() => moveBlock(nestedBlock.id, Math.min(column.blocks.length, nestedIndex + 2), parent)}
                    onDragStart={() => setDraggingBlockId(nestedBlock.id)}
                    onDragEnd={() => setDraggingBlockId(null)}
                    onUpdate={(updater) => updateBlock(nestedBlock.id, updater)}
                    renderNestedColumns={renderNestedColumns}
                  />
                  <CanvasDropZone
                    index={nestedIndex + 1}
                    draggingType={draggingType}
                    draggingBlockId={draggingBlockId}
                    dropIndex={dropIndex}
                    setDropIndex={setDropIndex}
                    onDropBlock={(dropAt, payload) => handleDropBlock(dropAt, payload, parent)}
                  />
                </Fragment>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <BackButton onClick={handleAttemptExit} label="Back" iconOnly />
            <div className="min-w-0 flex-1">
              <Input
                value={document.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Campaign name"
                className="h-auto max-w-xl border-transparent bg-transparent p-0 text-base font-medium shadow-none focus-visible:border-input focus-visible:bg-background focus-visible:px-3 focus-visible:py-2"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              {mode === "edit" ? (
                <Badge variant={campaignStatus === "SCHEDULED" ? "warning" : "secondary"}>
                  {campaignStatus === "SCHEDULED" ? "Scheduled" : "Draft"}
                </Badge>
              ) : null}
              <Badge variant={hasUnsavedChanges ? "warning" : "secondary"}>
                {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
              </Badge>
              <Button type="button" onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : submitLabel}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={previewMode ? "secondary" : "outline"}
                onClick={() => setPreviewMode((current) => !current)}
              >
                {previewMode ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {previewMode ? "Editing" : "Preview"}
              </Button>
              <span title={sendDisabledReason ?? undefined}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSendDialogOpen(true)}
                  disabled={!onSend || !!sendDisabledReason || isSending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSending ? "Sending..." : campaignStatus === "SCHEDULED" ? "Edit Schedule" : "Send / Schedule"}
                </Button>
              </span>
            </div>
          </div>
          <div className="grid gap-3 border-t border-slate-200 px-4 py-3 lg:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Subject
              </label>
              <Input
                value={document.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                placeholder="Campaign subject"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Preview text
              </label>
              <Input
                value={document.previewText}
                onChange={(event) => updateField("previewText", event.target.value)}
                placeholder="Preview text"
              />
            </div>
          </div>
        </header>

        <div className="grid h-full min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)_340px]">
        <aside className="min-h-0 overflow-hidden border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={activeTab === "content" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("content")}
                >
                  Content
                </Button>
                <Button
                  type="button"
                  variant={activeTab === "saved" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("saved")}
                >
                  Saved blocks
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {activeTab === "content" ? (
                <div className="grid gap-3">
                  {blockLibrary.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData("application/x-email-block-type", item.type);
                        event.dataTransfer.effectAllowed = "copy";
                        setDraggingType(item.type);
                      }}
                      onDragEnd={() => setDraggingType(null)}
                      onClick={() => insertBlockAt(document.blocks.length, item.type)}
                      className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-900">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Click to insert or drag into the canvas.</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">
                  Saved blocks will appear here later.
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="min-h-0 overflow-hidden bg-slate-100" onPointerDownCapture={clearSelectedBlockIfOutsideCanvas}>
          <div className="flex h-full min-h-0 flex-col overflow-y-auto px-4 py-6">
            <div className="mx-auto w-full max-w-[640px]">
              <div ref={emailCanvasRef} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {previewMode
                          ? "Preview mode"
                          : "Drag blocks from the sidebar, reorder them, or click to edit."}
                      </p>
                    </div>
                    <Badge variant="secondary">{document.blocks.length} blocks</Badge>
                  </div>
                </div>

                <div className="p-5">
                  {document.blocks.length === 0 ? (
                    <div
                      className="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-8 py-16 text-center"
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDropIndex(0);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        const blockType = event.dataTransfer.getData("application/x-email-block-type");
                        const blockId = event.dataTransfer.getData("application/x-email-block-id");

                        if (blockType) {
                          handleDropBlock(0, { type: "library", blockType: blockType as EmailBlock["type"] });
                        } else if (blockId) {
                          handleDropBlock(0, { type: "block", blockId });
                        }

                        setDropIndex(null);
                      }}
                      >
                        <div className="grid gap-4 text-center">
                          <div className="pointer-events-none max-w-md">
                            <p className="text-base font-medium text-slate-900">Blank canvas</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Add blocks from the left to start building your email.
                            </p>
                          </div>
                          <div className="mx-auto">
                            <BlockInsertControl
                              onInsertBlock={(blockType) => insertBlockAt(0, blockType)}
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}

                  <div className="grid gap-3">
                    {document.blocks.length > 0 ? (
                      <CanvasDropZone
                        index={0}
                        draggingType={draggingType}
                        draggingBlockId={draggingBlockId}
                        dropIndex={dropIndex}
                        setDropIndex={setDropIndex}
                        onDropBlock={(index, payload) => handleDropBlock(index, payload)}
                      />
                    ) : null}
                    {document.blocks.map((block, index) => (
                      <Fragment key={block.id}>
                          <BlockCard
                          block={block}
                          selected={block.id === selectedBlockId}
                          previewMode={previewMode}
                          onSelect={() => selectBlock(block.id)}
                          onDuplicate={() => duplicateBlockAt(block.id)}
                          onDelete={() => deleteBlock(block.id)}
                          onMoveUp={() => moveBlock(block.id, Math.max(0, index - 1))}
                          onMoveDown={() => moveBlock(block.id, Math.min(document.blocks.length, index + 2))}
                          onDragStart={() => setDraggingBlockId(block.id)}
                          onDragEnd={() => setDraggingBlockId(null)}
                          onUpdate={(updater) => updateBlock(block.id, updater)}
                          renderNestedColumns={renderNestedColumns}
                        />
                        <CanvasDropZone
                          index={index + 1}
                          draggingType={draggingType}
                          draggingBlockId={draggingBlockId}
                          dropIndex={dropIndex}
                          setDropIndex={setDropIndex}
                          onDropBlock={(dropAt, payload) => {
                            if (payload.type === "library") {
                              insertBlockAt(dropAt, payload.blockType);
                              return;
                            }

                            moveBlock(payload.blockId, dropAt);
                          }}
                        />
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="min-h-0 overflow-hidden border-t border-slate-200 bg-white lg:border-l lg:border-t-0">
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Settings</p>
              <p className="text-xs text-muted-foreground">
                {selectedBlock ? `Editing ${selectedBlock.type} block` : "Select a block to edit its settings"}
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {selectedBlock ? (
                <BlockSettingsPanel
                  block={selectedBlock}
                  onUpdate={(updater) => updateBlock(selectedBlock.id, updater)}
                />
              ) : (
                <div className="grid gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">
                  <p>No block selected.</p>
                  <p>
                    Choose a block from the canvas to adjust spacing, colours, links, and layout.
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {previewMode ? (
        <div className="fixed inset-0 z-40 bg-slate-950/40 p-6">
          <div className="relative h-full overflow-hidden rounded-[28px] border border-slate-200 bg-[#f7f4ee] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Preview mode</p>
                <p className="text-xs text-muted-foreground">Close preview to return to editing.</p>
              </div>
              <Button type="button" variant="outline" onClick={() => setPreviewMode(false)}>
                <Eye className="mr-2 h-4 w-4" />
                Close preview
              </Button>
            </div>
            <div className="h-[calc(100%-57px)] min-h-0 overflow-hidden">
              <EmailCampaignPreview
                documentId={document.id}
                subject={document.subject}
                previewText={document.previewText}
                contentHtml={previewContent}
                showMailboxChrome
              />
            </div>
          </div>
        </div>
      ) : null}
      <Dialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes in this email. Leave now and your latest edits will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setExitDialogOpen(false)}>
              Keep editing
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setExitDialogOpen(false);
                onBack();
              }}
            >
              Leave editor
            </Button>
          </DialogBody>
        </DialogContent>
      </Dialog>
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send campaign</DialogTitle>
            <DialogDescription>
              Choose whether to send this campaign immediately or schedule it for later.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-900">Who</span>
              <select
                value={recipientSelection.type}
                onChange={() => setRecipientSelection({ type: "ALL" })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="ALL">All contacts</option>
              </select>
            </label>
            <div className="grid gap-3 rounded-xl border border-slate-200 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {campaignStatus === "SCHEDULED" ? "Edit schedule" : "Schedule"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {campaignStatus === "SCHEDULED"
                    ? "Update the scheduled send time for this campaign."
                    : "Pick a future time and this campaign will move into scheduled campaigns."}
                </p>
              </div>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-900">Scheduled for</span>
                <Input
                  type="datetime-local"
                  value={scheduledAtInput}
                  onChange={(event) => setScheduledAtInput(event.target.value)}
                />
              </label>
              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={handleSchedule} disabled={isSending || !scheduledAtInput}>
                  {campaignStatus === "SCHEDULED" ? "Update schedule" : "Schedule"}
                </Button>
              </div>
            </div>
            <div className="grid gap-3 rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {campaignStatus === "SCHEDULED" ? "Send now instead" : "Send now"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {campaignStatus === "SCHEDULED"
                      ? "Deliver this campaign to your audience immediately and remove it from the schedule."
                      : "Deliver this campaign to subscribed contacts immediately."}
                  </p>
                </div>
                <Button type="button" onClick={handleSend} disabled={isSending} className="shrink-0 whitespace-nowrap">
                  {isSending ? "Sending..." : campaignStatus === "SCHEDULED" ? "Send now instead" : "Send now"}
                </Button>
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

type CanvasDropZoneProps = {
  index: number;
  draggingType: EmailBlock["type"] | null;
  draggingBlockId: string | null;
  dropIndex: number | null;
  setDropIndex: (index: number | null) => void;
  onDropBlock: (index: number, payload: { type: "library"; blockType: EmailBlock["type"] } | { type: "block"; blockId: string }) => void;
};

type BlockInsertControlProps = {
  onInsertBlock: (blockType: EmailBlock["type"]) => void;
};

function BlockInsertControl({ onInsertBlock }: BlockInsertControlProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const filteredBlocks = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return blockLibrary;
    }

    return blockLibrary.filter((item) => {
      const haystack = `${item.label} ${item.description}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [searchValue]);

  useEffect(() => {
    if (!menuOpen) {
      setSearchValue("");
      setMenuPosition(null);
      return;
    }

    const updateMenuPosition = () => {
      if (!controlRef.current) {
        return;
      }

      const rect = controlRef.current.getBoundingClientRect();
      const estimatedWidth = 288;
      const estimatedHeight = 336;
      const left = Math.max(8, Math.min(rect.left + rect.width / 2 - estimatedWidth / 2, window.innerWidth - estimatedWidth - 8));
      const top = rect.bottom + 8;
      const flippedTop = rect.top - estimatedHeight - 8;

      setMenuPosition({
        left,
        top: top + estimatedHeight > window.innerHeight && flippedTop > 8 ? flippedTop : top,
      });
    };

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (!controlRef.current) {
        return;
      }

      if (!controlRef.current.contains(event.target as Node) && !menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    updateMenuPosition();
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [menuOpen]);

  return (
    <div ref={controlRef} className="relative inline-flex">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setMenuOpen((current) => !current);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        aria-label="Add block options"
      >
        +
      </button>
      {menuOpen && menuPosition && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              className="z-50 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
              style={{ position: "fixed", top: menuPosition.top, left: menuPosition.left }}
            >
              <div className="grid gap-2 border-b border-slate-100 pb-3">
                <div className="px-1 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Add block</div>
                <Input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search blocks"
                  className="h-9"
                />
              </div>
              <div className="grid gap-1 pt-2">
                {filteredBlocks.length ? (
                  filteredBlocks.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          onInsertBlock(item.type);
                          setMenuOpen(false);
                        }}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-slate-100"
                      >
                        <Icon className="h-4 w-4 text-slate-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-4 text-sm text-muted-foreground">No matching blocks.</div>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function CanvasDropZone({
  index,
  draggingType,
  draggingBlockId,
  dropIndex,
  setDropIndex,
  onDropBlock,
}: CanvasDropZoneProps) {
  const active = draggingType !== null || draggingBlockId !== null;
  const highlighted = dropIndex === index;

  return (
    <div
      className={cn("group relative transition-all", active ? "h-10" : "h-6")}
      onDragOver={(event) => {
        event.preventDefault();
        setDropIndex(index);
      }}
      onDragLeave={() => {
        if (dropIndex === index) {
          setDropIndex(null);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        const blockType = event.dataTransfer.getData("application/x-email-block-type");
        const blockId = event.dataTransfer.getData("application/x-email-block-id");

        if (blockType) {
          onDropBlock(index, { type: "library", blockType: blockType as EmailBlock["type"] });
        } else if (blockId) {
          onDropBlock(index, { type: "block", blockId });
        }

        setDropIndex(null);
      }}
    >
      <div
        className={cn(
          "absolute left-6 right-6 top-1/2 h-px -translate-y-1/2 transition",
          highlighted ? "bg-sky-500" : active ? "bg-slate-200" : "bg-transparent group-hover:bg-slate-300",
        )}
      />
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <BlockInsertControl onInsertBlock={(blockType) => onDropBlock(index, { type: "library", blockType })} />
      </div>
    </div>
  );
}

type BlockCardProps = {
  block: EmailBlock;
  selected: boolean;
  previewMode: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onUpdate: (updater: (block: EmailBlock) => EmailBlock) => void;
  renderNestedColumns?: (block: Extract<EmailBlock, { type: "columns" }>) => ReactNode;
};

function BlockCard({
  block,
  selected,
  previewMode,
  onSelect,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragEnd,
  onUpdate,
  renderNestedColumns,
}: BlockCardProps) {
  const blockLabel = useMemo(() => {
    switch (block.type) {
      case "text":
        return "Text";
      case "header":
        return "Header";
      case "image":
        return "Image";
      case "button":
        return "Button";
      case "spacer":
        return "Spacer";
      case "divider":
        return "Divider";
      case "columns":
        return "Columns";
      case "footer":
        return "Footer";
    }
  }, [block.type]);

  return (
    <Card
      className={cn(
        "overflow-hidden border-slate-200 transition",
        selected && "ring-2 ring-sky-500",
        previewMode && "shadow-none",
      )}
      onClick={onSelect}
    >
      {selected ? (
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
          <button
            type="button"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("application/x-email-block-id", block.id);
              event.dataTransfer.effectAllowed = "move";
              onDragStart();
            }}
            onDragEnd={onDragEnd}
            className="cursor-grab rounded-md p-1 text-slate-400 transition hover:bg-white hover:text-slate-700"
            aria-label={`Drag ${blockLabel}`}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <p className="flex-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {blockLabel}
          </p>
          <div className="flex items-center gap-1">
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={onMoveUp} aria-label="Move up">
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={onMoveDown}
              aria-label="Move down"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={onDuplicate}
              aria-label="Duplicate block"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-red-600 hover:text-red-700"
              onClick={onDelete}
              aria-label="Delete block"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 p-4">
        {renderBlockPreview(block, previewMode, onUpdate, onSelect, renderNestedColumns)}
      </div>
    </Card>
  );
}

function renderBlockPreview(
  block: EmailBlock,
  previewMode: boolean,
  onUpdate: (updater: (block: EmailBlock) => EmailBlock) => void,
  onActivateBlock: () => void,
  renderNestedColumns?: (block: Extract<EmailBlock, { type: "columns" }>) => ReactNode,
) {
  switch (block.type) {
    case "text":
      return (
        <div style={blockStylesToCss(block.styles)}>
                  <CampaignEmailEditor
                    initialHtml={block.content.html}
                    onChange={({ html, text }) => {
                      onUpdate((current) => ({
                        ...current,
                        content: { html, text },
                      }));
                  }}
                  disabled={previewMode}
                  onActivate={onActivateBlock}
                  />
        </div>
      );
    case "header":
      return (
        <div className="grid gap-4" style={blockStylesToCss(block.styles)}>
          {block.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.logoUrl} alt="Logo" className="max-h-12 w-auto" />
          ) : (
            <div className="text-sm text-muted-foreground">Logo placeholder</div>
          )}
          <CampaignEmailEditor
            initialHtml={block.title.html}
            onChange={({ html, text }) => {
              onUpdate((current) => ({
                ...current,
                title: { html, text },
              }));
            }}
            disabled={previewMode}
            onActivate={onActivateBlock}
          />
          <CampaignEmailEditor
            initialHtml={block.subtitle.html}
            onChange={({ html, text }) => {
              onUpdate((current) => ({
                ...current,
                subtitle: { html, text },
              }));
            }}
            disabled={previewMode}
            onActivate={onActivateBlock}
          />
        </div>
      );
    case "image":
      return (
        <div style={blockStylesToCss(block.styles)}>
          <ImageBlockEditor
            imageUrl={block.imageUrl}
            alt={block.alt}
            disabled={previewMode}
            onImageUrlChange={(value) =>
              onUpdate((current) => ({
                ...current,
                imageUrl: value,
              }))
            }
          />
        </div>
      );
    case "button":
      return (
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4" style={blockStylesToCss(block.styles)}>
          <div
            className={cn(
              "inline-flex rounded-full px-4 py-3 text-sm font-semibold text-white",
              !block.buttonBackgroundColor && "bg-slate-900",
              !block.label.text && "text-white/70",
            )}
            style={{
              backgroundColor: block.buttonBackgroundColor ?? "#0f172a",
              color: block.buttonTextColor ?? "#ffffff",
              justifySelf: block.alignment === "left" ? "start" : block.alignment === "right" ? "end" : "center",
            }}
          >
            {block.label.text || "Add button text"}
          </div>
          <p className="text-sm text-slate-700">Link: {block.href || "Add a destination URL"}</p>
        </div>
      );
    case "spacer":
      return <div className="rounded-xl border border-dashed border-slate-300 bg-white" style={{ height: block.height }} />;
    case "divider":
      return <div className="border-t" style={{ borderTopWidth: block.thickness, borderTopColor: block.color ?? "#e2e8f0" }} />;
    case "columns":
      return renderNestedColumns ? (
        renderNestedColumns(block)
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-muted-foreground">
          Columns are unavailable in this context.
        </div>
      );
    case "footer":
      return (
        <div className="grid gap-3" style={blockStylesToCss(block.styles)}>
          <CampaignEmailEditor
            initialHtml={block.content.html}
            onChange={({ html, text }) => {
              onUpdate((current) => ({
                ...current,
                content: { html, text },
              }));
            }}
            disabled={previewMode}
            onActivate={onActivateBlock}
          />
        </div>
      );
  }
}

type ImageBlockEditorProps = {
  imageUrl: string;
  alt: string;
  disabled: boolean;
  onImageUrlChange: (value: string) => void;
};

function ImageBlockEditor({ imageUrl, alt, disabled, onImageUrlChange }: ImageBlockEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    try {
      setIsUploading(true);
      const dataUrl = await readImageFileAsDataUrl(file);
      onImageUrlChange(dataUrl);
      toast.success("Image uploaded");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload image";
      toast.error("Upload failed", { description: message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div
        className={cn(
          "group relative overflow-hidden rounded-lg border border-dashed bg-white transition",
          disabled ? "pointer-events-none border-slate-200" : "cursor-pointer",
          isDraggingFile ? "border-sky-500 bg-sky-50" : "border-slate-300",
        )}
        onDragOver={(event) => {
          if (disabled) {
            return;
          }

          event.preventDefault();
          setIsDraggingFile(true);
        }}
        onDragLeave={() => setIsDraggingFile(false)}
        onDrop={async (event) => {
          if (disabled) {
            return;
          }

          event.preventDefault();
          setIsDraggingFile(false);
          const file = event.dataTransfer.files?.[0];
          await handleFile(file);
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={alt || "Email image"} className="max-h-[320px] w-full object-cover" />
        ) : (
          <div className="grid min-h-[220px] place-items-center px-6 py-10 text-center">
            <div className="grid gap-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium text-slate-900">Drop an image here</p>
                <p className="text-xs text-muted-foreground">or upload a file from your device</p>
              </div>
              {!disabled ? (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => inputRef.current?.click()}
                  >
                    {isUploading ? "Uploading..." : "Upload image"}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        )}
        {!disabled && imageUrl ? (
          <div className="absolute right-3 top-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shadow-sm"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              Replace image
            </Button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-2">
        {alt ? <p className="text-sm text-slate-700">{alt}</p> : null}
        {!disabled ? (
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              await handleFile(file);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function blockStylesToCss(styles: EmailBlock["styles"]): CSSProperties {
  return {
    paddingTop: styles?.paddingTop !== undefined ? `${styles.paddingTop}px` : undefined,
    paddingRight: styles?.paddingRight !== undefined ? `${styles.paddingRight}px` : undefined,
    paddingBottom: styles?.paddingBottom !== undefined ? `${styles.paddingBottom}px` : undefined,
    paddingLeft: styles?.paddingLeft !== undefined ? `${styles.paddingLeft}px` : undefined,
    backgroundColor: styles?.backgroundColor,
    color: styles?.textColor,
    fontFamily: styles?.fontFamily,
    fontSize: styles?.fontSize,
    fontWeight: styles?.fontWeight,
    lineHeight: styles?.lineHeight,
    fontStyle: styles?.fontStyle,
    textDecoration: styles?.textDecoration,
    borderRadius: styles?.borderRadius !== undefined ? `${styles.borderRadius}px` : undefined,
    textAlign: styles?.textAlign,
  };
}

type BlockSettingsPanelProps = {
  block: EmailBlock;
  onUpdate: (updater: (block: EmailBlock) => EmailBlock) => void;
};

function BlockSettingsPanel({ block, onUpdate }: BlockSettingsPanelProps) {
  const currentStyles = block.styles ?? {};
  const supportsTypography = block.type === "text" || block.type === "header" || block.type === "button" || block.type === "footer";
  const fontWeight = currentStyles.fontWeight ?? "400";
  const textDecoration = currentStyles.textDecoration ?? "none";
  const isBold = Number(fontWeight) >= 600;
  const isItalic = currentStyles.fontStyle === "italic";
  const hasDecoration = (token: "underline" | "line-through") => textDecoration.split(" ").includes(token);

  const updateStyles = (updater: (styles: NonNullable<EmailBlock["styles"]>) => NonNullable<EmailBlock["styles"]>) => {
    onUpdate((current) => ({
      ...current,
      styles: updater(current.styles ?? {}),
    }));
  };

  const toggleDecoration = (token: "underline" | "line-through") => {
    updateStyles((styles) => {
      const next = new Set((styles.textDecoration ?? "none").split(" ").filter((item) => item && item !== "none"));
      if (next.has(token)) {
        next.delete(token);
      } else {
        next.add(token);
      }

      return {
        ...styles,
        textDecoration: next.size ? Array.from(next).join(" ") : "none",
      };
    });
  };

  return (
    <div className="grid gap-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Block styles</p>
        <p className="mt-1 text-xs text-muted-foreground">Spacing and layout controls for the selected block.</p>
      </div>
      {supportsTypography ? (
        <Card className="grid gap-4 p-4">
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <StyleToggleButton
                active={isBold}
                aria-label="Bold"
                onClick={() =>
                  updateStyles((styles) => ({
                    ...styles,
                    fontWeight: isBold ? "400" : "700",
                  }))
                }
              >
                <Bold className="h-4 w-4" />
              </StyleToggleButton>
              <StyleToggleButton
                active={isItalic}
                aria-label="Italic"
                onClick={() =>
                  updateStyles((styles) => ({
                    ...styles,
                    fontStyle: isItalic ? "normal" : "italic",
                  }))
                }
              >
                <Italic className="h-4 w-4" />
              </StyleToggleButton>
              <StyleToggleButton
                active={hasDecoration("underline")}
                aria-label="Underline"
                onClick={() => toggleDecoration("underline")}
              >
                <Underline className="h-4 w-4" />
              </StyleToggleButton>
              <StyleToggleButton
                active={hasDecoration("line-through")}
                aria-label="Strikethrough"
                onClick={() => toggleDecoration("line-through")}
              >
                <Strikethrough className="h-4 w-4" />
              </StyleToggleButton>
            </div>
            <p className="text-xs text-muted-foreground">Typography controls apply to the selected block.</p>
          </div>
          <SelectField
            label="Font family"
            value={currentStyles.fontFamily ?? "Arial, sans-serif"}
            options={[
              { label: "Arial, sans-serif", value: "Arial, sans-serif" },
              { label: "Georgia, serif", value: "Georgia, serif" },
              { label: "Times New Roman, serif", value: '"Times New Roman", serif' },
              { label: "Verdana, sans-serif", value: "Verdana, sans-serif" },
            ]}
            onChange={(value) =>
              updateStyles((styles) => ({
                ...styles,
                fontFamily: value,
              }))
            }
          />
          <SelectField
            label="Font size"
            value={currentStyles.fontSize ?? "16px"}
            options={[
              { label: "12px", value: "12px" },
              { label: "14px", value: "14px" },
              { label: "16px", value: "16px" },
              { label: "18px", value: "18px" },
              { label: "24px", value: "24px" },
              { label: "32px", value: "32px" },
            ]}
            onChange={(value) =>
              updateStyles((styles) => ({
                ...styles,
                fontSize: value,
              }))
            }
          />
          <SelectField
            label="Font weight"
            value={currentStyles.fontWeight ?? "400"}
            options={[
              { label: "400", value: "400" },
              { label: "500", value: "500" },
              { label: "600", value: "600" },
              { label: "700", value: "700" },
            ]}
            onChange={(value) =>
              updateStyles((styles) => ({
                ...styles,
                fontWeight: value,
              }))
            }
          />
          <SelectField
            label="Line height"
            value={currentStyles.lineHeight ?? "1.5"}
            options={[
              { label: "1.2", value: "1.2" },
              { label: "1.5", value: "1.5" },
              { label: "1.8", value: "1.8" },
            ]}
            onChange={(value) =>
              updateStyles((styles) => ({
                ...styles,
                lineHeight: value,
              }))
            }
          />
          <ColourInput
            label="Font colour"
            value={currentStyles.textColor ?? "#111827"}
            onChange={(value) =>
              updateStyles((styles) => ({
                ...styles,
                textColor: value ?? "#111827",
              }))
            }
          />
        </Card>
      ) : null}
      <Card className="grid gap-4 p-4">
        <ColourInput
          label="Background colour"
          value={block.styles?.backgroundColor ?? "#ffffff"}
          allowNone
          onChange={(value) =>
            onUpdate((current) => ({
              ...current,
              styles: { ...current.styles, backgroundColor: value || undefined },
            }))
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label="Padding top"
            value={block.styles?.paddingTop}
            onChange={(value) =>
              onUpdate((current) => ({
                ...current,
                styles: { ...current.styles, paddingTop: value },
              }))
            }
          />
          <NumberField
            label="Padding bottom"
            value={block.styles?.paddingBottom}
            onChange={(value) =>
              onUpdate((current) => ({
                ...current,
                styles: { ...current.styles, paddingBottom: value },
              }))
            }
          />
          <NumberField
            label="Padding left"
            value={block.styles?.paddingLeft}
            onChange={(value) =>
              onUpdate((current) => ({
                ...current,
                styles: { ...current.styles, paddingLeft: value },
              }))
            }
          />
          <NumberField
            label="Padding right"
            value={block.styles?.paddingRight}
            onChange={(value) =>
              onUpdate((current) => ({
                ...current,
                styles: { ...current.styles, paddingRight: value },
              }))
            }
          />
        </div>
        <SelectField
          label="Text alignment"
          value={block.styles?.textAlign ?? ""}
          options={[
            { label: "None", value: "" },
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ]}
          onChange={(value) =>
            onUpdate((current) => ({
              ...current,
              styles: {
                ...current.styles,
                textAlign: value ? (value as "left" | "center" | "right") : undefined,
              },
            }))
          }
        />
      </Card>

      {block.type === "image" ? (
        <Card className="grid gap-4 p-4">
          <InputField
            label="Alt text"
            value={block.alt}
            onChange={(value) =>
              onUpdate((current) => ({
                ...current,
                alt: value,
              }))
            }
          />
          <InputField
            label="Image URL"
            value={block.imageUrl}
            onChange={(value) =>
              onUpdate((current) => ({
                ...current,
                imageUrl: value,
              }))
            }
          />
        </Card>
      ) : null}

      {block.type === "button" ? (
        <Card className="grid gap-4 p-4">
          <InputField
            label="Label"
            value={block.label.text}
            onChange={(value) =>
              onUpdate((current) => ({
                ...(current as EmailBlock & { label: EmailTextContent }),
                label: { html: `<p>${escapeHtml(value)}</p>`, text: value },
              }))
            }
          />
          <InputField
            label="Destination URL"
            value={block.href}
            onChange={(value) =>
              onUpdate((current) => ({
                ...current,
                href: value,
              }))
            }
          />
          <SelectField
            label="Alignment"
            value={block.alignment}
            options={[
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ]}
            onChange={(value) =>
              onUpdate((current) => ({
                ...current,
                alignment: value as EmailButtonAlignment,
              }))
            }
          />
          <ColourInput
            label="Background colour"
            value={block.buttonBackgroundColor ?? ""}
            onChange={(value) =>
              onUpdate((current) => ({
                ...current,
                buttonBackgroundColor: value || undefined,
              }))
            }
          />
          <ColourInput
            label="Text colour"
            value={block.buttonTextColor ?? ""}
            onChange={(value) =>
              onUpdate((current) => ({
                ...current,
                buttonTextColor: value || undefined,
              }))
            }
          />
        </Card>
      ) : null}

      {block.type === "spacer" ? (
        <Card className="grid gap-4 p-4">
          <NumberField
            label="Height"
            value={block.height}
            onChange={(value) =>
              onUpdate((current) => ({
                ...current,
                height: value ?? 24,
              }))
            }
          />
        </Card>
      ) : null}

      {block.type === "divider" ? (
        <Card className="grid gap-4 p-4">
          <ColourInput
            label="Divider colour"
            value={block.color ?? ""}
            onChange={(value) =>
              onUpdate((current) => ({
                ...current,
                color: value || undefined,
              }))
            }
          />
          <NumberField
            label="Thickness"
            value={block.thickness}
            onChange={(value) =>
              onUpdate((current) => ({
                ...current,
                thickness: value ?? 1,
              }))
            }
          />
        </Card>
      ) : null}

      {block.type === "columns" ? (
        <Card className="grid gap-4 p-4">
          <SelectField
            label="Layout"
            value={block.layout}
            options={[
              { label: "50 / 50", value: "50-50" },
              { label: "33 / 66", value: "33-66" },
              { label: "66 / 33", value: "66-33" },
            ]}
            onChange={(value) =>
              onUpdate((current) => ({
                ...current,
                layout: value as EmailColumnsLayout,
              }))
            }
          />
          <p className="text-xs text-muted-foreground">Use the inline editors in the canvas for each column.</p>
        </Card>
      ) : null}

      {block.type === "header" ? (
        <Card className="grid gap-4 p-4">
          <InputField
            label="Logo URL"
            value={block.logoUrl ?? ""}
            onChange={(value) =>
              onUpdate((current) => ({
                ...current,
                logoUrl: value || null,
              }))
            }
          />
          <p className="text-xs text-muted-foreground">Edit title and subtitle directly in the canvas.</p>
        </Card>
      ) : null}
    </div>
  );
}

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function InputField({ label, value, onChange, placeholder = "None" }: InputFieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-900">{label}</span>
      <Input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

type NumberFieldProps = {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
};

function NumberField({ label, value, onChange, placeholder = "None" }: NumberFieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-900">{label}</span>
      <Input
        type="number"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value === "" ? undefined : Number(event.target.value))}
      />
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
};

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-900">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type StyleToggleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

function StyleToggleButton({ active, className, ...props }: StyleToggleButtonProps) {
  return (
    <Button
      {...props}
      variant={active ? "secondary" : "outline"}
      size="icon"
      className={cn("h-9 w-9", className)}
    />
  );
}

type EmailButtonAlignment = "left" | "center" | "right";
type EmailColumnsLayout = "50-50" | "33-66" | "66-33";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
