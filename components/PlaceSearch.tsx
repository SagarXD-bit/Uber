"use client";

import { useEffect, useState } from "react";
import type { GeoPoint } from "@/lib/types";
import { filterPlaces } from "@/lib/places";
import { searchPlaces } from "@/lib/geo";

export function PlaceSearch({
  label,
  value,
  near,
  onSelect,
  autoFocus,
}: {
  label: string;
  value: string;
  near: GeoPoint;
  onSelect: (p: GeoPoint) => void;
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState(value);
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<GeoPoint[]>(filterPlaces(""));

  useEffect(() => setQ(value), [value]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const local = filterPlaces(q);
      setHits(local);
      if (q.trim().length > 2) {
        const remote = await searchPlaces(q, near);
        if (remote.length) setHits([...local, ...remote].slice(0, 8));
      }
    }, 180);
    return () => clearTimeout(t);
  }, [q, near]);

  return (
    <div className="relative">
      <input
        autoFocus={autoFocus}
        value={q}
        placeholder={label}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        className="w-full rounded-lg bg-uber-card px-4 py-3 text-sm outline-none placeholder:text-neutral-500"
      />
      {open && hits.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-neutral-200 bg-white shadow-xl">
          {hits.map((h, i) => (
            <li key={`${h.lat}-${h.lng}-${i}`}>
              <button
                className="w-full px-4 py-3 text-left text-sm hover:bg-neutral-50"
                onClick={() => {
                  setQ(h.address);
                  setOpen(false);
                  onSelect(h);
                }}
              >
                {h.address}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
