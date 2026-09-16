"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { useAuth } from "./AuthProvider";

export function Navbar({ dark = false }: { dark?: boolean }) {
  const { user, logout } = useAuth();
  const path = usePathname();
  const router = useRouter();
  const home = user?.role === "driver" ? "/driver" : "/rider";

  return (
    <header className={`z-30 flex h-16 items-center justify-between px-5 md:px-8 ${dark ? "bg-black text-white" : "bg-white text-black border-b border-neutral-200"}`}>
      <div className="flex items-center gap-8">
        <Link href={user ? home : "/"} className="flex items-center">
          <Logo invert={dark} className="h-5 w-auto" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/rider" className={linkCls(path === "/rider", dark)}>Ride</Link>
          <Link href="/driver" className={linkCls(path === "/driver", dark)}>Drive</Link>
          {user && <Link href="/activity" className={linkCls(path === "/activity", dark)}>Activity</Link>}
        </nav>
      </div>
      <div className="flex items-center gap-3 text-sm font-medium">
        {user ? (
          <>
            <Link href="/account" className="hidden sm:block">{user.name.split(" ")[0]}</Link>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className={`rounded-full px-4 py-2 ${dark ? "bg-white text-black" : "bg-black text-white"}`}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={dark ? "text-white" : ""}>Log in</Link>
            <Link
              href="/login"
              className={`rounded-full px-4 py-2 ${dark ? "bg-white text-black" : "bg-black text-white"}`}
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

function linkCls(active: boolean, dark: boolean) {
  if (dark) return active ? "text-white" : "text-neutral-300 hover:text-white";
  return active ? "text-black" : "text-neutral-600 hover:text-black";
}
