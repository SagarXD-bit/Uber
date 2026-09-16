export type Role = "rider" | "driver";

export type RideProduct = "uberx" | "comfort" | "xl" | "black";

export type RideStatus =
  | "idle"
  | "confirming"
  | "searching"
  | "accepted"
  | "arriving"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  rating: number;
  phone: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  address: string;
}

export interface Vehicle {
  make: string;
  model: string;
  color: string;
  plate: string;
}

export interface DriverPin {
  id: string;
  name: string;
  rating: number;
  trips: number;
  location: GeoPoint;
  heading: number;
  vehicle: Vehicle;
  etaMin: number;
}

export interface Ride {
  id: string;
  riderId: string;
  riderName: string;
  driver?: DriverPin;
  pickup: GeoPoint;
  dropoff: GeoPoint;
  product: RideProduct;
  status: RideStatus;
  fare: number;
  distanceKm: number;
  durationMin: number;
  route: [number, number][];
  createdAt: string;
  completedAt?: string;
  rating?: number;
}

export interface ProductOption {
  id: RideProduct;
  name: string;
  desc: string;
  multiplier: number;
  seats: number;
  etaMin: number;
}

export const PRODUCTS: ProductOption[] = [
  { id: "uberx", name: "UberX", desc: "Affordable everyday rides", multiplier: 1, seats: 4, etaMin: 3 },
  { id: "comfort", name: "Comfort", desc: "Newer cars with extra legroom", multiplier: 1.35, seats: 4, etaMin: 5 },
  { id: "xl", name: "UberXL", desc: "SUVs for up to 6 people", multiplier: 1.7, seats: 6, etaMin: 6 },
  { id: "black", name: "Black", desc: "Premium rides in luxury cars", multiplier: 2.4, seats: 4, etaMin: 8 },
];

export const SF_CENTER: GeoPoint = {
  lat: 37.7749,
  lng: -122.4194,
  address: "San Francisco, CA",
};
