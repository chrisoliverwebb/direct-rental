"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type HeaderAction = {
  label: string;
  onClick: () => void;
  destructive?: boolean;
};

type PageTitleContextValue = {
  title: string | null;
  setTitle: (title: string | null) => void;
  headerActions: HeaderAction[];
  setHeaderActions: (actions: HeaderAction[]) => void;
};

const PageTitleContext = createContext<PageTitleContextValue | null>(null);

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState<string | null>(null);
  const [headerActions, setHeaderActions] = useState<HeaderAction[]>([]);
  const value = useMemo(() => ({ title, setTitle, headerActions, setHeaderActions }), [title, headerActions]);

  return <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>;
}

export function usePageTitleContext() {
  const context = useContext(PageTitleContext);

  if (!context) {
    throw new Error("usePageTitleContext must be used within a PageTitleProvider");
  }

  return context;
}
