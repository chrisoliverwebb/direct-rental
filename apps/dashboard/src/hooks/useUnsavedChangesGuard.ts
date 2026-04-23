"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type PendingNavigation =
  | { type: "href"; href: string }
  | null;

export function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const pendingNavigationRef = useRef<PendingNavigation>(null);
  const allowNavigationRef = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges || allowNavigationRef.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!hasUnsavedChanges || allowNavigationRef.current) {
        return;
      }

      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      if (anchor.hasAttribute("download")) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      if (nextUrl.href === currentUrl.href) {
        return;
      }

      event.preventDefault();
      pendingNavigationRef.current = { type: "href", href: nextUrl.href };
      setDialogOpen(true);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [hasUnsavedChanges]);

  const confirmNavigation = () => {
    const pendingNavigation = pendingNavigationRef.current;
    pendingNavigationRef.current = null;
    setDialogOpen(false);

    if (!pendingNavigation) {
      return;
    }

    allowNavigationRef.current = true;

    if (pendingNavigation.type === "href") {
      const nextUrl = new URL(pendingNavigation.href);
      if (nextUrl.origin === window.location.origin) {
        router.push(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
      } else {
        window.location.assign(nextUrl.href);
      }
    }
  };

  const cancelNavigation = () => {
    pendingNavigationRef.current = null;
    setDialogOpen(false);
  };

  return {
    dialogOpen,
    setDialogOpen: (open: boolean) => {
      if (!open) {
        cancelNavigation();
        return;
      }

      setDialogOpen(true);
    },
    confirmNavigation,
  };
}
