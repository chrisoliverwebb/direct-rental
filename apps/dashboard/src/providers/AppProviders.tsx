"use client";

import { AuthProvider } from "@/providers/AuthProvider";
import { MockProvider } from "@/providers/MockProvider";
import { QueryProvider } from "@/providers/QueryProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MockProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </MockProvider>
  );
}
