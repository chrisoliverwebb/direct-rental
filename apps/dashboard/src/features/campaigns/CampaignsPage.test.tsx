import React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CampaignDetailPage } from "@/features/campaigns/CampaignDetailPage";
import { CampaignForm } from "@/features/campaigns/CampaignForm";
import { CampaignsPage } from "@/features/campaigns/CampaignsPage";
import { renderWithProviders } from "@/test/render";

describe("Campaign flows", () => {
  it("renders campaign list data", async () => {
    renderWithProviders(<CampaignsPage />);

    expect(await screen.findByText("Late spring direct-booking push")).toBeInTheDocument();
    expect(await screen.findByText("June half-term early access")).toBeInTheDocument();
  });

  it("validates the create campaign form", async () => {
    const handleSubmit = vi.fn(async () => undefined);
    renderWithProviders(<CampaignForm submitLabel="Save draft" onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Content HTML"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Content text"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    expect(await screen.findByText("Campaign name is required")).toBeInTheDocument();
    expect(await screen.findByText("Subject is required for email campaigns")).toBeInTheDocument();
  });

  it("sends a draft campaign through the mocked flow", async () => {
    renderWithProviders(<CampaignDetailPage campaignId="camp_0001" />);

    expect(await screen.findByText("Draft")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Send now" }));

    await waitFor(() => {
      expect(screen.getByText("Sent")).toBeInTheDocument();
    });
  });
});
