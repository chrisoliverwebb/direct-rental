import React from "react";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { renderWithProviders } from "@/test/render";

describe("DashboardPage", () => {
  it("renders mocked KPI data", async () => {
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText("Total contacts")).toBeInTheDocument();
    expect(await screen.findByText("36")).toBeInTheDocument();
    expect(await screen.findByText("Recent campaigns")).toBeInTheDocument();
  });
});
