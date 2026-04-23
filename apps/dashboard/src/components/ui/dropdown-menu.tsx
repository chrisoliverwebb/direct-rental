"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("Dropdown menu components must be used within DropdownMenu");
  }

  return context;
}

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || contentRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, onClick, ...props }, ref) => {
  const { open, setOpen, triggerRef } = useDropdownMenuContext();

  return (
    <button
      {...props}
      ref={(node) => {
        triggerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      type="button"
      aria-expanded={open}
      aria-haspopup="menu"
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setOpen((current) => !current);
        }
      }}
    />
  );
});

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export function DropdownMenuContent({
  children,
  className,
  align = "start",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "end";
}) {
  const { open, triggerRef, contentRef } = useDropdownMenuContext();
  const [mounted, setMounted] = React.useState(false);
  const [position, setPosition] = React.useState<{ top: number; left: number; minWidth: number } | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return;
    }

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      setPosition({
        top: rect.bottom + 8 + window.scrollY,
        left: (align === "end" ? rect.right : rect.left) + window.scrollX,
        minWidth: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, open, triggerRef]);

  if (!mounted || !open || !position) {
    return null;
  }

  return createPortal(
    <div
      ref={contentRef}
      role="menu"
      className={cn(
        "z-50 rounded-md border border-slate-200 bg-white p-1 shadow-md",
        align === "end" && "-translate-x-full",
        className,
      )}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        minWidth: position.minWidth,
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

export function DropdownMenuItem({
  children,
  className,
  inset = false,
  onSelect,
}: {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
  onSelect?: () => void;
}) {
  const { setOpen } = useDropdownMenuContext();

  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100",
        inset && "pl-8",
        className,
      )}
      onClick={() => {
        onSelect?.();
        setOpen(false);
      }}
    >
      {children}
    </button>
  );
}
