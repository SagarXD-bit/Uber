"use client";

import { useEffect, useRef, useState } from "react";
import { reverseGeocode } from "@/lib/geo";
import type { GeoPoint } from "@/lib/types";

export function useGps() {
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "denied">("loading");
  const geocoded = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation((prev) => ({
          lat,
          lng,
          address: prev?.address || "Current location",
        }));
        setStatus("ready");
        if (!geocoded.current) {
          geocoded.current = true;
          reverseGeocode(lat, lng).then((address) => {
            setLocation((prev) => (prev ? { ...prev, address } : prev));
          });
        }
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 8000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return { location, status };
}
