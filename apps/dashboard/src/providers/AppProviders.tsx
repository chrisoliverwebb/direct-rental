"use client";

import { AuthProvider } from "@/providers/AuthProvider";
import { MockProvider } from "@/providers/MockProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MockProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
      <Toaster />
    </MockProvider>
  );
}
