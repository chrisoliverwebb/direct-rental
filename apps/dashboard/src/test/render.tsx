import React from "react";
import { render } from "@testing-library/react";
import { AppProviders } from "@/providers/AppProviders";

export const renderWithProviders = (ui: React.ReactElement) =>
  render(<AppProviders>{ui}</AppProviders>);
