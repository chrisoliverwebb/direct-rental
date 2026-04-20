import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default:     "bg-primary/10 text-primary",
        secondary:   "bg-secondary text-secondary-foreground",
        success:     "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
        warning:     "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
        destructive: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
        outline:     "border border-input text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
