"use client";

import { useId } from "react";
import { AlertTriangle, Check, ChevronDown } from "lucide-react";
import { BRAND_FONTS, DEFAULT_BRAND_FONT, getBrandFontById } from "@/lib/brandFonts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type FontDropdownProps = {
  label: string;
  value?: string;
  onChange: (fontId: string) => void;
  showEmailWarning?: boolean;
  error?: string;
};

export function FontDropdown({ label, value, onChange, showEmailWarning = false, error }: FontDropdownProps) {
  const inputId = useId();
  const selectedFont = getBrandFontById(value) ?? DEFAULT_BRAND_FONT;

  return (
    <div className="grid gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-900">
        {label}
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            error && "border-destructive focus-visible:ring-destructive",
          )}
          style={{ fontFamily: selectedFont.fontFamily }}
        >
          <span className="truncate">{selectedFont.label}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-[320px] min-w-[280px] overflow-y-auto p-1">
          {BRAND_FONTS.map((font) => (
            <DropdownMenuItem key={font.id} onSelect={() => onChange(font.id)} className={cn("flex items-center justify-between gap-3", font.id === selectedFont.id && "bg-slate-100")}>
              <span className="truncate text-left" style={{ fontFamily: font.fontFamily }}>
                {font.label}
              </span>
              <span className={cn("inline-flex shrink-0 items-center gap-1 text-xs", font.emailSafe ? "text-emerald-700" : "text-amber-700")}>
                {font.emailSafe ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {font.emailSafe ? "Email safe" : "Limited email support"}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {showEmailWarning && !selectedFont.emailSafe ? (
        <p className="text-xs text-amber-700">
          This font may not display in all email clients and will fall back to a similar font.
        </p>
      ) : null}
      <span className={cn("min-h-5 text-sm text-destructive", !error && "invisible")}>{error ?? "No error"}</span>
    </div>
  );
}
