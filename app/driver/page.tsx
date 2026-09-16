"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { estimateTrip, formatMoney, quoteFare } from "@/lib/fare";
import { fetchRoute } from "@/lib/geo";
import { PLACES } from "@/lib/places";
import { SF_CENTER, type DriverPin, type Ride } from "@/lib/types";
import { uid } from "@/lib/storage";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function DriverPage() {
  const { user, ready, addRide, updateRide } = useAuth();
  const router = useRouter();
  const [online, setOnline] = useState(false);
  const [offer, setOffer] = useState<Ride | null>(null);
  const [active, setActive] = useState<Ride | null>(null);
  const [self, setSelf] = useState<DriverPin | null>(null);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/driver&role=driver");
  }, [ready, user, router]);

  useEffect(() => {
    if (!user) return;
    setSelf({
      id: user.id,
      name: user.name,
      rating: user.rating,
      trips: 128,
      location: SF_CENTER,
      heading: 40,
      vehicle: { make: "Toyota", model: "Prius", color: "White", plate: "8XYZ234" },
      etaMin: 4,
    });
  }, [user]);

  useEffect(() => {
    if (!online || offer || active || !user) return;
    const t = window.setTimeout(() => {
      const pickup = PLACES[Math.floor(Math.random() * 8)];
      const dropoff = PLACES[8 + Math.floor(Math.random() * 8)];
      const stats = estimateTrip(pickup, dropoff);
      const ride: Ride = {
        id: uid("ride"),
        riderId: "guest_rider",
        riderName: ["Maya", "Luis", "Priya", "Noah"][Math.floor(Math.random() * 4)] + " R.",
        pickup,
        dropoff,
        product: "uberx",
        status: "searching",
        fare: quoteFare("uberx", stats.distanceMi, stats.durationMin),
        distanceMi: stats.distanceMi,
        durationMin: stats.durationMin,
        route: [],
        createdAt: new Date().toISOString(),
      };
      setOffer(ride);
    }, 3500);
    return () => window.clearTimeout(t);
  }, [online, offer, active, user]);

  const me = useMemo(() => (self ? [self] : []), [self]);

  async function accept() {
    if (!offer || !self) return;
    const route = await fetchRoute(offer.pickup, offer.dropoff);
    const ride = { ...offer, driver: self, status: "accepted" as const, route };
    setActive(ride);
    setOffer(null);
    addRide(ride);
  }

  function complete() {
    if (!active) return;
    updateRide(active.id, { status: "completed", completedAt: new Date().toISOString() });
    setEarnings((e) => e + active.fare * 0.75);
    setActive(null);
  }

  if (!ready || !user) return <div className="h-screen bg-white" />;

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="relative min-h-0 flex-1">
        <MapView
          center={SF_CENTER}
          pickup={active?.pickup || offer?.pickup}
          dropoff={active?.dropoff || offer?.dropoff}
          route={active?.route || []}
          drivers={me}
        />
        <div className="absolute inset-x-0 bottom-0 p-3 md:left-0 md:right-auto md:top-20 md:w-[400px] md:p-4">
          <div className="sheet rounded-2xl bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-neutral-500">Driver mode</div>
                <div className="text-xl font-semibold">{online ? "You're online" : "You're offline"}</div>
              </div>
              <button
                onClick={() => {
                  setOnline((v) => !v);
                  setOffer(null);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium ${online ? "bg-uber-green text-black" : "bg-black text-white"}`}
              >
                {online ? "Go offline" : "Go online"}
              </button>
            </div>
            <p className="mt-2 text-sm text-neutral-600">Today&apos;s earnings {formatMoney(earnings)}</p>

            {online && !offer && !active && (
              <p className="mt-4 text-sm text-neutral-500">Waiting for nearby ride requests…</p>
            )}

            {offer && (
              <div className="mt-4 rounded-xl bg-uber-card p-3">
                <div className="text-sm font-medium">{offer.riderName} wants a ride</div>
                <p className="mt-1 text-xs text-neutral-600">{offer.pickup.address}</p>
                <p className="text-xs text-neutral-600">→ {offer.dropoff.address}</p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span>{offer.distanceMi.toFixed(1)} mi · {offer.durationMin} min</span>
                  <span className="font-semibold">{formatMoney(offer.fare)}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => setOffer(null)} className="rounded-lg bg-white py-2 text-sm">Decline</button>
                  <button onClick={accept} className="rounded-lg bg-black py-2 text-sm text-white">Accept</button>
                </div>
              </div>
            )}

            {active && (
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium">Trip with {active.riderName}</div>
                <p className="text-xs text-neutral-600">{active.pickup.address} → {active.dropoff.address}</p>
                <button onClick={complete} className="w-full rounded-lg bg-black py-3 text-sm font-medium text-white">
                  Complete trip · {formatMoney(active.fare * 0.75)}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
