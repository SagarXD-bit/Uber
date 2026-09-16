"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import type { Role } from "@/lib/types";
import { Suspense } from "react";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState("Alex Rider");
  const [email, setEmail] = useState("alex@uber.clone");
  const [role, setRole] = useState<Role>((params.get("role") as Role) || "rider");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    login(name.trim() || "Guest", email.trim() || "guest@uber.clone", role);
    const next = params.get("next") || (role === "driver" ? "/driver" : "/rider");
    router.push(next);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-4">
      <h1 className="text-3xl font-semibold">What&apos;s your name?</h1>
      <p className="text-sm text-neutral-600">Demo login — no password, saved only in this browser.</p>
      <input
        className="w-full rounded-lg bg-uber-card px-4 py-3 outline-none"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
      />
      <input
        className="w-full rounded-lg bg-uber-card px-4 py-3 outline-none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
      />
      <div className="grid grid-cols-2 gap-2">
        {(["rider", "driver"] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`rounded-lg py-3 text-sm font-medium capitalize ${role === r ? "bg-black text-white" : "bg-uber-card"}`}
          >
            {r}
          </button>
        ))}
      </div>
      <button type="submit" className="w-full rounded-lg bg-black py-3 font-medium text-white">
        Continue
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="px-6 py-16">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
