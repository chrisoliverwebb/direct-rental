import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const markerIcon = createHomeIcon("#9a5f3c");

export function PropertyMap({ position }: { position: [number, number] }) {
  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={markerIcon}>
        <Popup>
          <div>
            <p className="font-semibold">Foxglove Hollow Cottage</p>
            <p>Illustrative location for your fictional stay near Mereford.</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}

function createHomeIcon(color: string) {
  return L.divIcon({
    className: "custom-map-pin-wrapper",
    html: `<div class="custom-map-home-pin" style="--pin-color:${color}"><span></span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -24],
  });
}
