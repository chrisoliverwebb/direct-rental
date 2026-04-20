"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ColourInputProps = {
  label: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  allowNone?: boolean;
  fallbackColour?: string;
};

const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function ColourInput({
  label,
  value,
  onChange,
  allowNone = false,
  fallbackColour = "#ffffff",
}: ColourInputProps) {
  const inputId = useId();
  const pickerRef = useRef<HTMLInputElement>(null);
  const [draftValue, setDraftValue] = useState(value ?? "");

  useEffect(() => {
    setDraftValue(value ?? "");
  }, [value]);

  const commitValue = (nextValue: string) => {
    const trimmed = nextValue.trim();
    if (!trimmed) {
      setDraftValue("");
      onChange(undefined);
      return;
    }

    if (HEX_PATTERN.test(trimmed)) {
      const normalised = trimmed.length === 4
        ? `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`
        : trimmed.toLowerCase();
      setDraftValue(normalised);
      onChange(normalised);
      return;
    }

    setDraftValue(value ?? "");
  };

  const activeColour = value && HEX_PATTERN.test(value) ? value : fallbackColour;

  return (
    <label htmlFor={inputId} className="grid gap-2">
      <span className="text-sm font-medium text-slate-900">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => pickerRef.current?.click()}
          className="absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 rounded-full border border-slate-300 shadow-sm"
          style={{ backgroundColor: activeColour }}
          aria-label={`Choose ${label.toLowerCase()}`}
        />
        <Input
          id={inputId}
          value={draftValue}
          onChange={(event) => setDraftValue(event.target.value)}
          onBlur={(event) => commitValue(event.target.value)}
          placeholder={allowNone ? "None or #ffffff" : "#111827"}
          className={cn("pl-11 font-mono text-sm", allowNone ? "pr-20" : "pr-3", !draftValue && allowNone && "text-muted-foreground")}
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {allowNone ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => {
                setDraftValue("");
                onChange(undefined);
              }}
            >
              None
            </Button>
          ) : null}
        </div>
        <input
          ref={pickerRef}
          type="color"
          value={activeColour}
          onChange={(event) => {
            setDraftValue(event.target.value);
            onChange(event.target.value);
          }}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
    </label>
  );
}
