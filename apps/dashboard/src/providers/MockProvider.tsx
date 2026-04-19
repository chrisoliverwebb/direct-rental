"use client";

import { useEffect, useState } from "react";

export function MockProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === "development";

    if (!isDevelopment) {
      setReady(true);
      return;
    }

    let active = true;

    void import("@/mocks/browser")
      .then(async ({ worker }) => {
        console.info("[MSW] Starting mock service worker", {
          nodeEnv: process.env.NODE_ENV,
        });

        await worker.start({
          onUnhandledRequest: "bypass",
          serviceWorker: {
            url: "/mockServiceWorker.js",
          },
        });

        console.info("[MSW] Mock service worker started");

        if (active) {
          setReady(true);
        }
      })
      .catch((error: unknown) => {
        console.error("[MSW] Failed to start mock service worker", error);

        if (active) {
          setReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Starting mock API...
      </div>
    );
  }

  return <>{children}</>;
}
