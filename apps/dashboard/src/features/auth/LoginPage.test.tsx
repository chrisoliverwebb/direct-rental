import React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "@/features/auth/LoginPage";
import { renderWithProviders } from "@/test/render";

const router = {
  push: vi.fn(),
  replace: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/login",
}));

describe("LoginPage", () => {
  beforeEach(() => {
    router.push.mockReset();
    router.replace.mockReset();
  });

  it("validates required login fields", async () => {
    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "bad-email" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid email address")).toBeInTheDocument();
    expect(await screen.findByText("Too small: expected string to have >=8 characters")).toBeInTheDocument();
  });

  it("redirects after successful login", async () => {
    renderWithProviders(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith("/dashboard");
    });
  });
});
