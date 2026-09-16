import type { Ride, User } from "./types";

const USER_KEY = "uber.clone.user";
const RIDES_KEY = "uber.clone.rides";

export function loadUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (!user) localStorage.removeItem(USER_KEY);
  else localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadRides(): Ride[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RIDES_KEY);
    return raw ? (JSON.parse(raw) as Ride[]) : [];
  } catch {
    return [];
  }
}

export function saveRides(rides: Ride[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RIDES_KEY, JSON.stringify(rides));
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
