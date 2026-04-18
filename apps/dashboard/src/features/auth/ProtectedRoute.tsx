"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useCurrentUser } from "@/features/auth/hooks";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentUserQuery = useCurrentUser();

  useEffect(() => {
    if (!currentUserQuery.isLoading && !currentUserQuery.data) {
      router.replace("/login");
    }
  }, [currentUserQuery.data, currentUserQuery.isLoading, router]);

  if (currentUserQuery.isLoading) {
    return (
      <div className="p-6">
        <LoadingState rows={4} />
      </div>
    );
  }

  if (!currentUserQuery.data) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
