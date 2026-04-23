"use client";

import { Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SaveStatusActionsProps = {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void | Promise<void>;
  saveLabel: string;
  disabled?: boolean;
};

export function SaveStatusActions({
  hasUnsavedChanges,
  isSaving,
  onSave,
  saveLabel,
  disabled = false,
}: SaveStatusActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant={hasUnsavedChanges ? "warning" : "secondary"}>
        {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
      </Badge>
      <Button type="button" onClick={() => void onSave()} disabled={disabled || isSaving || !hasUnsavedChanges}>
        <Save className="mr-2 h-4 w-4" />
        {isSaving ? "Saving..." : saveLabel}
      </Button>
    </div>
  );
}
