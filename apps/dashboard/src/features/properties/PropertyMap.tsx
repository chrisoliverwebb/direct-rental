"use client";

import dynamic from "next/dynamic";

const PropertyMapClient = dynamic(() => import("./PropertyMapClient").then((mod) => mod.PropertyMapClient), {
  ssr: false,
});

export function PropertyMap({
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
    <PropertyMapClient
      latitude={latitude}
      longitude={longitude}
      label={label}
      className={className}
      zoom={zoom}
    />
  );
}
