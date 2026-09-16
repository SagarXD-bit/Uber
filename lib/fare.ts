import { PRODUCTS, type RideProduct } from "./types";
import { haversineMi } from "./geo";
import type { GeoPoint } from "./types";

export function estimateTrip(pickup: GeoPoint, dropoff: GeoPoint) {
  const distanceKm = Math.max(haversineMi(pickup, dropoff) * 1.25 * 1.60934, 0.6);
  const durationMin = Math.max(Math.round(distanceKm * 2.2 + 4), 4);
  return { distanceKm, durationMin };
}

export function quoteFare(product: RideProduct, distanceKm: number, durationMin: number, surge = 1) {
  const option = PRODUCTS.find((p) => p.id === product)!;
  const base = 45 * option.multiplier;
  const perKm = 12 * option.multiplier;
  const perMin = 1.4 * option.multiplier;
  const raw = (base + distanceKm * perKm + durationMin * perMin) * surge;
  return Math.max(Math.round(70 * option.multiplier), Math.round(raw));
}

export function formatMoney(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function formatEta(min: number) {
  if (min < 1) return "Now";
  return `${Math.round(min)} min`;
}
