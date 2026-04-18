import { setupServer } from "msw/node";
import { authHandlers } from "@/mocks/handlers/authHandlers";
import { marketingHandlers } from "@/mocks/handlers/marketingHandlers";

export const server = setupServer(...authHandlers, ...marketingHandlers);
