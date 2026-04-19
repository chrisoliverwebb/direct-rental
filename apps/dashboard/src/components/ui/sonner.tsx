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
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "pointer-events-auto rounded-lg border bg-white p-4 shadow-lg",
            item.kind === "success" && "border-emerald-200",
            item.kind === "error" && "border-red-200",
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                item.kind === "success" && "bg-emerald-100 text-emerald-700",
                item.kind === "error" && "bg-red-100 text-red-700",
                item.kind === "default" && "bg-slate-100 text-slate-700",
              )}
            >
              {item.kind === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : item.kind === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
              {item.description ? (
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Dismiss toast"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
