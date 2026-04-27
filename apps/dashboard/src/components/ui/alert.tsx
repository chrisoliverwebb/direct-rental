"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("relative w-full rounded-lg border px-4 py-3 text-sm", {
  variants: {
    variant: {
      default: "border-slate-200 bg-white text-slate-900",
      info: "border-sky-200 bg-sky-50 text-sky-950",
      warning: "border-amber-200 bg-amber-50 text-amber-950",
      success: "border-emerald-200 bg-emerald-50 text-emerald-950",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function Alert({
  className,
  variant,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(
        "grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 [&>svg]:mt-0.5 [&>svg]:h-4 [&>svg]:w-4",
        alertVariants({ variant }),
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 data-slot="alert-title" className={cn("font-medium leading-none", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="alert-description" className={cn("text-sm leading-6 text-current/80", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
