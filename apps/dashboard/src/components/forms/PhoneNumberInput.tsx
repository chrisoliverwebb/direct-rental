"use client";

import * as React from "react";
import * as countryCodes from "country-codes-list";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type PhoneCountry = {
  code: string;
  name: string;
  callingCode: string;
  flag: string;
  searchText: string;
};

const DEFAULT_PHONE_COUNTRY_CODE = "GB";

const PHONE_COUNTRIES: PhoneCountry[] = countryCodes
  .all()
  .filter((country) => country.countryCode && country.countryCallingCode)
  .map((country) => {
    const code = country.countryCode.toUpperCase();
    const callingCode = `+${country.countryCallingCode}`;

    return {
      code,
      name: country.countryNameEn,
      callingCode,
      flag: getFlagEmoji(code),
      searchText: `${country.countryNameEn} ${code} ${callingCode}`.toLowerCase(),
    };
  })
  .sort((left, right) => left.name.localeCompare(right.name));

const PHONE_COUNTRIES_BY_CODE = new Map(PHONE_COUNTRIES.map((country) => [country.code, country]));
const PHONE_COUNTRIES_BY_CALLING_CODE = PHONE_COUNTRIES
  .slice()
  .sort((left, right) => right.callingCode.length - left.callingCode.length);

export type PhoneCountryCode = string;

type PhoneNumberInputProps = {
  label: string;
  countryCode: PhoneCountryCode;
  onCountryChange: (countryCode: PhoneCountryCode) => void;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
};

export function PhoneNumberInput({
  label,
  countryCode,
  onCountryChange,
  value,
  onChange,
  id,
  placeholder = "7700 900123",
  error,
  disabled = false,
}: PhoneNumberInputProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const selectedCountry = getPhoneCountryByCode(countryCode);
  const filteredCountries = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return PHONE_COUNTRIES;
    }

    return PHONE_COUNTRIES.filter((country) => country.searchText.includes(query));
  }, [search]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }

      setOpen(false);
      setSearch("");
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const timeoutId = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [open]);

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      <div ref={containerRef} className="relative">
        <div
          className={cn(
            "flex h-9 w-full items-stretch overflow-hidden rounded-md border border-input bg-transparent shadow-sm transition-colors",
            "focus-within:ring-1 focus-within:ring-ring",
            disabled && "cursor-not-allowed opacity-50",
            error && "border-destructive focus-within:ring-destructive",
          )}
        >
          <button
            type="button"
            disabled={disabled}
            aria-expanded={open}
            aria-haspopup="listbox"
            onClick={() => setOpen((current) => !current)}
            className="flex h-9 w-16 shrink-0 items-center justify-center gap-1 border-r border-slate-200 bg-slate-50 text-lg leading-none"
          >
            <span aria-hidden="true" className="flex items-center justify-center leading-none">
              {selectedCountry.flag}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
          </button>
          <input
            id={id}
            type="tel"
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={error ? true : undefined}
            className={cn(
              "flex h-9 w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground",
              disabled && "cursor-not-allowed",
            )}
          />
        </div>

        {open ? (
          <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[320px] rounded-md border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-200 p-2">
              <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  ref={searchInputRef}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search country"
                  className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div role="listbox" className="max-h-72 overflow-y-auto p-1">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => {
                  const isSelected = country.code === selectedCountry.code;

                  return (
                    <button
                      key={country.code}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm hover:bg-slate-100",
                        isSelected && "bg-slate-100",
                      )}
                      onClick={() => {
                        onCountryChange(country.code);
                        setOpen(false);
                        setSearch("");
                      }}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="text-lg" aria-hidden="true">
                          {country.flag}
                        </span>
                        <span className="truncate text-slate-900">{country.name}</span>
                        <span className="shrink-0 text-slate-500">({country.callingCode})</span>
                      </span>
                      {isSelected ? <Check className="h-4 w-4 shrink-0 text-slate-700" /> : null}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-6 text-sm text-muted-foreground">No countries found.</div>
              )}
            </div>
          </div>
        ) : null}
      </div>
      <span className={cn("min-h-5 text-sm text-destructive", !error && "invisible")}>{error ?? "No error"}</span>
    </div>
  );
}

export function formatPhoneNumber(countryCode: PhoneCountryCode, localNumber: string) {
  const selectedCountry = getPhoneCountryByCode(countryCode);
  const normalizedLocalPhone = localNumber.replace(/[^\d]/g, "").replace(/^0+/, "");
  return normalizedLocalPhone ? `${selectedCountry.callingCode}${normalizedLocalPhone}` : null;
}

export function parsePhoneNumber(value: string | null | undefined) {
  const rawValue = value?.trim() ?? "";
  if (!rawValue) {
    return { countryCode: DEFAULT_PHONE_COUNTRY_CODE, localNumber: "" };
  }

  const normalizedValue = rawValue.startsWith("+") ? rawValue : `+${rawValue}`;
  const matchedCountry = PHONE_COUNTRIES_BY_CALLING_CODE.find((country) => normalizedValue.startsWith(country.callingCode));

  if (!matchedCountry) {
    return { countryCode: DEFAULT_PHONE_COUNTRY_CODE, localNumber: rawValue };
  }

  return {
    countryCode: matchedCountry.code,
    localNumber: normalizedValue.slice(matchedCountry.callingCode.length).trim(),
  };
}

function getPhoneCountryByCode(countryCode: string) {
  return PHONE_COUNTRIES_BY_CODE.get(countryCode.toUpperCase()) ?? PHONE_COUNTRIES_BY_CODE.get(DEFAULT_PHONE_COUNTRY_CODE)!;
}

function getFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (character) => String.fromCodePoint(127397 + character.charCodeAt(0)));
}
