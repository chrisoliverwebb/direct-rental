"use client";

import { useEffect, useMemo, useState } from "react";
import type { Address } from "@repo/api-contracts";
import { Loader2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertyMap } from "@/features/properties/PropertyMap";

type AddressSuggestion = {
  displayName: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postcode: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
};

export function PropertyAddressPicker({
  value,
  onChange,
}: {
  value: Address;
  onChange: (value: Address) => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showManualFields, setShowManualFields] = useState(false);

  const hasCoordinates = value.latitude !== null && value.latitude !== undefined && value.longitude !== null && value.longitude !== undefined;
  const mapLabel = useMemo(() => {
    const lines = [
      value.addressLine1,
      value.city,
      value.postcode,
    ].filter(Boolean);

    return lines.length > 0 ? lines.join(" • ") : undefined;
  }, [value.addressLine1, value.city, value.postcode]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        setHasSearched(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(trimmed)}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Address lookup failed");
        }

        const results = (await response.json()) as NominatimResult[];
        setSuggestions(results.map(toAddressSuggestion));
      } catch (error) {
        if (!controller.signal.aborted) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Find address</span>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for an address or postcode"
            className="pl-9 pr-10"
          />
          {isLoading ? <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" /> : null}
        </div>
        <span className="text-xs text-slate-500">
          Search OpenStreetMap to fill the address and coordinates.
        </span>
      </div>

      {query.trim().length >= 3 ? (
        <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.displayName}-${index}`}
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-3 text-left transition hover:bg-slate-50"
                onClick={() => {
                  onChange({
                    addressLine1: suggestion.addressLine1,
                    addressLine2: suggestion.addressLine2,
                    city: suggestion.city,
                    region: suggestion.region,
                    postcode: suggestion.postcode,
                    country: suggestion.country,
                    latitude: suggestion.latitude,
                    longitude: suggestion.longitude,
                  });
                  setQuery(suggestion.displayName);
                  setSuggestions([]);
                }}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium text-slate-900">{suggestion.addressLine1 ?? suggestion.displayName}</p>
                    <p className="text-sm leading-5 text-slate-500">{suggestion.displayName}</p>
                  </div>
                </div>
              </button>
            ))
          ) : hasSearched && !isLoading ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
              No address suggestions found.
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <div className="grid gap-1">
          <p className="text-sm font-medium text-slate-700">Manual entry</p>
          <p className="text-xs text-slate-500">Use this if search doesn’t find the address you want.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setShowManualFields((open) => !open)}>
          {showManualFields ? "Hide manual fields" : "Enter manually"}
        </Button>
      </div>

      {showManualFields ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <AddressField label="Address line 1" value={value.addressLine1} onChange={(next) => onChange({ ...value, addressLine1: next })} />
            <AddressField label="Address line 2" value={value.addressLine2} onChange={(next) => onChange({ ...value, addressLine2: next })} />
            <AddressField label="Town / city" value={value.city} onChange={(next) => onChange({ ...value, city: next })} />
            <AddressField label="County / region" value={value.region} onChange={(next) => onChange({ ...value, region: next })} />
            <AddressField label="Postcode" value={value.postcode} onChange={(next) => onChange({ ...value, postcode: next })} />
            <AddressField label="Country" value={value.country} onChange={(next) => onChange({ ...value, country: next })} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AddressField
              label="Latitude"
              value={value.latitude?.toString() ?? null}
              onChange={(next) => onChange({ ...value, latitude: next ? Number(next) : null })}
            />
            <AddressField
              label="Longitude"
              value={value.longitude?.toString() ?? null}
              onChange={(next) => onChange({ ...value, longitude: next ? Number(next) : null })}
            />
          </div>
        </>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {hasCoordinates ? (
          <PropertyMap
            latitude={value.latitude as number}
            longitude={value.longitude as number}
            label={mapLabel}
            className="relative h-72 w-full"
            zoom={14}
          />
        ) : (
          <div className="grid h-72 place-items-center px-4 text-center text-sm text-slate-500">
            Search for an address or enter latitude and longitude to preview the map.
          </div>
        )}
      </div>
    </div>
  );
}

function AddressField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <Input value={value ?? ""} onChange={(event) => onChange(nullable(event.target.value))} />
    </label>
  );
}

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    village?: string;
    town?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
};

function toAddressSuggestion(result: NominatimResult): AddressSuggestion {
  const houseNumber = result.address?.house_number?.trim();
  const road = result.address?.road?.trim();
  const addressLine1 = [houseNumber, road].filter(Boolean).join(" ").trim() || road || result.display_name;

  return {
    displayName: result.display_name,
    addressLine1,
    addressLine2: result.address?.suburb ?? result.address?.neighbourhood ?? null,
    city: result.address?.city ?? result.address?.town ?? result.address?.village ?? null,
    region: result.address?.county ?? result.address?.state ?? null,
    postcode: result.address?.postcode ?? null,
    country: result.address?.country ?? null,
    latitude: Number(result.lat),
    longitude: Number(result.lon),
  };
}
