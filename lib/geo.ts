import type { GeoPoint } from "./types";

export function haversineMi(a: GeoPoint, b: GeoPoint): number {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function bearingDeg(a: GeoPoint, b: GeoPoint): number {
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function lerpPoint(a: GeoPoint, b: GeoPoint, t: number): GeoPoint {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
    address: t < 1 ? a.address : b.address,
  };
}

export function pointAlong(route: [number, number][], t: number): GeoPoint {
  if (!route.length) return { lat: 0, lng: 0, address: "" };
  if (t <= 0) return { lat: route[0][0], lng: route[0][1], address: "" };
  if (t >= 1) {
    const last = route[route.length - 1];
    return { lat: last[0], lng: last[1], address: "" };
  }
  const idx = t * (route.length - 1);
  const i = Math.floor(idx);
  const frac = idx - i;
  const p = route[i];
  const n = route[Math.min(i + 1, route.length - 1)];
  return {
    lat: p[0] + (n[0] - p[0]) * frac,
    lng: p[1] + (n[1] - p[1]) * frac,
    address: "",
  };
}

export function offsetPoint(origin: GeoPoint, dLat: number, dLng: number): GeoPoint {
  return {
    lat: origin.lat + dLat,
    lng: origin.lng + dLng,
    address: origin.address,
  };
}

export async function searchPlaces(query: string, near: GeoPoint): Promise<GeoPoint[]> {
  if (!query.trim()) return [];
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${near.lat}&lon=${near.lng}&limit=6`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features || []).map((f: { geometry: { coordinates: number[] }; properties: Record<string, string> }) => {
      const [lng, lat] = f.geometry.coordinates;
      const p = f.properties;
      const address = [p.name, p.street, p.city || p.state].filter(Boolean).join(", ");
      return { lat, lng, address: address || query };
    });
  } catch {
    return [];
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
    const res = await fetch(url);
    if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const data = await res.json();
    const p = data.features?.[0]?.properties;
    if (!p) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    return [p.name, p.street, p.city || p.state].filter(Boolean).join(", ");
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export async function fetchRoute(from: GeoPoint, to: GeoPoint): Promise<[number, number][]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return fallbackRoute(from, to);
    const data = await res.json();
    const coords: [number, number][] = data.routes?.[0]?.geometry?.coordinates || [];
    if (!coords.length) return fallbackRoute(from, to);
    return coords.map(([lng, lat]) => [lat, lng]);
  } catch {
    return fallbackRoute(from, to);
  }
}

function fallbackRoute(from: GeoPoint, to: GeoPoint): [number, number][] {
  const steps = 24;
  const out: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const bend = Math.sin(t * Math.PI) * 0.004;
    out.push([from.lat + (to.lat - from.lat) * t + bend, from.lng + (to.lng - from.lng) * t + bend * 0.6]);
  }
  return out;
}
