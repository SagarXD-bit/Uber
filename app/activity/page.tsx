"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { formatMoney } from "@/lib/fare";
import { PRODUCTS } from "@/lib/types";

export default function ActivityPage() {
  const { user, ready, rides } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/activity");
  }, [ready, user, router]);

  if (!ready || !user) return <div className="h-screen bg-white" />;

  const mine = rides.filter((r) => r.riderId === user.id || r.driver?.id === user.id);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-2xl px-5 py-8">
        <h1 className="text-3xl font-semibold">Activity</h1>
        {mine.length === 0 && <p className="mt-6 text-neutral-500">No trips yet. Request a ride to get started.</p>}
        <ul className="mt-6 space-y-3">
          {mine.map((r) => (
            <li key={r.id} className="rounded-2xl bg-uber-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{PRODUCTS.find((p) => p.id === r.product)?.name} · {r.status.replace("_", " ")}</div>
                  <p className="mt-1 text-sm text-neutral-600">{r.pickup.address}</p>
                  <p className="text-sm text-neutral-600">→ {r.dropoff.address}</p>
                  <p className="mt-2 text-xs text-neutral-500">
                    {new Date(r.createdAt).toLocaleString()} · {r.distanceMi.toFixed(1)} mi
                    {r.driver ? ` · ${r.driver.name}` : ""}
                    {r.rating ? ` · ${r.rating}★` : ""}
                  </p>
                </div>
                <div className="font-semibold">{formatMoney(r.fare)}</div>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
