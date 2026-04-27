"use client";

import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/sonner";

export function PopUp({
  open,
  onOpenChange,
  title,
  description,
  tone = "error",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  tone?: "error" | "message" | "success";
}) {
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (!open) {
      hasShownRef.current = false;
      return;
    }

    if (hasShownRef.current) {
      return;
    }

    hasShownRef.current = true;

    if (tone === "success") {
      toast.success(title, { description });
    } else if (tone === "message") {
      toast.message(title, { description });
    } else {
      toast.error(title, { description });
    }

    onOpenChange(false);
  }, [description, onOpenChange, open, title, tone]);

  return null;
}
