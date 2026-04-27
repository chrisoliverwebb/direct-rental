"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type OptionElement = React.ReactElement<React.OptionHTMLAttributes<HTMLOptionElement>>;

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectContextValue = {
  value?: string;
  onValueChange?: (value: string) => void;
  selectedLabel?: string;
  setSelectedLabel: (label: string) => void;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext(componentName: string) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error(`${componentName} must be used within Select.`);
  }

  return context;
}

function hasOptionChildren(children: React.ReactNode) {
  return React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && child.type === "option",
  );
}

function LegacySelect({
  className,
  children,
  value,
  defaultValue,
  onChange,
  onBlur,
  disabled,
  name,
  id,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
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
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
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
}

type SelectRootProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
};

export function Select(props: SelectRootProps | React.SelectHTMLAttributes<HTMLSelectElement>) {
  if ("onChange" in props || "name" in props || hasOptionChildren(props.children)) {
    return <LegacySelect {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)} />;
  }

  const { value: controlledValue, defaultValue, onValueChange, children } = props as SelectRootProps;
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [selectedLabel, setSelectedLabel] = React.useState("");
  const value = isControlled ? controlledValue : internalValue;

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, selectedLabel, setSelectedLabel }}>
      <DropdownMenu>{children}</DropdownMenu>
    </SelectContext.Provider>
  );
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuTrigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
  </DropdownMenuTrigger>
));

SelectTrigger.displayName = "SelectTrigger";

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { selectedLabel, value } = useSelectContext("SelectValue");

  return <span className={cn("truncate", !value && "text-muted-foreground")}>{selectedLabel || placeholder || ""}</span>;
}

export function SelectContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <DropdownMenuContent className={cn("min-w-[180px] p-1", className)}>{children}</DropdownMenuContent>;
}

export function SelectGroup({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SelectLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <DropdownMenuLabel className={className}>{children}</DropdownMenuLabel>;
}

export function SelectItem({
  value,
  disabled,
  children,
}: {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const context = useSelectContext("SelectItem");
  const label = getOptionLabel(children);
  const isSelected = context.value === value;

  React.useEffect(() => {
    if (isSelected) {
      context.setSelectedLabel(label);
    }
  }, [context, isSelected, label]);

  return (
    <DropdownMenuItem
      onSelect={() => {
        if (disabled) {
          return;
        }

        context.setSelectedLabel(label);
        context.onValueChange?.(value);
      }}
      className={cn("flex items-center justify-between gap-3", isSelected && "bg-slate-100", disabled && "opacity-50")}
    >
      <span className="truncate text-left">{label}</span>
      {isSelected ? <Check className="h-4 w-4 shrink-0 text-slate-700" /> : null}
    </DropdownMenuItem>
  );
}

function getOptionLabel(children: React.ReactNode) {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  return React.Children.toArray(children).join("");
}
