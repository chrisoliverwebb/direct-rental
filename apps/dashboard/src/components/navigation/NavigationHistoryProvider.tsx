"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "dashboard:page-history";

type PageHistoryScopeState = {
  entries: string[];
  index: number;
};

type PageHistoryState = Record<string, PageHistoryScopeState>;

type NavigationHistoryContextValue = {
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
};

const NavigationHistoryContext = createContext<NavigationHistoryContextValue | null>(null);

function readHistoryState(): PageHistoryState {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, Partial<PageHistoryScopeState>>;
    return Object.fromEntries(
      Object.entries(parsed).map(([scope, value]) => {
        const entries = Array.isArray(value.entries) ? value.entries.filter((entry): entry is string => typeof entry === "string") : [];
        const index = typeof value.index === "number" ? value.index : Math.max(entries.length - 1, 0);

        return [
          scope,
          {
            entries,
            index: Math.min(Math.max(index, 0), Math.max(entries.length - 1, 0)),
          },
        ] satisfies [string, PageHistoryScopeState];
      }),
    );
  } catch {
    return {};
  }
}

function writeHistoryState(state: PageHistoryState) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getNavigationScope(pathname: string) {
  if (pathname.startsWith("/properties")) return "properties";
  if (pathname.startsWith("/contacts")) return "contacts";
  if (pathname.startsWith("/campaigns")) return "campaigns";
  if (pathname.startsWith("/marketing")) return "marketing";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/account")) return "account";
  return "dashboard";
}

export function NavigationHistoryProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scope = useMemo(() => getNavigationScope(pathname), [pathname]);
  const routeKey = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);
  const [historyState, setHistoryState] = useState<PageHistoryState>({});

  useEffect(() => {
    const current = readHistoryState();
    const currentScope = current[scope] ?? { entries: [], index: 0 };

    if (currentScope.entries.length === 0) {
      const nextState = {
        ...current,
        [scope]: { entries: [routeKey], index: 0 },
      };
      writeHistoryState(nextState);
      setHistoryState(nextState);
      return;
    }

    if (currentScope.entries[currentScope.index] === routeKey) {
      setHistoryState(current);
      return;
    }

    if (currentScope.entries[currentScope.index - 1] === routeKey) {
      const nextState = {
        ...current,
        [scope]: { ...currentScope, index: currentScope.index - 1 },
      };
      writeHistoryState(nextState);
      setHistoryState(nextState);
      return;
    }

    if (currentScope.entries[currentScope.index + 1] === routeKey) {
      const nextState = {
        ...current,
        [scope]: { ...currentScope, index: currentScope.index + 1 },
      };
      writeHistoryState(nextState);
      setHistoryState(nextState);
      return;
    }

    // Navigating "up" to an ancestor path (e.g. /campaigns/123 → /campaigns).
    // Treat as back-navigation rather than pushing forward, so the list page
    // never ends up at index > 0 with no valid back destination.
    const currentEntry = currentScope.entries[currentScope.index];
    if (currentEntry?.startsWith(routeKey + "/")) {
      let foundIndex = -1;
      for (let i = currentScope.index - 1; i >= 0; i--) {
        if (currentScope.entries[i] === routeKey) {
          foundIndex = i;
          break;
        }
      }

      if (foundIndex !== -1) {
        const nextState = { ...current, [scope]: { ...currentScope, index: foundIndex } };
        writeHistoryState(nextState);
        setHistoryState(nextState);
      } else {
        // Not previously visited — insert before current so forward navigation
        // still leads back to the detail page.
        const nextEntries = [
          ...currentScope.entries.slice(0, currentScope.index),
          routeKey,
          ...currentScope.entries.slice(currentScope.index),
        ];
        const nextState = { ...current, [scope]: { entries: nextEntries, index: currentScope.index } };
        writeHistoryState(nextState);
        setHistoryState(nextState);
      }
      return;
    }

    const nextEntries = [...currentScope.entries.slice(0, currentScope.index + 1), routeKey];
    const nextState = {
      ...current,
      [scope]: { entries: nextEntries, index: nextEntries.length - 1 },
    };
    writeHistoryState(nextState);
    setHistoryState(nextState);
  }, [routeKey, scope]);

  const currentScopeState = historyState[scope] ?? { entries: [], index: 0 };

  const goBack = useCallback(() => {
    if (currentScopeState.index > 0) {
      router.push(currentScopeState.entries[currentScopeState.index - 1] ?? pathname);
    }
  }, [currentScopeState.entries, currentScopeState.index, pathname, router]);

  const goForward = useCallback(() => {
    if (currentScopeState.index < currentScopeState.entries.length - 1) {
      router.push(currentScopeState.entries[currentScopeState.index + 1] ?? pathname);
    }
  }, [currentScopeState.entries, currentScopeState.index, pathname, router]);

  const value = useMemo<NavigationHistoryContextValue>(
    () => ({
      canGoBack: currentScopeState.index > 0,
      canGoForward: currentScopeState.index < currentScopeState.entries.length - 1,
      goBack,
      goForward,
    }),
    [currentScopeState.entries.length, currentScopeState.index, goBack, goForward],
  );

  return <NavigationHistoryContext.Provider value={value}>{children}</NavigationHistoryContext.Provider>;
}

export function usePageHistoryMemory() {
  const context = useContext(NavigationHistoryContext);

  if (!context) {
    throw new Error("usePageHistoryMemory must be used within a NavigationHistoryProvider");
  }

  return context;
}
