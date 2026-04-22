import { setupWorker } from "msw/browser";
import { authHandlers } from "@/mocks/handlers/authHandlers";
import { marketingHandlers } from "@/mocks/handlers/marketingHandlers";
import { settingsHandlers } from "@/mocks/handlers/settingsHandlers";

export const worker = setupWorker(...authHandlers, ...marketingHandlers, ...settingsHandlers);
