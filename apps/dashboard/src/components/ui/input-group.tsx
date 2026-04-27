"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function InputGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "group/input-group flex h-9 w-full items-stretch rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring",
        "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

const addonBaseClassName =
  "flex shrink-0 items-center justify-center px-3 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4";

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: "inline-start" | "inline-end";
}) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        addonBaseClassName,
        align === "inline-start" ? "order-[-1] pr-2" : "order-[1] pl-2",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="input-group-text" className={cn(addonBaseClassName, className)} {...props} />;
}

const inputClassName =
  "flex h-full w-full min-w-0 border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 read-only:text-muted-foreground";

const InputGroupInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      data-slot="input-group-input"
      className={cn(
        inputClassName,
        "group-has-[>[data-slot=input-group-addon][data-align=inline-start]]/input-group:pl-0",
        "group-has-[>[data-slot=input-group-addon][data-align=inline-end]]/input-group:pr-0",
        className,
      )}
      {...props}
    />
  ),
);

InputGroupInput.displayName = "InputGroupInput";

const InputGroupTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    data-slot="input-group-textarea"
    className={cn("min-h-[80px] resize-y", inputClassName, className)}
    {...props}
  />
));

InputGroupTextarea.displayName = "InputGroupTextarea";

function InputGroupButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      data-slot="input-group-button"
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center border-l border-input px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
};
