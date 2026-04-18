import React from "react";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContactDetailPage } from "@/features/contacts/ContactDetailPage";
import { ContactsPage } from "@/features/contacts/ContactsPage";
import { renderWithProviders } from "@/test/render";

describe("Contacts flows", () => {
  it("renders mocked contacts in the list", async () => {
    renderWithProviders(<ContactsPage />);

    expect(await screen.findByText("sarah.walker1@guestmail.test")).toBeInTheDocument();
  });

  it("renders selected contact details", async () => {
    renderWithProviders(<ContactDetailPage contactId="contact_0001" />);

    expect(await screen.findByText("Sarah Walker")).toBeInTheDocument();
    expect(await screen.findByText("Prefers short breaks and responds well to SMS reminders.")).toBeInTheDocument();
  });
});
