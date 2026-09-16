import type { GeoPoint } from "./types";

export const PLACES: GeoPoint[] = [
  { lat: 37.7849, lng: -122.4094, address: "Union Square, San Francisco" },
  { lat: 37.8199, lng: -122.4783, address: "Golden Gate Bridge" },
  { lat: 37.8080, lng: -122.4177, address: "Fisherman's Wharf" },
  { lat: 37.7694, lng: -122.4862, address: "Golden Gate Park" },
  { lat: 37.8024, lng: -122.4058, address: "Coit Tower" },
  { lat: 37.7955, lng: -122.3937, address: "Ferry Building" },
  { lat: 37.7786, lng: -122.3893, address: "Oracle Park" },
  { lat: 37.7680, lng: -122.3877, address: "Chase Center" },
  { lat: 37.7766, lng: -122.3946, address: "Salesforce Tower" },
  { lat: 37.7879, lng: -122.4074, address: "Powell Street Station" },
  { lat: 37.7599, lng: -122.4148, address: "Mission District" },
  { lat: 37.7597, lng: -122.4269, address: "Castro Theatre" },
  { lat: 37.8014, lng: -122.4300, address: "Palace of Fine Arts" },
  { lat: 37.7715, lng: -122.4136, address: "Twitter / X HQ, Market St" },
  { lat: 37.6213, lng: -122.3790, address: "San Francisco International Airport" },
  { lat: 37.8078, lng: -122.4750, address: "Presidio Tunnel Tops" },
  { lat: 37.7956, lng: -122.4028, address: "Transamerica Pyramid" },
  { lat: 37.7847, lng: -122.4009, address: "Moscone Center" },
  { lat: 37.7396, lng: -122.4790, address: "San Francisco Zoo" },
  { lat: 37.8265, lng: -122.4229, address: "Alcatraz Island Ferry" },
];

export function filterPlaces(q: string): GeoPoint[] {
  const s = q.trim().toLowerCase();
  if (!s) return PLACES.slice(0, 6);
  return PLACES.filter((p) => p.address.toLowerCase().includes(s)).slice(0, 6);
}
