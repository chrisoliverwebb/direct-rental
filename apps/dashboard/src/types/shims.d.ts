type LooseComponent = import("react").ComponentType<Record<string, unknown>>;

declare module "leaflet" {
  const L: {
    divIcon(options: {
      className: string;
      html: string;
      iconSize: [number, number];
      iconAnchor: [number, number];
    }): unknown;
  };
  export default L;
}

declare module "react-leaflet" {
  export const MapContainer: LooseComponent;
  export const TileLayer: LooseComponent;
  export const Marker: LooseComponent;
}
