"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { ArrowRight, Car, Shield, Wallet } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <Navbar dark />
      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Go anywhere with Uber
            </h1>
            <p className="mt-5 max-w-md text-neutral-300">
              Request a ride, hop in, and go. Or drive and earn on your schedule. This clone runs fully on Vercel.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => router.push(user ? "/rider" : "/login?next=/rider")}
                className="rounded-lg bg-white px-6 py-3 font-medium text-black"
              >
                Ride now
              </button>
              <button
                onClick={() => router.push(user ? "/driver" : "/login?next=/driver&role=driver")}
                className="rounded-lg border border-neutral-600 px-6 py-3 font-medium"
              >
                Drive with Uber
              </button>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl bg-neutral-900">
            <img
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1400&q=80"
              alt="City ride"
              className="h-72 w-full object-cover md:h-[420px]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
        {[
          { icon: Car, title: "Ride in minutes", body: "Live map, nearby cars, and simulated matching just like the real app." },
          { icon: Wallet, title: "Upfront pricing", body: "See UberX, Comfort, XL, and Black quotes before you confirm." },
          { icon: Shield, title: "Trip history", body: "Every completed ride is saved in this browser so you can rate and review." },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl bg-uber-card p-6">
            <f.icon className="h-7 w-7" />
            <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-neutral-600">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="bg-uber-card">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-14 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-semibold">Ready to roll?</h2>
            <p className="mt-2 text-neutral-600">No API keys required. Deploy to Vercel and share the link.</p>
          </div>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-medium text-white">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
