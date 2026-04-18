import { setupWorker } from "msw/browser";
import { authHandlers } from "@/mocks/handlers/authHandlers";
import { marketingHandlers } from "@/mocks/handlers/marketingHandlers";

export const worker = setupWorker(...authHandlers, ...marketingHandlers);
