"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BackButtonProps =
  | {
      label: string;
      href: string;
      onClick?: never;
      iconOnly?: boolean;
      className?: string;
    }
  | {
      label: string;
      href?: never;
      onClick: () => void;
      iconOnly?: boolean;
      className?: string;
    };

export function BackButton({ label, href, onClick, iconOnly = false, className }: BackButtonProps) {
  const content = (
    <>
      <ChevronLeft className="h-4 w-4" />
      {!iconOnly ? <span>{label}</span> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        className={cn(
          "inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-slate-900",
          iconOnly && "justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground",
          className,
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <Button
      type="button"
      variant={iconOnly ? "ghost" : "outline"}
      size={iconOnly ? "icon" : "sm"}
      onClick={onClick}
      aria-label={label}
      className={cn(!iconOnly && "gap-1", className)}
    >
      {content}
    </Button>
  );
}
