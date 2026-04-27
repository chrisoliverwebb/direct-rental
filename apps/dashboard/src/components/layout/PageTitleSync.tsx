"use client";

import { usePageTitle } from "@/components/layout/usePageTitle";

export function PageTitleSync({ title }: { title: string | null | undefined }) {
  usePageTitle(title);
  return null;
}
