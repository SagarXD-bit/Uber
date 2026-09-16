import type { DriverPin, GeoPoint } from "./types";
import { offsetPoint } from "./geo";
import { uid } from "./storage";

const CARS = [
  { make: "Toyota", model: "Camry", color: "White" },
  { make: "Honda", model: "Civic", color: "Silver" },
  { make: "Tesla", model: "Model 3", color: "Black" },
  { make: "Hyundai", model: "Sonata", color: "Gray" },
  { make: "Toyota", model: "RAV4", color: "Blue" },
  { make: "BMW", model: "5 Series", color: "Black" },
  { make: "Chevy", model: "Suburban", color: "Black" },
  { make: "Mercedes", model: "E-Class", color: "White" },
];

const NAMES = [
  "Jordan Lee",
  "Alex Rivera",
  "Sam Patel",
  "Chris Nguyen",
  "Taylor Brooks",
  "Morgan Diaz",
  "Riley Chen",
  "Casey Walsh",
];

function plate() {
  const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
  const pick = (n: number, src: string) =>
    Array.from({ length: n }, () => src[Math.floor(Math.random() * src.length)]).join("");
  return `${pick(3, letters)}${pick(4, "0123456789")}`;
}

export function spawnDrivers(near: GeoPoint, count = 8): DriverPin[] {
  return Array.from({ length: count }, (_, i) => {
    const car = CARS[i % CARS.length];
    const dLat = (Math.random() - 0.5) * 0.04;
    const dLng = (Math.random() - 0.5) * 0.04;
    return {
      id: uid("drv"),
      name: NAMES[i % NAMES.length],
      rating: Math.round((4.7 + Math.random() * 0.29) * 100) / 100,
      trips: 200 + Math.floor(Math.random() * 4200),
      location: offsetPoint(near, dLat, dLng),
      heading: Math.random() * 360,
      vehicle: { ...car, plate: plate() },
      etaMin: 2 + Math.floor(Math.random() * 8),
    };
  });
}

export function wander(drivers: DriverPin[]): DriverPin[] {
  return drivers.map((d) => ({
    ...d,
    heading: (d.heading + (Math.random() - 0.5) * 40 + 360) % 360,
    location: offsetPoint(
      d.location,
      (Math.random() - 0.5) * 0.002,
      (Math.random() - 0.5) * 0.002
    ),
  }));
}
