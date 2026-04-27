"use client";

import { useEffect } from "react";
import { usePageTitleContext } from "@/components/layout/PageTitleProvider";

export function usePageTitle(title: string | null | undefined) {
  const { setTitle } = usePageTitleContext();

  useEffect(() => {
    setTitle(title ?? null);

    return () => {
      setTitle(null);
    };
  }, [setTitle, title]);
}
