"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Empty({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white px-6 py-10 text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EmptyHeader({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="empty-header" className={cn("grid max-w-md justify-items-center gap-3", className)}>
      {children}
    </div>
  );
}

export function EmptyMedia({
  className,
  variant = "icon",
  children,
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "icon";
}) {
  return (
    <div
      data-slot="empty-media"
      data-variant={variant}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 [&_svg]:h-5 [&_svg]:w-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EmptyTitle({
  className,
  children,
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 data-slot="empty-title" className={cn("text-base font-medium text-slate-900", className)}>
      {children}
    </h3>
  );
}

export function EmptyDescription({
  className,
  children,
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p data-slot="empty-description" className={cn("text-sm leading-6 text-slate-500", className)}>
      {children}
    </p>
  );
}

export function EmptyContent({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="empty-content"
      className={cn("flex flex-col items-center justify-center gap-3", className)}
    >
      {children}
    </div>
  );
}
