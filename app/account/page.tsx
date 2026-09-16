"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { Star } from "lucide-react";

export default function AccountPage() {
  const { user, ready, rides, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/account");
  }, [ready, user, router]);

  if (!ready || !user) return <div className="h-screen bg-white" />;

  const completed = rides.filter((r) => r.status === "completed" && (r.riderId === user.id || r.driver?.id === user.id));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-xl px-5 py-10">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200 text-2xl font-semibold">
            {user.name.slice(0, 1)}
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{user.name}</h1>
            <p className="text-sm text-neutral-600">{user.email}</p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          <Stat label="Rating" value={`${user.rating}`} icon />
          <Stat label="Trips" value={`${completed.length}`} />
          <Stat label="Role" value={user.role} />
        </div>
        <div className="mt-8 space-y-2 text-sm">
          <Row k="Phone" v={user.phone} />
          <Row k="City" v="San Francisco" />
          <Row k="Payment" v="Visa •• 4242" />
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="mt-10 w-full rounded-lg bg-black py-3 font-medium text-white"
        >
          Log out
        </button>
      </main>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div className="rounded-2xl bg-uber-card p-4">
      <div className="flex items-center justify-center gap-1 text-lg font-semibold">
        {value} {icon && <Star className="h-4 w-4 fill-black" />}
      </div>
      <div className="mt-1 text-xs text-neutral-500">{label}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-uber-card px-4 py-3">
      <span className="text-neutral-500">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
