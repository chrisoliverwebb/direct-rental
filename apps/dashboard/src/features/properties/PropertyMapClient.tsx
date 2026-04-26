"use client";

import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { env } from "@/lib/env";

const propertyMarkerIcon = createPropertyMarkerIcon("#0f172a");
const hasMapTilerKey = env.mapTilerApiKey.trim().length > 0;
const tileUrl = hasMapTilerKey
  ? `https://api.maptiler.com/maps/${env.mapTilerMapId}/256/{z}/{x}/{y}.png?key=${env.mapTilerApiKey}`
  : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const tileAttribution = hasMapTilerKey
  ? '<a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">&copy; OpenStreetMap contributors</a>'
  : '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">&copy; OpenStreetMap contributors</a>';
const attributionLabel = hasMapTilerKey ? "© MapTiler © OpenStreetMap contributors" : "© OpenStreetMap contributors";
const attributionHref = hasMapTilerKey ? "https://www.maptiler.com/copyright/" : "https://www.openstreetmap.org/copyright";

export function PropertyMapClient({
  latitude,
  longitude,
  label,
  className,
  zoom = 13,
}: {
  latitude: number;
  longitude: number;
  label?: string;
  className?: string;
  zoom?: number;
}) {
  return (
    <div className={`property-map-shell ${className ?? ""}`}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        zoomControl={false}
        attributionControl={false}
        className="property-leaflet-map h-full w-full"
      >
        <TileLayer
          attribution={tileAttribution}
          url={tileUrl}
          crossOrigin
        />
        <Marker position={[latitude, longitude]} icon={propertyMarkerIcon} />
      </MapContainer>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(15,23,42,0.08))]" />
      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur">
        Location
      </div>
      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
        {label ? (
          <div className="rounded-full bg-white/92 px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur">
            {label}
          </div>
        ) : (
          <div />
        )}
        <div className="pointer-events-auto rounded-full bg-white/92 px-3 py-1.5 text-[11px] text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur">
          <a
            href={attributionHref}
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-900"
          >
            {attributionLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

function createPropertyMarkerIcon(color: string) {
  return L.divIcon({
    className: "property-map-pin-wrapper",
    html: `<div class="property-map-pin" style="--pin-color:${color}"><span></span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}
