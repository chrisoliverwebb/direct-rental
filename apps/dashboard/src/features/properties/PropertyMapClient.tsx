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

export function PropertyMapClient({
  latitude,
  longitude,
  label: _label,
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
