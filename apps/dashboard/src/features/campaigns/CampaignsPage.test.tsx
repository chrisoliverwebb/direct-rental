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
    expect(screen.getByLabelText("Email content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Paragraph" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    expect(await screen.findByText("Campaign name is required")).toBeInTheDocument();
    expect(await screen.findByText("Subject is required for email campaigns")).toBeInTheDocument();
    expect(await screen.findByText("HTML content is required")).toBeInTheDocument();
  });

  it("allows creating an SMS campaign with simple text input", async () => {
    const handleSubmit = vi.fn(async () => undefined);
    renderWithProviders(<CampaignForm submitLabel="Save draft" onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Summer SMS push" } });
    fireEvent.change(screen.getByLabelText("Channel"), { target: { value: "SMS" } });
    fireEvent.change(screen.getByLabelText("SMS message"), {
      target: { value: "Book direct for summer savings." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "SMS",
        name: "Summer SMS push",
        subject: null,
        previewText: null,
        contentText: "Book direct for summer savings.",
        contentHtml: "<p>Book direct for summer savings.</p>",
      }),
    );
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
