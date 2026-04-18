import React from "react";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { renderWithProviders } from "@/test/render";

const router = {
  push: vi.fn(),
  replace: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/dashboard",
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    router.push.mockReset();
    router.replace.mockReset();
  });

  it("redirects unauthenticated users to login", async () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Secret dashboard</div>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/login");
    });
  });
});
