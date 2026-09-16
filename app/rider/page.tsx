"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Star, UserRound, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { PlaceSearch } from "@/components/PlaceSearch";
import { useAuth } from "@/components/AuthProvider";
import { spawnDrivers, wander } from "@/lib/drivers";
import { estimateTrip, formatEta, formatMoney, quoteFare } from "@/lib/fare";
import { bearingDeg, fetchRoute, nearbyPlaces, pointAlong, reverseGeocode } from "@/lib/geo";
import { useGps } from "@/hooks/useGps";
import { uid } from "@/lib/storage";
import { PRODUCTS, SF_CENTER, type DriverPin, type GeoPoint, type Ride, type RideProduct, type RideStatus } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type Phase = RideStatus;

export default function RiderPage() {
  const { user, ready, addRide, updateRide } = useAuth();
  const router = useRouter();
  const { location: gps, status: gpsStatus } = useGps();
  const center = gps || SF_CENTER;
  const [pickup, setPickup] = useState<GeoPoint | null>(null);
  const [dropoff, setDropoff] = useState<GeoPoint | null>(null);
  const [suggestions, setSuggestions] = useState<GeoPoint[]>([]);
  const [gpsLocked, setGpsLocked] = useState(false);
  const [drivers, setDrivers] = useState<DriverPin[]>([]);
  const [product, setProduct] = useState<RideProduct>("uberx");
  const [phase, setPhase] = useState<Phase>("idle");
  const [route, setRoute] = useState<[number, number][]>([]);
  const [pickupRoute, setPickupRoute] = useState<[number, number][]>([]);
  const [tripCar, setTripCar] = useState<DriverPin | null>(null);
  const [progress, setProgress] = useState(0);
  const [rideId, setRideId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [surge] = useState(Math.random() > 0.7 ? 1.2 : 1);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/rider");
  }, [ready, user, router]);

  useEffect(() => {
    if (gps && !gpsLocked) {
      setPickup(gps);
      setGpsLocked(true);
      nearbyPlaces(gps).then(setSuggestions);
      return;
    }
    if (gpsStatus === "denied" && !gpsLocked) {
      setPickup(SF_CENTER);
      setGpsLocked(true);
      nearbyPlaces(SF_CENTER).then(setSuggestions);
    }
  }, [gps, gpsLocked, gpsStatus]);

  useEffect(() => {
    setDrivers(spawnDrivers(center));
  }, [Number(center.lat.toFixed(2)), Number(center.lng.toFixed(2))]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setDrivers((d) => (phase === "idle" || phase === "confirming" ? wander(d) : d));
    }, 1800);
    return () => window.clearInterval(id);
  }, [phase]);

  const stats = useMemo(() => {
    if (!pickup || !dropoff) return null;
    return estimateTrip(pickup, dropoff);
  }, [pickup, dropoff]);

  const quotes = useMemo(() => {
    if (!stats) return [];
    return PRODUCTS.map((p) => ({
      ...p,
      price: quoteFare(p.id, stats.distanceKm, stats.durationMin, surge),
    }));
  }, [stats, surge]);

  useEffect(() => {
    if (!pickup || !dropoff) {
      setRoute([]);
      return;
    }
    fetchRoute(pickup, dropoff).then(setRoute);
  }, [pickup, dropoff]);

  function clearTimer() {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  }

  async function confirmRide() {
    if (!pickup || !dropoff || !stats || !user) return;
    const fare = quoteFare(product, stats.distanceKm, stats.durationMin, surge);
    const id = uid("ride");
    const ride: Ride = {
      id,
      riderId: user.id,
      riderName: user.name,
      pickup,
      dropoff,
      product,
      status: "searching",
      fare,
      distanceKm: stats.distanceKm,
      durationMin: stats.durationMin,
      route,
      createdAt: new Date().toISOString(),
    };
    setRideId(id);
    addRide(ride);
    setPhase("searching");

    window.setTimeout(async () => {
      const nearest = [...drivers].sort((a, b) => {
        const da = Math.hypot(a.location.lat - pickup.lat, a.location.lng - pickup.lng);
        const db = Math.hypot(b.location.lat - pickup.lat, b.location.lng - pickup.lng);
        return da - db;
      })[0];
      const driver = nearest || spawnDrivers(pickup, 1)[0];
      const toPickup = await fetchRoute(driver.location, pickup);
      setPickupRoute(toPickup);
      setTripCar(driver);
      setPhase("accepted");
      updateRide(id, { driver, status: "accepted" });
      animate(toPickup, driver, () => {
        setPhase("arriving");
        updateRide(id, { status: "arriving" });
        window.setTimeout(() => {
          setPhase("in_progress");
          updateRide(id, { status: "in_progress" });
          animate(route.length ? route : toPickup, driver, () => {
            setPhase("completed");
            updateRide(id, { status: "completed", completedAt: new Date().toISOString() });
          });
        }, 1400);
      });
    }, 2200);
  }

  function animate(path: [number, number][], driver: DriverPin, done: () => void) {
    clearTimer();
    const start = Date.now();
    const ms = Math.max(4000, Math.min(path.length * 90, 12000));
    timer.current = window.setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / ms);
      setProgress(t);
      const pos = pointAlong(path, t);
      const next = pointAlong(path, Math.min(1, t + 0.02));
      setTripCar({
        ...driver,
        location: { ...pos, address: driver.location.address },
        heading: bearingDeg(pos, next),
      });
      if (t >= 1) {
        clearTimer();
        done();
      }
    }, 80);
  }

  function reset() {
    clearTimer();
    setPhase("idle");
    setDropoff(null);
    setTripCar(null);
    setProgress(0);
    setRideId(null);
    setPickupRoute([]);
  }

  async function mapClick(lat: number, lng: number) {
    if (phase !== "idle" && phase !== "confirming") return;
    const address = await reverseGeocode(lat, lng);
    const p = { lat, lng, address };
    if (!pickup) setPickup(p);
    else {
      setDropoff(p);
      setPhase("confirming");
    }
  }

  if (!ready || !user) return <div className="h-screen bg-white" />;

  const displayRoute = phase === "accepted" || phase === "arriving" ? pickupRoute : route;
  const sheetDrivers = phase === "idle" || phase === "confirming" ? drivers : [];

  return (
    <div className="flex h-screen flex-col bg-white">
      <Navbar />
      <div className="relative min-h-0 flex-1">
        <MapView
          center={center}
          pickup={pickup}
          dropoff={dropoff}
          route={displayRoute}
          drivers={sheetDrivers}
          tripCar={tripCar}
          userLocation={gps}
          onClick={mapClick}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 md:inset-y-0 md:left-0 md:right-auto md:w-[420px] md:p-4">
          <div className="pointer-events-auto sheet max-h-[70vh] overflow-auto rounded-2xl bg-white p-4 md:max-h-[calc(100vh-6rem)]">
            {phase === "idle" && (
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">Where to?</h2>
                <PlaceSearch
                  label={gpsStatus === "loading" ? "Locating you…" : "Pickup location"}
                  value={pickup?.address || ""}
                  near={center}
                  onSelect={setPickup}
                />
                <PlaceSearch
                  label="Dropoff location"
                  value={dropoff?.address || ""}
                  near={center}
                  autoFocus
                  onSelect={(p) => {
                    setDropoff(p);
                    setPhase("confirming");
                  }}
                />
                <p className="text-xs text-neutral-500">
                  {gpsStatus === "denied"
                    ? "Location permission denied — search or tap the map."
                    : "Using your GPS. Tap the map to change pickup or dropoff."}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestions.slice(0, 4).map((p) => (
                    <button
                      key={p.address}
                      className="rounded-full bg-uber-card px-3 py-1.5 text-xs"
                      onClick={() => {
                        setDropoff(p);
                        setPhase("confirming");
                      }}
                    >
                      {p.address.split(",")[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {phase === "confirming" && stats && (
              <div>
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Choose a ride</h2>
                    <p className="text-xs text-neutral-500">
                      {stats.distanceKm.toFixed(1)} km · {stats.durationMin} min
                      {surge > 1 ? ` · ${surge}x surge` : ""}
                    </p>
                  </div>
                  <button onClick={reset} className="rounded-full p-1 hover:bg-neutral-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="mb-2 truncate text-xs text-neutral-600">{pickup?.address} → {dropoff?.address}</p>
                <div className="space-y-2">
                  {quotes.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setProduct(q.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left ${product === q.id ? "border-black bg-neutral-50" : "border-transparent bg-uber-card"}`}
                    >
                      <div>
                        <div className="font-medium">{q.name}</div>
                        <div className="text-xs text-neutral-500">
                          {q.desc} · {q.seats} seats · {formatEta(q.etaMin)}
                        </div>
                      </div>
                      <div className="text-right font-semibold">{formatMoney(q.price)}</div>
                    </button>
                  ))}
                </div>
                <button onClick={confirmRide} className="mt-4 w-full rounded-lg bg-black py-3 font-medium text-white">
                  Confirm {PRODUCTS.find((p) => p.id === product)?.name}
                </button>
              </div>
            )}

            {phase === "searching" && (
              <div className="py-6 text-center">
                <div className="mx-auto h-12 w-12 rounded-full border-4 border-neutral-200 border-t-black pulse-ring" />
                <h2 className="mt-4 text-xl font-semibold">Finding your driver</h2>
                <p className="text-sm text-neutral-500">Matching nearby UberX cars…</p>
                <button onClick={reset} className="mt-4 text-sm underline">Cancel</button>
              </div>
            )}

            {(phase === "accepted" || phase === "arriving" || phase === "in_progress") && tripCar && (
              <DriverCard
                tripCar={tripCar}
                phase={phase}
                product={product}
                progress={progress}
                pickup={pickup}
                dropoff={dropoff}
                onCancel={reset}
              />
            )}

            {phase === "completed" && rideId && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">You arrived</h2>
                <p className="text-sm text-neutral-600">How was your ride with {tripCar?.name.split(" ")[0]}?</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRating(n)}>
                      <Star className={`h-7 w-7 ${n <= rating ? "fill-black" : "text-neutral-300"}`} />
                    </button>
                  ))}
                </div>
                <button
                  className="w-full rounded-lg bg-black py-3 font-medium text-white"
                  onClick={() => {
                    updateRide(rideId, { rating });
                    reset();
                  }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DriverCard({
  tripCar,
  phase,
  product,
  progress,
  pickup,
  dropoff,
  onCancel,
}: {
  tripCar: DriverPin;
  phase: Phase;
  product: RideProduct;
  progress: number;
  pickup: GeoPoint | null;
  dropoff: GeoPoint | null;
  onCancel: () => void;
}) {
  const title =
    phase === "accepted"
      ? `${tripCar.name.split(" ")[0]} is on the way`
      : phase === "arriving"
        ? "Your driver is here"
        : "Heading to your destination";
  return (
    <div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full bg-black transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-uber-card p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-300">
            <UserRound />
          </div>
          <div>
            <div className="font-medium">{tripCar.name}</div>
            <div className="flex items-center gap-1 text-xs text-neutral-600">
              <Star className="h-3 w-3 fill-black" /> {tripCar.rating} · {tripCar.trips.toLocaleString()} trips
            </div>
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="font-medium">
            {tripCar.vehicle.color} {tripCar.vehicle.make} {tripCar.vehicle.model}
          </div>
          <div className="rounded bg-white px-2 py-0.5 font-mono text-xs">{tripCar.vehicle.plate}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
        <Clock className="h-4 w-4" />
        {phase === "in_progress" ? dropoff?.address : pickup?.address}
      </div>
      <p className="mt-1 text-xs uppercase tracking-wide text-neutral-400">{product}</p>
      {phase !== "in_progress" && (
        <button onClick={onCancel} className="mt-4 w-full rounded-lg bg-neutral-100 py-3 text-sm font-medium">
          Cancel ride
        </button>
      )}
    </div>
  );
}
