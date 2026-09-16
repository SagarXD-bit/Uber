"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Circle, GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { MapContainer, Marker as LeafletMarker, Polyline as LeafletLine, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { DriverPin, GeoPoint } from "@/lib/types";

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

type Props = {
  center: GeoPoint;
  pickup?: GeoPoint | null;
  dropoff?: GeoPoint | null;
  route?: [number, number][];
  drivers?: DriverPin[];
  tripCar?: DriverPin | null;
  userLocation?: GeoPoint | null;
  onClick?: (lat: number, lng: number) => void;
};

export default function MapView(props: Props) {
  const [googleOk, setGoogleOk] = useState(Boolean(MAPS_KEY));

  useEffect(() => {
    (window as Window & { gm_authFailure?: () => void }).gm_authFailure = () => setGoogleOk(false);
    const t = window.setInterval(() => {
      if (document.querySelector(".gm-err-container")) setGoogleOk(false);
    }, 300);
    return () => window.clearInterval(t);
  }, []);

  if (MAPS_KEY && googleOk) return <GoogleMapView {...props} onFail={() => setGoogleOk(false)} />;
  return <OsmMapView {...props} />;
}

function carSymbol(heading: number) {
  return {
    path: "M12 2 L16 8 L16 20 L8 20 L8 8 Z",
    fillColor: "#111",
    fillOpacity: 1,
    strokeColor: "#fff",
    strokeWeight: 1.5,
    scale: 1.3,
    rotation: heading,
    anchor: new google.maps.Point(12, 12),
  };
}

function GoogleMapView({ center, pickup, dropoff, route = [], drivers = [], tripCar, userLocation, onClick, onFail }: Props & { onFail: () => void }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "uber-google-maps",
    googleMapsApiKey: MAPS_KEY,
  });
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const last = useRef<[number, number] | null>(null);

  const path = useMemo(() => route.map(([lat, lng]) => ({ lat, lng })), [route]);

  useEffect(() => {
    if (!map || typeof google === "undefined") return;
    if (route.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      route.forEach(([lat, lng]) => bounds.extend({ lat, lng }));
      map.fitBounds(bounds, 64);
      return;
    }
    if (pickup && dropoff) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: pickup.lat, lng: pickup.lng });
      bounds.extend({ lat: dropoff.lat, lng: dropoff.lng });
      map.fitBounds(bounds, 80);
      return;
    }
    const prev = last.current;
    if (!prev || Math.hypot(center.lat - prev[0], center.lng - prev[1]) > 0.004) {
      map.setCenter({ lat: center.lat, lng: center.lng });
      map.setZoom(15);
      last.current = [center.lat, center.lng];
    }
  }, [map, center.lat, center.lng, pickup, dropoff, route]);

  useEffect(() => {
    if (loadError) onFail();
  }, [loadError, onFail]);

  if (loadError) return <OsmMapView center={center} pickup={pickup} dropoff={dropoff} route={route} drivers={drivers} tripCar={tripCar} userLocation={userLocation} onClick={onClick} />;
  if (!isLoaded) return <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-500">Loading map…</div>;

  return (
    <GoogleMap
      mapContainerClassName="h-full w-full"
      center={{ lat: center.lat, lng: center.lng }}
      zoom={15}
      onLoad={setMap}
      onClick={(e) => {
        const lat = e.latLng?.lat();
        const lng = e.latLng?.lng();
        if (lat != null && lng != null) onClick?.(lat, lng);
      }}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
        gestureHandling: "greedy",
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        keyboardShortcuts: false,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      }}
    >
      {path.length > 1 && (
        <Polyline path={path} options={{ strokeColor: "#000", strokeWeight: 5, strokeOpacity: 0.9 }} />
      )}
      {userLocation && (
        <>
          <Circle
            center={{ lat: userLocation.lat, lng: userLocation.lng }}
            options={{
              radius: 40,
              fillColor: "#1a73e8",
              fillOpacity: 0.15,
              strokeOpacity: 0,
            }}
          />
          <Marker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#1a73e8",
              fillOpacity: 1,
              strokeColor: "#fff",
              strokeWeight: 3,
            }}
          />
        </>
      )}
      {pickup && (
        <Marker
          position={{ lat: pickup.lat, lng: pickup.lng }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#000",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 3,
          }}
        />
      )}
      {dropoff && (
        <Marker
          position={{ lat: dropoff.lat, lng: dropoff.lng }}
          icon={{
            path: "M 0,0 12,0 12,12 0,12 z",
            scale: 1.2,
            fillColor: "#000",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 3,
            anchor: new google.maps.Point(6, 6),
          }}
        />
      )}
      {drivers.map((d) => (
        <Marker
          key={d.id}
          position={{ lat: d.location.lat, lng: d.location.lng }}
          icon={carSymbol(d.heading)}
        />
      ))}
      {tripCar && (
        <Marker
          position={{ lat: tripCar.location.lat, lng: tripCar.location.lng }}
          icon={carSymbol(tripCar.heading)}
        />
      )}
    </GoogleMap>
  );
}

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const pickupIcon = L.divIcon({ className: "", html: `<div class="dot-pin"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] });
const dropIcon = L.divIcon({ className: "", html: `<div class="sq-pin"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] });
const gpsIcon = L.divIcon({
  className: "",
  html: `<div class="gps-wrap"><div class="gps-pulse"></div><div class="gps-dot"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function leafletCarIcon(heading: number) {
  return L.divIcon({
    className: "car-pin",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<div style="transform:rotate(${heading}deg)">
      <svg width="26" height="26" viewBox="0 0 24 24">
        <rect x="7" y="3" width="10" height="18" rx="3" fill="#111"/>
        <rect x="8.5" y="5" width="7" height="5" rx="1" fill="#9cdcff"/>
        <rect x="8.5" y="14" width="7" height="3" rx="1" fill="#222"/>
      </svg>
    </div>`,
  });
}

function Fit({
  center,
  pickup,
  dropoff,
  route,
}: {
  center: GeoPoint;
  pickup?: GeoPoint | null;
  dropoff?: GeoPoint | null;
  route: [number, number][];
}) {
  const map = useMap();
  const last = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (route.length > 1) {
      map.fitBounds(L.latLngBounds(route.map(([lat, lng]) => [lat, lng])), { padding: [60, 60] });
      return;
    }
    if (pickup && dropoff) {
      map.fitBounds(L.latLngBounds([[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]]), { padding: [80, 80] });
      return;
    }
    const prev = last.current;
    if (!prev || Math.hypot(center.lat - prev[0], center.lng - prev[1]) > 0.004) {
      map.setView([center.lat, center.lng], 15);
      last.current = [center.lat, center.lng];
    }
  }, [map, center.lat, center.lng, pickup, dropoff, route]);
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

function OsmMapView({ center, pickup, dropoff, route = [], drivers = [], tripCar, userLocation, onClick }: Props) {
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={15} zoomControl={false} attributionControl={false} className="h-full w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Fit center={center} pickup={pickup} dropoff={dropoff} route={route} />
      <Clicks onClick={onClick} />
      {route.length > 1 && <LeafletLine positions={route} pathOptions={{ color: "#000", weight: 5, opacity: 0.9 }} />}
      {userLocation && <LeafletMarker position={[userLocation.lat, userLocation.lng]} icon={gpsIcon} />}
      {pickup && <LeafletMarker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
      {dropoff && <LeafletMarker position={[dropoff.lat, dropoff.lng]} icon={dropIcon} />}
      {drivers.map((d) => (
        <LeafletMarker key={d.id} position={[d.location.lat, d.location.lng]} icon={leafletCarIcon(d.heading)} />
      ))}
      {tripCar && (
        <LeafletMarker position={[tripCar.location.lat, tripCar.location.lng]} icon={leafletCarIcon(tripCar.heading)} />
      )}
    </MapContainer>
  );
}
