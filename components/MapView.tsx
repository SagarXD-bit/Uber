"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { DriverPin, GeoPoint } from "@/lib/types";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const pickupIcon = L.divIcon({ className: "", html: `<div class="dot-pin"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] });
const dropIcon = L.divIcon({ className: "", html: `<div class="sq-pin"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] });

function carIcon(heading: number, accent = false) {
  const fill = accent ? "#000" : "#111";
  return L.divIcon({
    className: "car-pin",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<div style="transform:rotate(${heading}deg)">
      <svg width="26" height="26" viewBox="0 0 24 24">
        <rect x="7" y="3" width="10" height="18" rx="3" fill="${fill}"/>
        <rect x="8.5" y="5" width="7" height="5" rx="1" fill="#9cdcff"/>
        <rect x="8.5" y="14" width="7" height="3" rx="1" fill="#222"/>
      </svg>
    </div>`,
  });
}

function Fit({ pickup, dropoff, route }: { pickup?: GeoPoint | null; dropoff?: GeoPoint | null; route: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (route.length > 1) {
      map.fitBounds(L.latLngBounds(route.map(([lat, lng]) => [lat, lng])), { padding: [60, 60] });
      return;
    }
    if (pickup && dropoff) {
      map.fitBounds(
        L.latLngBounds([
          [pickup.lat, pickup.lng],
          [dropoff.lat, dropoff.lng],
        ]),
        { padding: [80, 80] }
      );
    } else if (pickup) {
      map.setView([pickup.lat, pickup.lng], 14);
    }
  }, [map, pickup, dropoff, route]);
  return null;
}

function Clicks({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapView({
  center,
  pickup,
  dropoff,
  route = [],
  drivers = [],
  tripCar,
  onClick,
}: {
  center: GeoPoint;
  pickup?: GeoPoint | null;
  dropoff?: GeoPoint | null;
  route?: [number, number][];
  drivers?: DriverPin[];
  tripCar?: DriverPin | null;
  onClick?: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={13} zoomControl={false} className="h-full w-full">
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; OSM &copy; CARTO" />
      <Fit pickup={pickup} dropoff={dropoff} route={route} />
      <Clicks onClick={onClick} />
      {route.length > 1 && <Polyline positions={route} pathOptions={{ color: "#000", weight: 5, opacity: 0.9 }} />}
      {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
      {dropoff && <Marker position={[dropoff.lat, dropoff.lng]} icon={dropIcon} />}
      {drivers.map((d) => (
        <Marker key={d.id} position={[d.location.lat, d.location.lng]} icon={carIcon(d.heading)} />
      ))}
      {tripCar && (
        <Marker position={[tripCar.location.lat, tripCar.location.lng]} icon={carIcon(tripCar.heading, true)} />
      )}
    </MapContainer>
  );
}
