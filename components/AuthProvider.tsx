"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Ride, Role, User } from "@/lib/types";
import { loadRides, loadUser, saveRides, saveUser, uid } from "@/lib/storage";

interface AuthCtx {
  user: User | null;
  rides: Ride[];
  ready: boolean;
  login: (name: string, email: string, role: Role) => void;
  logout: () => void;
  addRide: (ride: Ride) => void;
  updateRide: (id: string, patch: Partial<Ride>) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(loadUser());
    setRides(loadRides());
    setReady(true);
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      rides,
      ready,
      login: (name, email, role) => {
        const next: User = {
          id: uid("usr"),
          name,
          email,
          role,
          rating: 4.92,
          phone: "+1 (415) 555-0199",
        };
        setUser(next);
        saveUser(next);
      },
      logout: () => {
        setUser(null);
        saveUser(null);
      },
      addRide: (ride) => {
        setRides((prev) => {
          const next = [ride, ...prev].slice(0, 40);
          saveRides(next);
          return next;
        });
      },
      updateRide: (id, patch) => {
        setRides((prev) => {
          const next = prev.map((r) => (r.id === id ? { ...r, ...patch } : r));
          saveRides(next);
          return next;
        });
      },
    }),
    [user, rides, ready]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
