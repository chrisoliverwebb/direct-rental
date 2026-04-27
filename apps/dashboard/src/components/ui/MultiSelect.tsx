"use client";

import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type MultiSelectOption = {
  value: string;
  label: string;
};

export function MultiSelect({
  label,
  options,
  values,
  onValuesChange,
  icon: Icon,
  className,
  contentClassName,
}: {
  label: string;
  options: MultiSelectOption[];
  values: string[];
  onValuesChange: (values: string[]) => void;
  icon?: LucideIcon;
  className?: string;
  contentClassName?: string;
}) {
  const toggleValue = (value: string) => {
    onValuesChange(
      values.includes(value)
        ? values.filter((entry) => entry !== value)
        : [...values, value],
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium ring-offset-background transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className,
        )}
      >
        {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
        <span>{label}</span>
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("w-44", contentClassName)}>
        <div className="grid gap-0.5">
          {options.map((option) => {
            const checked = values.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-slate-100",
                )}
                onClick={() => toggleValue(option.value)}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {checked ? <Check className="h-4 w-4 text-slate-700" /> : null}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
