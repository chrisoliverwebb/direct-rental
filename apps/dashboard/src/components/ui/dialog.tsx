"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return <DialogContext.Provider value={{ open, setOpen: onOpenChange }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({
  children,
  asChild = false,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const context = useDialogContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => context.setOpen(true),
    });
  }

  return (
    <button type="button" onClick={() => context.setOpen(true)}>
      {children}
    </button>
  );
}

export function DialogContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const context = useDialogContext();

  if (!context.open) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onClick={() => context.setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn("relative w-full max-w-5xl rounded-lg border bg-white shadow-lg", className)}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close dialog"
          className="absolute right-3 top-3 rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          onClick={() => context.setOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("border-b px-6 py-4", className)}>{children}</div>;
}

export function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn("text-base font-semibold text-slate-900", className)}>{children}</h2>;
}

export function DialogDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn("mt-1 text-sm text-muted-foreground", className)}>{children}</p>;
}

export function DialogBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("max-h-[80vh] overflow-y-auto px-6 py-5", className)}>{children}</div>;
}

function useDialogContext() {
  const context = React.useContext(DialogContext);

  if (!context) {
    throw new Error("Dialog components must be used inside <Dialog>.");
  }

  return context;
}
