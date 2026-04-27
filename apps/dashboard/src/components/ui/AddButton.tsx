"use client";

import Link from "next/link";
import { Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AddButtonBaseProps = {
  label: string;
  className?: string;
  icon?: LucideIcon;
};

type AddButtonLinkProps = AddButtonBaseProps & {
  href: string;
  onClick?: never;
};

type AddButtonActionProps = AddButtonBaseProps & {
  href?: never;
  onClick: () => void;
};

type AddButtonProps = AddButtonLinkProps | AddButtonActionProps;

const addButtonClassName = cn(
  "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors",
  "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
);

function AddButtonContent({ label, icon: Icon = Plus }: AddButtonBaseProps) {
  return (
    <>
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </>
  );
}

export function AddButton(props: AddButtonProps) {
  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={cn(addButtonClassName, props.className)}>
        <AddButtonContent label={props.label} icon={props.icon} />
      </Link>
    );
  }

  return (
    <button type="button" className={cn(addButtonClassName, props.className)} onClick={props.onClick}>
      <AddButtonContent label={props.label} icon={props.icon} />
    </button>
  );
}
