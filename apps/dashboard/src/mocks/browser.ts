import { setupWorker } from "msw/browser";
import { accountHandlers } from "@/mocks/handlers/accountHandlers";
import { authHandlers } from "@/mocks/handlers/authHandlers";
import { marketingHandlers } from "@/mocks/handlers/marketingHandlers";
import { settingsHandlers } from "@/mocks/handlers/settingsHandlers";

export const worker = setupWorker(...accountHandlers, ...authHandlers, ...marketingHandlers, ...settingsHandlers);
