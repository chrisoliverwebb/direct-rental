import React from "react";
import { render, type RenderResult } from "@testing-library/react";
import { AppProviders } from "@/providers/AppProviders";

export const renderWithProviders = (ui: React.ReactElement): RenderResult =>
  render(<AppProviders>{ui}</AppProviders>);
