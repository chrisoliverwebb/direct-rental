"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function usePageTab<T extends string>(
  validTabs: ReadonlyArray<{ value: T }>,
  defaultTab: T,
): [T, (tab: T) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get("tab");
  const activeTab = rawTab && validTabs.some((t) => t.value === rawTab) ? (rawTab as T) : defaultTab;

  const setTab = (tab: T) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === defaultTab) {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return [activeTab, setTab];
}
