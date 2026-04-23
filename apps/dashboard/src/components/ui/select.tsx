"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type OptionElement = React.ReactElement<React.OptionHTMLAttributes<HTMLOptionElement>>;

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, value, defaultValue, onChange, onBlur, disabled, name, id, ...props }, ref) => {
    const optionElements = React.Children.toArray(children).filter(React.isValidElement) as OptionElement[];
    const options = optionElements.map((option) => ({
      value: String(option.props.value ?? ""),
      label: getOptionLabel(option.props.children),
      disabled: option.props.disabled ?? false,
    }));

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(() => String(defaultValue ?? options[0]?.value ?? ""));
    const selectedValue = String(isControlled ? value : internalValue);
    const selectedOption = options.find((option) => option.value === selectedValue) ?? options[0];

    React.useEffect(() => {
      if (!isControlled) {
        setInternalValue(String(defaultValue ?? options[0]?.value ?? ""));
      }
    }, [defaultValue, isControlled, options]);

    const emitChange = (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }

      onChange?.({
        target: { value: nextValue, name },
        currentTarget: { value: nextValue, name },
      } as React.ChangeEvent<HTMLSelectElement>);
    };

    return (
      <div className="relative">
        <select
          {...props}
          id={id}
          ref={ref}
          name={name}
          value={selectedOption?.value ?? ""}
          onChange={() => {}}
          onBlur={onBlur}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
        >
          {children}
        </select>
        <DropdownMenu>
          <DropdownMenuTrigger
            id={id}
            disabled={disabled}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background pl-3 pr-3 py-2 text-sm ring-offset-background",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
          >
            <span className="truncate">{selectedOption?.label ?? ""}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[180px] p-1">
            {options.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => {
                  if (option.disabled) {
                    return;
                  }

                  emitChange(option.value);
                  onBlur?.({} as React.FocusEvent<HTMLSelectElement>);
                }}
                className={cn("flex items-center justify-between gap-3", option.value === selectedOption?.value && "bg-slate-100")}
              >
                <span className={cn("truncate text-left", option.disabled && "opacity-50")}>{option.label}</span>
                {option.value === selectedOption?.value ? <Check className="h-4 w-4 shrink-0 text-slate-700" /> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
);

Select.displayName = "Select";

function getOptionLabel(children: React.ReactNode) {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  return React.Children.toArray(children).join("");
}
