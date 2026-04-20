"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "default";

type ToastRecord = {
  id: string;
  title: string;
  description?: string;
  kind: ToastKind;
};

type ToastInput = {
  title: string;
  description?: string;
};

const TOAST_DURATION_MS = 4000;
const listeners = new Set<(toasts: ToastRecord[]) => void>();
let toasts: ToastRecord[] = [];

const emit = () => {
  for (const listener of listeners) {
    listener(toasts);
  }
};

const dismiss = (id: string) => {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
};

const pushToast = (kind: ToastKind, input: ToastInput) => {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  toasts = [...toasts, { id, kind, ...input }];
  emit();
  window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
};

export const toast = {
  success(title: string, input: Omit<ToastInput, "title"> = {}) {
    pushToast("success", { title, ...input });
  },
  error(title: string, input: Omit<ToastInput, "title"> = {}) {
    pushToast("error", { title, ...input });
  },
  message(title: string, input: Omit<ToastInput, "title"> = {}) {
    pushToast("default", { title, ...input });
  },
};

export function Toaster() {
  const [items, setItems] = useState<ToastRecord[]>(toasts);

  useEffect(() => {
    const listener = (next: ToastRecord[]) => setItems(next);
    listeners.add(listener);
    setItems(toasts);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "pointer-events-auto rounded-lg border bg-white p-4 shadow-md",
            item.kind === "success" && "border-l-2 border-l-emerald-500",
            item.kind === "error" && "border-l-2 border-l-red-500",
            item.kind === "default" && "border-l-2 border-l-slate-400",
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center",
                item.kind === "success" && "text-emerald-600",
                item.kind === "error" && "text-red-600",
                item.kind === "default" && "text-slate-500",
              )}
            >
              {item.kind === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
              {item.description ? (
                <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
