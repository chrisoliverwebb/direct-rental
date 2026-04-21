"use client";

import {
  Fragment,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useCallback,
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
  AlignCenter,
  AlignLeft,
  AlignRight,
  Blocks,
  Bold,
  BookmarkPlus,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  Minus,
  Italic,
  Save,
  Send,
  Square,
  Trash2,
  Undo2,
  Underline,
  Strikethrough,
  Type,
  Columns2,
  Redo2,
} from "lucide-react";
import {
  createCampaignRequestSchema,
  type CampaignDetail,
  type CreateCampaignRequest,
  type CreateSavedEmailBlockRequest,
  type EmailBlock,
  type EmailColumn,
  type EmailDocument,
  type EmailGroupBlock,
  type SavedEmailBlock,
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
import { useCreateSavedBlock, useDeleteSavedBlock, useSavedBlocks } from "@/features/marketing/hooks";
import { useUndoRedoState } from "@/hooks/useUndoRedoState";
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
  { type: "text", label: "Text", description: "Rich text content", icon: Type },
  { type: "image", label: "Image", description: "Image with optional link", icon: ImageIcon },
  { type: "button", label: "Button", description: "Call to action", icon: Square },
  { type: "divider", label: "Divider", description: "A thin dividing line", icon: Minus },
  { type: "spacer", label: "Spacer", description: "Vertical white space", icon: LayoutGrid },
  { type: "columns", label: "Columns", description: "Two column layout", icon: Columns2 },
  { type: "group", label: "Group", description: "Reusable section container", icon: Blocks },
];

type PendingSavedBlock = {
  blockId: string;
  name: string;
};

type EmailEditorState = {
  document: EmailDocument;
  recipientSelection: CreateCampaignRequest["recipientSelection"];
};

type BlockParent =
  | {
      type: "root";
    }
  | {
      type: "column";
      columnsBlockId: string;
      columnId: string;
    }
  | {
      type: "group";
      groupBlockId: string;
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

    if (block.type === "group") {
      const nested = findBlockById(block.blocks, blockId);
      if (nested) {
        return nested;
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

    if (block.type === "group") {
      const nested = findBlockLocation(block.blocks, blockId, {
        type: "group",
        groupBlockId: block.id,
      });
      if (nested) {
        return nested;
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

  if (parent.type === "group") {
    return blocks.map((block) => {
      if (block.type !== "group" || block.id !== parent.groupBlockId) {
        return block;
      }

      const nextBlocks = [...block.blocks];
      nextBlocks.splice(index, 0, nextBlock);
      return { ...block, blocks: nextBlocks };
    });
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
      if (block.type === "group") {
        const nextBlocks = updateBlockById(block.blocks, blockId, updater);
        return nextBlocks !== block.blocks ? { ...block, blocks: nextBlocks } : block;
      }

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

    if (block.type === "group") {
      const result = removeBlockById(block.blocks, blockId);
      if (result.removed) {
        removed = result.removed;
        nextBlocks.push({ ...block, blocks: result.blocks });
        continue;
      }
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

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
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
  const [draggingSavedBlockId, setDraggingSavedBlockId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ index: number; parentKey: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [saveBlockDialogOpen, setSaveBlockDialogOpen] = useState(false);
  const [pendingSavedBlock, setPendingSavedBlock] = useState<PendingSavedBlock | null>(null);
  const [scheduledAtInput, setScheduledAtInput] = useState(() => {
    const seed = initialScheduledAt ?? scheduledAt;
    return seed ? new Date(seed).toISOString().slice(0, 16) : "";
  });
  const emailCanvasRef = useRef<HTMLDivElement>(null);
  const savedBlocksQuery = useSavedBlocks();
  const createSavedBlockMutation = useCreateSavedBlock();
  const deleteSavedBlockMutation = useDeleteSavedBlock();
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
  const initialEditorState: EmailEditorState = {
    document: initialDocument,
    recipientSelection: initialCampaign?.recipientSelection ?? { type: "ALL" },
  };
  const { state: editorState, setState: setEditorState, canUndo, canRedo, undo, redo } = useUndoRedoState(initialEditorState);
  const document = editorState.document;
  const recipientSelection = editorState.recipientSelection;
  const savedSnapshotRef = useRef(
    createDocumentSnapshot(initialDocument, initialCampaign?.recipientSelection ?? { type: "ALL" }),
  );
  const savedBlocks = savedBlocksQuery.data?.items ?? [];

  const selectedBlock = selectedBlockId ? findBlockById(document.blocks, selectedBlockId) : null;
  const selectedBlockLocation = selectedBlockId ? findBlockLocation(document.blocks, selectedBlockId) : null;

  const getParentBlocksLength = (parent: BlockParent): number => {
    if (parent.type === "root") return document.blocks.length;
    if (parent.type === "group") {
      const g = findBlockById(document.blocks, parent.groupBlockId);
      return g?.type === "group" ? g.blocks.length : 0;
    }
    const col = findBlockById(document.blocks, parent.columnsBlockId);
    if (col?.type !== "columns") return 0;
    return col.columns.find((c) => c.id === parent.columnId)?.blocks.length ?? 0;
  };

  const handleMoveSelectedUp = () => {
    if (!selectedBlock || !selectedBlockLocation) return;
    moveBlock(selectedBlock.id, Math.max(0, selectedBlockLocation.index - 1), selectedBlockLocation.parent);
  };

  const handleMoveSelectedDown = () => {
    if (!selectedBlock || !selectedBlockLocation) return;
    const parentLen = getParentBlocksLength(selectedBlockLocation.parent);
    moveBlock(selectedBlock.id, Math.min(parentLen, selectedBlockLocation.index + 2), selectedBlockLocation.parent);
  };

  const selectedBlockLabel = selectedBlock ? ({
    text: "Text", header: "Header", image: "Image", button: "Button",
    spacer: "Spacer", divider: "Divider", columns: "Columns", footer: "Footer", group: "Group",
  } as const)[selectedBlock.type] : null;

  const draggingResolvedType =
    draggingType ??
    (draggingBlockId ? findBlockById(document.blocks, draggingBlockId)?.type ?? null : null) ??
    (draggingSavedBlockId ? savedBlocks.find((entry) => entry.id === draggingSavedBlockId)?.block.type ?? null : null);
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
    setEditorState((current) => ({
      ...current,
      document: updater(current.document),
    }));
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (event.metaKey || event.ctrlKey) {
        if (key === "z") {
          event.preventDefault();
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        }

        if (key === "y") {
          event.preventDefault();
          redo();
          return;
        }
      }

      if ((event.key === "Delete" || event.key === "Backspace") && selectedBlockId && !isEditableTarget(event.target)) {
        event.preventDefault();
        setEditorState((current) => ({
          ...current,
          document: {
            ...current.document,
            blocks: removeBlockById(current.document.blocks, selectedBlockId).blocks,
          },
        }));
        setSelectedBlockId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [redo, selectedBlockId, setEditorState, undo]);

  const handleAttemptExit = () => {
    if (!hasUnsavedChanges) {
      onBack();
      return;
    }

    setExitDialogOpen(true);
  };

  const insertBlockAt = (index: number, blockType: EmailBlock["type"], parent: BlockParent = ROOT_PARENT) => {
    if (blockType === "group" && parent.type === "group") {
      toast.error("Nested groups are not supported yet");
      return;
    }

    const nextBlock = createEmailBlock(blockType);

    updateDocument((current) => {
      return {
        ...current,
        blocks: insertBlockIntoParent(current.blocks, parent, index, nextBlock),
      };
    });

    setSelectedBlockId(nextBlock.id);
  };

  const insertSavedBlockAt = (index: number, block: EmailBlock, parent: BlockParent = ROOT_PARENT) => {
    if (block.type === "group" && parent.type === "group") {
      toast.error("Nested groups are not supported yet");
      return;
    }

    const nextBlock = duplicateEmailBlock(block);

    updateDocument((current) => ({
      ...current,
      blocks: insertBlockIntoParent(current.blocks, parent, index, nextBlock),
    }));

    setSelectedBlockId(nextBlock.id);
  };

  const deleteSavedBlock = async (savedBlockId: string) => {
    try {
      await deleteSavedBlockMutation.mutateAsync(savedBlockId);
      toast.success("Saved block deleted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete saved block";
      toast.error("Delete failed", { description: message });
    }
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
      const sameGroupParent =
        sourceLocation.parent.type === "group" &&
        targetParent.type === "group" &&
        sourceLocation.parent.groupBlockId === targetParent.groupBlockId;
      const adjustedIndex =
        (sameRootParent || sameColumnParent || sameGroupParent) && sourceLocation.index < toIndex ? toIndex - 1 : toIndex;

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

  const saveSelectedBlock = () => {
    if (!selectedBlock) {
      return;
    }

    const defaultName = (() => {
      switch (selectedBlock.type) {
        case "text":
          return selectedBlock.content.text.trim() || "Text block";
        case "button":
          return selectedBlock.label.text.trim() || "Button block";
        case "image":
          return selectedBlock.alt.trim() || "Image block";
        case "divider":
          return "Divider block";
        case "spacer":
          return "Spacer block";
        case "columns":
          return "Columns block";
        case "group":
          return "Grouped section";
        case "header":
          return selectedBlock.title.text.trim() || "Header block";
        case "footer":
          return selectedBlock.content.text.trim() || "Footer block";
      }
    })();

    setPendingSavedBlock({
      blockId: selectedBlock.id,
      name: defaultName,
    });
    setSaveBlockDialogOpen(true);
  };

  const confirmSaveBlock = async () => {
    if (!pendingSavedBlock) {
      return;
    }

    const name = pendingSavedBlock.name.trim();
    if (!name) {
      toast.error("Saved block name is required");
      return;
    }

    const latestBlock = findBlockById(document.blocks, pendingSavedBlock.blockId);
    if (!latestBlock) {
      toast.error("Selected block could not be found");
      return;
    }

    const request: CreateSavedEmailBlockRequest = {
      name,
      block: duplicateEmailBlock(latestBlock),
    };

    try {
      await createSavedBlockMutation.mutateAsync(request);
      setActiveTab("saved");
      setSaveBlockDialogOpen(false);
      setPendingSavedBlock(null);
      toast.success("Block saved");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save block";
      toast.error("Save failed", { description: message });
    }
  };

  const createCampaignPayload = useCallback((): CreateCampaignRequest => {
    const contentHtml = renderEmailDocumentToHtml(document);
    const contentText = renderEmailDocumentToText(document);

    return createCampaignRequestSchema.parse({
      name: document.name,
      channel: "EMAIL",
      subject: document.subject.trim() ? document.subject : null,
      previewText: document.previewText.trim() ? document.previewText : null,
      contentHtml: contentHtml || " ",
      contentText: contentText || " ",
      contentDocument: document,
      recipientSelection,
    });
  }, [document, recipientSelection]);

  const handleSave = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!document.name.trim()) {
      if (!silent) {
        toast.error("Campaign name is required");
      }
      return;
    }

    try {
      setIsSaving(true);
      const payload = createCampaignPayload();
      const campaignId = await onSave(payload);
      savedSnapshotRef.current = createDocumentSnapshot(document, recipientSelection);
      if (!silent) {
        toast.success(mode === "create" ? "Campaign draft saved" : "Campaign updated");
      }
      if (mode === "create") {
        const dest = scheduledAt
          ? `/campaigns/${campaignId}/edit?scheduledAt=${scheduledAt}`
          : "/campaigns";
        router.push(dest);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save campaign";
      toast.error(silent ? "Autosave failed" : "Save failed", { description: message });
    } finally {
      setIsSaving(false);
    }
  }, [createCampaignPayload, document, mode, onSave, recipientSelection, router, scheduledAt]);

  useEffect(() => {
    if (mode !== "edit" || !hasUnsavedChanges || isSaving || !document.name.trim() || !document.blocks.length) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void handleSave({ silent: true });
    }, 2500);

    return () => window.clearTimeout(timeout);
  }, [document, handleSave, hasUnsavedChanges, isSaving, mode, recipientSelection]);

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
    payload:
      | { type: "library"; blockType: EmailBlock["type"] }
      | { type: "saved"; savedBlockId: string }
      | { type: "block"; blockId: string },
    parent: BlockParent = ROOT_PARENT,
  ) => {
    if (payload.type === "library") {
      insertBlockAt(index, payload.blockType, parent);
      return;
    }

    if (payload.type === "saved") {
      const savedBlock = savedBlocks.find((entry) => entry.id === payload.savedBlockId);
      if (savedBlock) {
        insertSavedBlockAt(index, savedBlock.block, parent);
      }
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
          <div key={column.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {columnIndex === 0 ? "Left column" : "Right column"}
              </p>
              <Badge variant="secondary">{column.blocks.length} blocks</Badge>
            </div>

            <div className="grid gap-3 pt-4">
              {column.blocks.length === 0 ? (
                <div
                  className="grid min-h-[160px] place-items-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center"
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDropTarget({ index: 0, parentKey: `column:${block.id}:${column.id}` });
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const blockType = event.dataTransfer.getData("application/x-email-block-type");
                    const blockId = event.dataTransfer.getData("application/x-email-block-id");

                    if (blockType) {
                      handleDropBlock(0, { type: "library", blockType: blockType as EmailBlock["type"] }, parent);
                    } else {
                      const savedBlockId = event.dataTransfer.getData("application/x-saved-email-block-id");
                      if (savedBlockId) {
                        handleDropBlock(0, { type: "saved", savedBlockId }, parent);
                      } else if (blockId) {
                        handleDropBlock(0, { type: "block", blockId }, parent);
                      }
                    }

                    setDropTarget(null);
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
                      <BlockInsertControl
                        onInsertBlock={(blockType) => insertBlockAt(0, blockType, parent)}
                        onInsertSavedBlock={(savedBlockId) => {
                          const savedBlock = savedBlocks.find((entry) => entry.id === savedBlockId);
                          if (savedBlock) {
                            insertSavedBlockAt(0, savedBlock.block, parent);
                          }
                        }}
                        savedBlocks={savedBlocks}
                        allowGroup={false}
                      />
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
                    onDragStart={() => setDraggingBlockId(nestedBlock.id)}
                    onDragEnd={() => setDraggingBlockId(null)}
                    onUpdate={(updater) => updateBlock(nestedBlock.id, updater)}
                    renderNestedColumns={renderNestedColumns}
                    renderGroupedBlocks={renderGroupedBlocks}
                  />
                  <CanvasDropZone
                    index={nestedIndex + 1}
                    parentKey={`column:${block.id}:${column.id}`}
                    draggingResolvedType={draggingResolvedType}
                    dropTarget={dropTarget}
                    savedBlocks={savedBlocks}
                    setDropTarget={setDropTarget}
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

  const renderGroupedBlocks = (block: EmailGroupBlock) => {
    const parent: BlockParent = {
      type: "group",
      groupBlockId: block.id,
    };

    return (
      <div className="grid gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4" style={blockStylesToCss(block.styles)}>
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Grouped section</p>
          <Badge variant="secondary">{block.blocks.length} blocks</Badge>
        </div>

        {block.blocks.length === 0 ? (
          <div
            className={cn(
              "grid min-h-[140px] place-items-center rounded-lg border border-dashed border-slate-200 bg-white px-4 py-8 text-center",
              draggingResolvedType === "group" && "cursor-not-allowed",
            )}
            onDragOver={(event) => {
              event.preventDefault();
              if (draggingResolvedType === "group") {
                event.dataTransfer.dropEffect = "none";
                setDropTarget(null);
                return;
              }

              setDropTarget({ index: 0, parentKey: `group:${block.id}` });
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (draggingResolvedType === "group") {
                setDropTarget(null);
                return;
              }

              const blockType = event.dataTransfer.getData("application/x-email-block-type");
              const blockId = event.dataTransfer.getData("application/x-email-block-id");
              const savedBlockId = event.dataTransfer.getData("application/x-saved-email-block-id");

              if (blockType) {
                handleDropBlock(0, { type: "library", blockType: blockType as EmailBlock["type"] }, parent);
              } else if (savedBlockId) {
                handleDropBlock(0, { type: "saved", savedBlockId }, parent);
              } else if (blockId) {
                handleDropBlock(0, { type: "block", blockId }, parent);
              }

              setDropTarget(null);
            }}
          >
            <div className="grid gap-3">
              <p className="text-sm text-muted-foreground">Add blocks into this grouped section.</p>
              <div className="mx-auto">
                <BlockInsertControl
                  onInsertBlock={(blockType) => insertBlockAt(0, blockType, parent)}
                  onInsertSavedBlock={(savedBlockId) => {
                    const savedBlock = savedBlocks.find((entry) => entry.id === savedBlockId);
                    if (savedBlock) {
                      insertSavedBlockAt(0, savedBlock.block, parent);
                    }
                  }}
                  savedBlocks={savedBlocks}
                  allowGroup={false}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-0">
            {(() => {
              return (
                <>
                  {block.blocks.map((nestedBlock, nestedIndex) => (
                    <Fragment key={nestedBlock.id}>
                      <BlockCard
                        block={nestedBlock}
                        selected={nestedBlock.id === selectedBlockId}
                        previewMode={previewMode}
                        onSelect={() => selectBlock(nestedBlock.id)}
                        onDragStart={() => setDraggingBlockId(nestedBlock.id)}
                        onDragEnd={() => setDraggingBlockId(null)}
                        onUpdate={(updater) => updateBlock(nestedBlock.id, updater)}
                        renderNestedColumns={renderNestedColumns}
                        renderGroupedBlocks={renderGroupedBlocks}
                      />
                      <CanvasDropZone
                        index={nestedIndex + 1}
                        parentKey={`group:${block.id}`}
                        draggingResolvedType={draggingResolvedType}
                        dropTarget={dropTarget}
                        savedBlocks={savedBlocks}
                        setDropTarget={setDropTarget}
                        disallowGroup
                        onDropBlock={(index, payload) => handleDropBlock(index, payload, parent)}
                      />
                    </Fragment>
                  ))}
                </>
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-slate-200 bg-white">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <BackButton onClick={handleAttemptExit} label="Back" iconOnly />
            <div className="min-w-0 flex-1 flex items-center gap-2">
              {mode === "edit" ? (
                <Badge variant={campaignStatus === "SCHEDULED" ? "warning" : "secondary"}>
                  {campaignStatus === "SCHEDULED" ? "Scheduled" : "Draft"}
                </Badge>
              ) : null}
              <Input
                value={document.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Campaign name"
                className="h-auto max-w-xl border-0 bg-white p-0 text-base font-medium shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
            <Badge variant={hasUnsavedChanges ? "warning" : "secondary"}>
              {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
            </Badge>
            <Button type="button" variant="outline" size="icon" onClick={undo} disabled={!canUndo} aria-label="Undo">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="icon" onClick={redo} disabled={!canRedo} aria-label="Redo">
              <Redo2 className="h-4 w-4" />
            </Button>
            <Button type="button" onClick={() => void handleSave()} disabled={isSaving || !hasUnsavedChanges}>
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
                      className="grid gap-2 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                          <item.icon className="h-4 w-4" />
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
                <div className="grid gap-3">
                  {savedBlocks.length > 0 ? (
                    savedBlocks.map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData("application/x-saved-email-block-id", item.id);
                          event.dataTransfer.effectAllowed = "copy";
                          setDraggingSavedBlockId(item.id);
                        }}
                        onDragEnd={() => setDraggingSavedBlockId(null)}
                        className="grid gap-1 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button type="button" onClick={() => insertSavedBlockAt(document.blocks.length, item.block)} className="grid gap-1 text-left">
                            <p className="text-sm font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Saved {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(item.savedAt))}
                            </p>
                          </button>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="capitalize">
                              {item.block.type}
                            </Badge>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() => deleteSavedBlock(item.id)}
                              aria-label="Delete saved block"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">
                      Saved blocks will appear here after you save one from the canvas toolbar.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="min-h-0 overflow-hidden bg-slate-100" onPointerDownCapture={clearSelectedBlockIfOutsideCanvas}>
          <div className="flex h-full min-h-0 flex-col overflow-y-auto px-4 py-6">
            <div className="mx-auto w-full max-w-[640px]">
              <div ref={emailCanvasRef} className="border border-slate-200 bg-white shadow-sm">
                <div>
                  {document.blocks.length === 0 ? (
                    <div
                      className="grid min-h-[360px] place-items-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-8 py-16 text-center m-4"
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDropTarget({ index: 0, parentKey: "root" });
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        const blockType = event.dataTransfer.getData("application/x-email-block-type");
                        const blockId = event.dataTransfer.getData("application/x-email-block-id");
                        const savedBlockId = event.dataTransfer.getData("application/x-saved-email-block-id");

                        if (blockType) {
                          handleDropBlock(0, { type: "library", blockType: blockType as EmailBlock["type"] });
                        } else if (savedBlockId) {
                          handleDropBlock(0, { type: "saved", savedBlockId });
                        } else if (blockId) {
                          handleDropBlock(0, { type: "block", blockId });
                        }

                        setDropTarget(null);
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
                              onInsertSavedBlock={(savedBlockId) => {
                                const savedBlock = savedBlocks.find((entry) => entry.id === savedBlockId);
                                if (savedBlock) {
                                  insertSavedBlockAt(0, savedBlock.block);
                                }
                              }}
                              savedBlocks={savedBlocks}
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}

                  <div className="grid gap-0">
                    {document.blocks.length > 0 ? (
                        <>
                          {document.blocks.map((block, index) => (
                            <Fragment key={block.id}>
                              <BlockCard
                                block={block}
                                selected={block.id === selectedBlockId}
                                previewMode={previewMode}
                                onSelect={() => selectBlock(block.id)}
                                onDragStart={() => setDraggingBlockId(block.id)}
                                onDragEnd={() => setDraggingBlockId(null)}
                                onUpdate={(updater) => updateBlock(block.id, updater)}
                                renderNestedColumns={renderNestedColumns}
                                renderGroupedBlocks={renderGroupedBlocks}
                              />
                              <CanvasDropZone
                                index={index + 1}
                                parentKey="root"
                                draggingResolvedType={draggingResolvedType}
                                dropTarget={dropTarget}
                                savedBlocks={savedBlocks}
                                setDropTarget={setDropTarget}
                                showInsertControl={index === document.blocks.length - 1}
                                onDropBlock={(dropAt, payload) => handleDropBlock(dropAt, payload)}
                              />
                            </Fragment>
                          ))}
                        </>
                      ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="min-h-0 overflow-hidden border-t border-slate-200 bg-white lg:border-l lg:border-t-0">
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="border-b px-4 py-3">
              {selectedBlock && selectedBlockLabel ? (
                <div className="flex items-center justify-between gap-1">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{selectedBlockLabel} block</p>
                    <p className="text-xs text-muted-foreground">Drag the handle on the canvas to reorder.</p>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={handleMoveSelectedUp} aria-label="Move up">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={handleMoveSelectedDown} aria-label="Move down">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => duplicateBlockAt(selectedBlock.id)} aria-label="Duplicate">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={saveSelectedBlock} aria-label="Save block">
                      <BookmarkPlus className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteBlock(selectedBlock.id)} aria-label="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-900">Settings</p>
                  <p className="text-xs text-muted-foreground">Select a block to edit its settings.</p>
                </div>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {selectedBlock ? (
                <BlockSettingsPanel
                  block={selectedBlock}
                  onUpdate={(updater) => updateBlock(selectedBlock.id, updater)}
                />
              ) : (
                <div className="grid gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">
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
          <div className="relative h-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-lg">
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
      <Dialog
        open={saveBlockDialogOpen}
        onOpenChange={(open) => {
          setSaveBlockDialogOpen(open);
          if (!open) {
            setPendingSavedBlock(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save block</DialogTitle>
            <DialogDescription>Name this saved block so you can reuse it in other emails.</DialogDescription>
          </DialogHeader>
          <DialogBody className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-900">Block name</span>
              <Input
                value={pendingSavedBlock?.name ?? ""}
                onChange={(event) =>
                  setPendingSavedBlock((current) => (current ? { ...current, name: event.target.value } : current))
                }
                placeholder="Saved block name"
                autoFocus
              />
            </label>
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSaveBlockDialogOpen(false);
                  setPendingSavedBlock(null);
                }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={confirmSaveBlock}>
                Save block
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
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
                onChange={() =>
                  setEditorState((current) => ({
                    ...current,
                    recipientSelection: { type: "ALL" },
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="ALL">All contacts</option>
              </select>
            </label>
            <div className="grid gap-3 rounded-lg border border-slate-200 p-4">
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
            <div className="grid gap-3 rounded-lg border border-slate-200 p-4">
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

type DropTarget = { index: number; parentKey: string } | null;

type CanvasDropZoneProps = {
  index: number;
  parentKey: string;
  draggingResolvedType: EmailBlock["type"] | null;
  dropTarget: DropTarget;
  savedBlocks: SavedEmailBlock[];
  setDropTarget: (target: DropTarget) => void;
  disallowGroup?: boolean;
  showInsertControl?: boolean;
  onDropBlock: (
    index: number,
    payload:
      | { type: "library"; blockType: EmailBlock["type"] }
      | { type: "saved"; savedBlockId: string }
      | { type: "block"; blockId: string },
  ) => void;
};

type BlockInsertControlProps = {
  onInsertBlock: (blockType: EmailBlock["type"]) => void;
  onInsertSavedBlock?: (savedBlockId: string) => void;
  savedBlocks?: SavedEmailBlock[];
  allowGroup?: boolean;
};

function BlockInsertControl({
  onInsertBlock,
  onInsertSavedBlock,
  savedBlocks = [],
  allowGroup = true,
}: BlockInsertControlProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const filteredBlocks = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    const availableLibrary = allowGroup ? blockLibrary : blockLibrary.filter((item) => item.type !== "group");
    const availableSavedBlocks = allowGroup ? savedBlocks : savedBlocks.filter((item) => item.block.type !== "group");

    if (!query) {
      return {
        library: availableLibrary,
        saved: [] as SavedEmailBlock[],
      };
    }

    const library = availableLibrary.filter((item) => {
      const haystack = `${item.label} ${item.description}`.toLowerCase();
      return haystack.includes(query);
    });
    const saved = availableSavedBlocks.filter((item) => {
      const haystack = `${item.name} ${item.block.type}`.toLowerCase();
      return haystack.includes(query);
    });

    return { library, saved };
  }, [allowGroup, savedBlocks, searchValue]);

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
      const estimatedHeight = menuRef.current?.offsetHeight ?? 336;
      const left = Math.max(8, Math.min(rect.left + rect.width / 2 - estimatedWidth / 2, window.innerWidth - estimatedWidth - 8));
      const preferredTop = rect.bottom + 8;
      const flippedTop = rect.top - estimatedHeight - 8;
      const clampedTop = Math.max(8, Math.min(preferredTop, window.innerHeight - estimatedHeight - 8));

      setMenuPosition({
        left,
        top: preferredTop + estimatedHeight > window.innerHeight && flippedTop > 8 ? flippedTop : clampedTop,
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
  }, [menuOpen, searchValue]);

  return (
    <div ref={controlRef} className="relative inline-flex">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setMenuOpen((current) => !current);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        aria-label="Add block options"
      >
        +
      </button>
      {menuOpen && menuPosition && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              className="z-50 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
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
                {filteredBlocks.library.length || filteredBlocks.saved.length ? (
                  <>
                    {filteredBlocks.library.map((item) => {
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
                    })}
                    {searchValue.trim() && filteredBlocks.saved.length ? (
                      <>
                        <div className="px-3 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Saved blocks
                        </div>
                        {filteredBlocks.saved.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              onInsertSavedBlock?.(item.id);
                              setMenuOpen(false);
                            }}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-slate-100"
                          >
                            <BookmarkPlus className="h-4 w-4 text-slate-600" />
                            <div>
                              <p className="text-sm font-medium text-slate-900">{item.name}</p>
                              <p className="text-xs capitalize text-muted-foreground">{item.block.type}</p>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : null}
                  </>
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
  parentKey,
  draggingResolvedType,
  dropTarget,
  savedBlocks,
  setDropTarget,
  onDropBlock,
  disallowGroup = false,
  showInsertControl = false,
}: CanvasDropZoneProps) {
  const active = draggingResolvedType !== null;
  const highlighted = dropTarget?.index === index && dropTarget?.parentKey === parentKey;
  const groupDropBlocked = disallowGroup && draggingResolvedType === "group";
  const showButton = showInsertControl && !active;

  return (
    <div
      className={cn(
        "group relative transition-all",
        active ? "h-10" : showButton ? "h-10 my-1" : "h-0",
        groupDropBlocked && "cursor-not-allowed",
      )}
      onDragOver={(event) => {
        event.preventDefault();
        if (groupDropBlocked) {
          event.dataTransfer.dropEffect = "none";
          setDropTarget(null);
          return;
        }
        setDropTarget({ index, parentKey });
      }}
      onDragLeave={() => {
        if (highlighted) {
          setDropTarget(null);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        const blockType = event.dataTransfer.getData("application/x-email-block-type");
        const blockId = event.dataTransfer.getData("application/x-email-block-id");
        const savedBlockId = event.dataTransfer.getData("application/x-saved-email-block-id");

        if (groupDropBlocked) {
          setDropTarget(null);
          return;
        }

        if (blockType) {
          onDropBlock(index, { type: "library", blockType: blockType as EmailBlock["type"] });
        } else if (savedBlockId) {
          onDropBlock(index, { type: "saved", savedBlockId });
        } else if (blockId) {
          onDropBlock(index, { type: "block", blockId });
        }

        setDropTarget(null);
      }}
    >
      {active ? (
        <div
          className={cn(
            "absolute left-6 right-6 top-1/2 h-px -translate-y-1/2 transition",
            groupDropBlocked ? "bg-rose-300" : highlighted ? "bg-primary" : "bg-slate-200",
          )}
        />
      ) : null}
      {showButton ? (
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <BlockInsertControl
            onInsertBlock={(blockType) => onDropBlock(index, { type: "library", blockType })}
            onInsertSavedBlock={(savedBlockId) => onDropBlock(index, { type: "saved", savedBlockId })}
            savedBlocks={savedBlocks}
          />
        </div>
      ) : null}
    </div>
  );
}

type BlockCardProps = {
  block: EmailBlock;
  selected: boolean;
  previewMode: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onUpdate: (updater: (block: EmailBlock) => EmailBlock) => void;
  renderNestedColumns?: (block: Extract<EmailBlock, { type: "columns" }>) => ReactNode;
  renderGroupedBlocks?: (block: EmailGroupBlock) => ReactNode;
};

function BlockCard({
  block,
  selected,
  previewMode,
  onSelect,
  onDragStart,
  onDragEnd,
  onUpdate,
  renderNestedColumns,
  renderGroupedBlocks,
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
      case "group":
        return "Group";
    }
  }, [block.type]);

  return (
    <div
      className={cn(
        "group relative cursor-pointer rounded-md transition",
        selected && !previewMode && "z-20 ring-2 ring-primary ring-offset-2 ring-offset-slate-50",
        !selected && !previewMode && "hover:z-10 hover:ring-1 hover:ring-slate-200",
      )}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      {!previewMode ? (
        <button
          type="button"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData("application/x-email-block-id", block.id);
            event.dataTransfer.effectAllowed = "move";
            onDragStart();
          }}
          onDragEnd={onDragEnd}
          className={cn(
            "absolute left-0 top-1/2 z-10 -translate-x-full -translate-y-1/2 cursor-grab rounded-r-none rounded-l p-1 transition",
            selected
              ? "bg-primary text-white opacity-100"
              : "bg-white text-slate-400 opacity-0 shadow-sm group-hover:opacity-100",
          )}
          aria-label={`Drag ${blockLabel}`}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      ) : null}
      {renderBlockPreview(block, previewMode, onUpdate, onSelect, renderNestedColumns, renderGroupedBlocks)}
    </div>
  );
}

function renderBlockPreview(
  block: EmailBlock,
  previewMode: boolean,
  onUpdate: (updater: (block: EmailBlock) => EmailBlock) => void,
  onActivateBlock: () => void,
  renderNestedColumns?: (block: Extract<EmailBlock, { type: "columns" }>) => ReactNode,
  renderGroupedBlocks?: (block: EmailGroupBlock) => ReactNode,
) {
  switch (block.type) {
    case "text":
      return (
        <div style={blockStylesToCss(block.styles)} className="max-w-full">
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
            minHeightClassName="min-h-0"
            placeholder="Type here..."
            contentClassName="w-full min-w-[160px]"
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
        <ImageBlockEditor
          imageUrl={block.sourceType === "url" ? (block.imageUrl ?? "") : (block.uploadedImageData ?? "")}
          alt={block.alt}
          width={block.width}
          height={block.height ?? null}
          fit={block.fit}
          disabled={previewMode}
          onUploadImageData={(value) =>
            onUpdate((current) =>
              current.type === "image"
                ? {
                    ...current,
                    sourceType: "upload",
                    uploadedImageData: value,
                    imageUrl: null,
                  }
                : current,
            )
          }
        />
      );
    case "button":
      return (
        <div style={{ ...blockStylesToCss(block.styles), textAlign: block.alignment }} className="w-full">
          <div
            className={cn(
              "inline-block rounded-full px-4 py-3 text-sm font-semibold text-white",
              !block.buttonBackgroundColor && "bg-slate-900",
            )}
            style={{
              backgroundColor: block.buttonBackgroundColor ?? "#0f172a",
              color: block.buttonTextColor ?? "#ffffff",
              textAlign: block.styles?.textAlign ?? "center",
            }}
          >
            <CampaignEmailEditor
              initialHtml={block.label.html}
              onChange={({ html, text }) => {
                onUpdate((current) => ({
                  ...current,
                  label: { html, text },
                }));
              }}
              disabled={previewMode}
              onActivate={onActivateBlock}
              minHeightClassName="min-h-0"
              placeholder="Button"
              contentClassName="min-w-[72px]"
              placeholderClassName="text-white/70"
            />
          </div>
        </div>
      );
    case "spacer":
      return <div className="rounded-lg border border-dashed border-slate-300 bg-white" style={{ height: block.height }} />;
    case "divider":
      return <div className="border-t" style={{ borderTopWidth: block.thickness, borderTopColor: block.color ?? "#e2e8f0" }} />;
    case "columns":
      return renderNestedColumns ? (
        renderNestedColumns(block)
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-muted-foreground">
          Columns are unavailable in this context.
        </div>
      );
    case "group":
      return renderGroupedBlocks ? renderGroupedBlocks(block) : null;
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
  width: "full" | number;
  height: number | null;
  fit: "cover" | "contain" | "fill";
  disabled: boolean;
  onUploadImageData: (value: string) => void;
};

function ImageBlockEditor({ imageUrl, alt, width, height, fit, disabled, onUploadImageData }: ImageBlockEditorProps) {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const style: CSSProperties = {
    width: width === "full" ? "100%" : `${width}px`,
    height: height ? `${height}px` : "auto",
    objectFit: fit,
  };

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
      onUploadImageData(dataUrl);
      toast.success("Image uploaded");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload image";
      toast.error("Upload failed", { description: message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "group relative overflow-hidden bg-white transition",
          disabled ? "pointer-events-none" : "cursor-pointer",
          isDraggingFile ? "ring-2 ring-primary" : "",
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
          <div className="flex justify-center">
            {/* Local data URLs and arbitrary remote URLs make next/image a poor fit here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={alt || "Email image"} className="block max-w-full" style={style} />
          </div>
        ) : (
          <div className="grid min-h-[220px] place-items-center px-6 py-10 text-center">
            <div className="grid gap-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium text-slate-900">Drop an image here</p>
                <p className="text-xs text-muted-foreground">{isUploading ? "Uploading..." : "Drop an image or add one from settings."}</p>
              </div>
              {!disabled ? (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="shadow-sm"
                    disabled={isUploading}
                    onClick={async (event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = async () => {
                        const file = input.files?.[0];
                        await handleFile(file);
                      };
                      input.click();
                    }}
                  >
                    {isUploading ? "Uploading..." : "Upload image"}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-2">
        {alt ? <p className="text-sm text-slate-700">{alt}</p> : null}
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
  const supportsTypography = block.type === "text" || block.type === "button";
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
      {supportsTypography ? (
        <Card className="grid gap-4 p-4">
          <div className="grid gap-1">
            <p className="text-sm font-semibold text-slate-900">Typography</p>
            <p className="text-xs text-muted-foreground">Text formatting and alignment.</p>
          </div>
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
          {block.type === "text" ? (
            <SelectField
              label="Text style"
              value={block.textStyle}
              options={[
                { label: "Paragraph", value: "p" },
                { label: "Title", value: "h1" },
                { label: "Subtitle", value: "h2" },
                { label: "Section heading", value: "h3" },
              ]}
              onChange={(value) => {
                const style = value as "p" | "h1" | "h2" | "h3";
                const fontPresets: Record<string, { fontSize: string; fontWeight: string }> = {
                  p: { fontSize: "16px", fontWeight: "400" },
                  h1: { fontSize: "32px", fontWeight: "700" },
                  h2: { fontSize: "24px", fontWeight: "600" },
                  h3: { fontSize: "20px", fontWeight: "600" },
                };
                onUpdate((current) =>
                  current.type === "text"
                    ? {
                        ...current,
                        textStyle: style,
                        styles: { ...current.styles, ...fontPresets[style] },
                      }
                    : current,
                );
              }}
            />
          ) : null}
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
          <div className="grid gap-2">
            <span className="text-sm font-medium text-slate-900">Text alignment</span>
            <div className="flex flex-wrap items-center gap-2">
              <StyleToggleButton
                active={(block.styles?.textAlign ?? "left") === "left"}
                aria-label="Align left"
                onClick={() =>
                  onUpdate((current) => ({
                    ...current,
                    styles: {
                      ...current.styles,
                      textAlign: "left",
                    },
                  }))
                }
              >
                <AlignLeft className="h-4 w-4" />
              </StyleToggleButton>
              <StyleToggleButton
                active={block.styles?.textAlign === "center"}
                aria-label="Align center"
                onClick={() =>
                  onUpdate((current) => ({
                    ...current,
                    styles: {
                      ...current.styles,
                      textAlign: "center",
                    },
                  }))
                }
              >
                <AlignCenter className="h-4 w-4" />
              </StyleToggleButton>
              <StyleToggleButton
                active={block.styles?.textAlign === "right"}
                aria-label="Align right"
                onClick={() =>
                  onUpdate((current) => ({
                    ...current,
                    styles: {
                      ...current.styles,
                      textAlign: "right",
                    },
                  }))
                }
              >
                <AlignRight className="h-4 w-4" />
              </StyleToggleButton>
            </div>
          </div>
        </Card>
      ) : null}
      <Card className="grid gap-4 p-4">
        <div className="grid gap-1">
          <p className="text-sm font-semibold text-slate-900">Layout</p>
          <p className="text-xs text-muted-foreground">Spacing and surface styling for this block.</p>
        </div>
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
      </Card>

      {block.type === "image" ? <ImageSettingsPanel block={block} onUpdate={onUpdate} /> : null}

      {block.type === "button" ? (
        <Card className="grid gap-4 p-4">
          <div className="grid gap-1">
            <p className="text-sm font-semibold text-slate-900">Button</p>
            <p className="text-xs text-muted-foreground">Placement and destination settings.</p>
          </div>
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
        </Card>
      ) : null}

      {block.type === "spacer" ? (
        <Card className="grid gap-4 p-4">
          <div className="grid gap-1">
            <p className="text-sm font-semibold text-slate-900">Spacer</p>
            <p className="text-xs text-muted-foreground">Control the vertical gap size.</p>
          </div>
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
          <div className="grid gap-1">
            <p className="text-sm font-semibold text-slate-900">Divider</p>
            <p className="text-xs text-muted-foreground">Adjust the line style and weight.</p>
          </div>
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
          <div className="grid gap-1">
            <p className="text-sm font-semibold text-slate-900">Columns</p>
            <p className="text-xs text-muted-foreground">Choose the column split for this section.</p>
          </div>
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
    </div>
  );
}

function ImageSettingsPanel({
  block,
  onUpdate,
}: {
  block: Extract<EmailBlock, { type: "image" }>;
  onUpdate: (updater: (block: EmailBlock) => EmailBlock) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const previewSrc = block.sourceType === "url" ? (block.imageUrl ?? "") : (block.uploadedImageData ?? "");

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
      onUpdate((current) =>
        current.type === "image"
          ? {
              ...current,
              sourceType: "upload",
              uploadedImageData: dataUrl,
            imageUrl: null,
            }
          : current,
      );
      toast.success("Image uploaded");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload image";
      toast.error("Upload failed", { description: message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="grid gap-4 p-4">
      <div className="grid gap-1">
        <p className="text-sm font-semibold text-slate-900">Image</p>
        <p className="text-xs text-muted-foreground">Source, size, fit and accessibility details.</p>
      </div>
      <div className="grid gap-3">
        <span className="text-sm font-medium text-slate-900">Source</span>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={block.sourceType === "upload" ? "secondary" : "outline"}
            onClick={() =>
              onUpdate((current) =>
                current.type === "image"
                  ? {
                      ...current,
                      sourceType: "upload",
                    }
                  : current,
              )
            }
          >
            Upload
          </Button>
          <Button
            type="button"
            variant={block.sourceType === "url" ? "secondary" : "outline"}
            onClick={() =>
              onUpdate((current) =>
                current.type === "image"
                  ? {
                      ...current,
                      sourceType: "url",
                    }
                  : current,
              )
            }
          >
            Image URL
          </Button>
        </div>
        {block.sourceType === "url" ? (
          <InputField
            label="Image URL"
            value={block.imageUrl ?? ""}
            placeholder="https://"
            onChange={(value) =>
              onUpdate((current) =>
                current.type === "image"
                  ? {
                      ...current,
                      imageUrl: value || null,
                    }
                  : current,
              )
            }
          />
        ) : (
          <div className="grid gap-2">
            <span className="text-sm font-medium text-slate-900">Uploaded file</span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" disabled={isUploading} onClick={() => inputRef.current?.click()}>
                {isUploading ? "Uploading..." : previewSrc ? "Replace image" : "Upload image"}
              </Button>
              {previewSrc ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onUpdate((current) =>
                      current.type === "image"
                        ? {
                            ...current,
                            uploadedImageData: null,
                          }
                        : current,
                    )
                  }
                >
                  Remove
                </Button>
              ) : null}
            </div>
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
          </div>
        )}
        <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewSrc} alt={block.alt || "Image preview"} className="h-28 w-full object-contain bg-white" />
          ) : (
            <div className="grid h-28 place-items-center text-xs text-muted-foreground">No image selected</div>
          )}
        </div>
      </div>
      <InputField
        label="Alt text"
        value={block.alt}
        onChange={(value) =>
          onUpdate((current) =>
            current.type === "image"
              ? {
                  ...current,
                  alt: value,
                }
              : current,
          )
        }
      />
      <div className="grid gap-4">
        <div className="grid gap-1">
          <p className="text-sm font-medium text-slate-900">Sizing</p>
          <p className="text-xs text-muted-foreground">Control the image dimensions and fit.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Width"
            value={block.width === "full" ? "full" : "pixels"}
            options={[
              { label: "100%", value: "full" },
              { label: "Pixels", value: "pixels" },
            ]}
            onChange={(value) =>
              onUpdate((current) =>
                current.type === "image"
                  ? {
                      ...current,
                      width: value === "full" ? "full" : typeof current.width === "number" ? current.width : 600,
                    }
                  : current,
              )
            }
          />
          {block.width === "full" ? (
            <div />
          ) : (
            <NumberField
              label="Width px"
              value={typeof block.width === "number" ? block.width : undefined}
              onChange={(value) =>
                onUpdate((current) =>
                  current.type === "image"
                    ? {
                        ...current,
                        width: value ?? 600,
                      }
                    : current,
                )
              }
            />
          )}
          <SelectField
            label="Height"
            value={block.height ? "pixels" : "auto"}
            options={[
              { label: "Auto", value: "auto" },
              { label: "Pixels", value: "pixels" },
            ]}
            onChange={(value) =>
              onUpdate((current) =>
                current.type === "image"
                  ? {
                      ...current,
                      height: value === "auto" ? null : current.height ?? 320,
                    }
                  : current,
              )
            }
          />
          {block.height ? (
            <NumberField
              label="Height px"
              value={block.height}
              onChange={(value) =>
                onUpdate((current) =>
                  current.type === "image"
                    ? {
                        ...current,
                        height: value ?? 320,
                      }
                    : current,
                )
              }
            />
          ) : (
            <div />
          )}
        </div>
        <SelectField
          label="Fit"
          value={block.fit}
          options={[
            { label: "Cover", value: "cover" },
            { label: "Contain", value: "contain" },
            { label: "Fill", value: "fill" },
          ]}
          onChange={(value) =>
            onUpdate((current) =>
              current.type === "image"
                ? {
                    ...current,
                    fit: value as "cover" | "contain" | "fill",
                  }
                : current,
            )
          }
        />
      </div>
    </Card>
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
