import { PRODUCTS, type RideProduct } from "./types";
import { haversineMi } from "./geo";
import type { GeoPoint } from "./types";

export function estimateTrip(pickup: GeoPoint, dropoff: GeoPoint) {
  const distanceMi = Math.max(haversineMi(pickup, dropoff) * 1.25, 0.4);
  const durationMin = Math.max(Math.round(distanceMi * 3.2 + 4), 4);
  return { distanceMi, durationMin };
}

export function quoteFare(product: RideProduct, distanceMi: number, durationMin: number, surge = 1) {
  const option = PRODUCTS.find((p) => p.id === product)!;
  const base = 2.2 * option.multiplier;
  const perMi = 1.55 * option.multiplier;
  const perMin = 0.28 * option.multiplier;
  const raw = (base + distanceMi * perMi + durationMin * perMin) * surge;
  return Math.max(7.5 * option.multiplier, Math.round(raw * 100) / 100);
}

export function formatMoney(n: number) {
  return `$${n.toFixed(2)}`;
}

export function formatEta(min: number) {
  if (min < 1) return "Now";
  return `${Math.round(min)} min`;
}
