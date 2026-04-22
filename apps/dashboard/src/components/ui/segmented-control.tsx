"use client";

import { cn } from "@/lib/utils";

type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: Array<SegmentedControlOption<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn("inline-flex w-fit items-center gap-1 rounded-lg bg-slate-50 p-1", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition",
            value === option.value
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-600 hover:bg-white hover:text-slate-900",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
