"use client";

import { useEffect, useRef } from "react";
import { usePageTitleContext } from "@/components/layout/PageTitleProvider";

export function usePageHeaderActions({
  onEdit,
  onDelete,
}: {
  onEdit?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
}) {
  const { setHeaderActions } = usePageTitleContext();
  const onEditRef = useRef(onEdit);
  const onDeleteRef = useRef(onDelete);

  onEditRef.current = onEdit;
  onDeleteRef.current = onDelete;

  const hasEdit = onEdit !== undefined;
  const hasDelete = onDelete !== undefined;

  useEffect(() => {
    const actions = [];
    if (hasEdit) actions.push({ label: "Edit", onClick: () => onEditRef.current?.() });
    if (hasDelete) actions.push({ label: "Delete", onClick: () => onDeleteRef.current?.(), destructive: true });
    setHeaderActions(actions);
    return () => setHeaderActions([]);
  }, [setHeaderActions, hasEdit, hasDelete]);
}
