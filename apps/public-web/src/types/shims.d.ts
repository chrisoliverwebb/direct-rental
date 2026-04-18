type LooseComponent = import("react").ComponentType<Record<string, unknown>>;

declare module "leaflet" {
  const L: {
    divIcon(options: {
      className: string;
      html: string;
      iconSize: [number, number];
      iconAnchor: [number, number];
      popupAnchor: [number, number];
    }): unknown;
  };
  export default L;
}

declare module "react-leaflet" {
  export const MapContainer: LooseComponent;
  export const TileLayer: LooseComponent;
  export const Marker: LooseComponent;
  export const Popup: LooseComponent;
}

declare module "canvas-confetti" {
  const confetti: (...args: unknown[]) => unknown;
  export default confetti;
}

declare module "react-router-dom" {
  export const BrowserRouter: LooseComponent;
  export const Routes: LooseComponent;
  export const Route: LooseComponent;
  export const Link: LooseComponent;
  export const NavLink: LooseComponent;
}

