"use client";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type UnsavedChangesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function UnsavedChangesDialog({ open, onOpenChange, onConfirm }: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Discard unsaved changes?</DialogTitle>
          <DialogDescription>
            You have unsaved changes on this page. Leave now and your latest edits will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Keep editing
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Leave page
          </Button>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
