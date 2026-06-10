"use client";

"use client";

import Image from "next/image";
import Link from "next/link";

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-2.5">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-[1.25rem]">
              <Image
                src="/RadiceLogoNoText_light.svg"
                alt="RaDiCe Logo"
                  fill
                  loading="eager"
                sizes="56"
                className="cover"
              />
            </div>
            <div>
              <p className="text-sm md:text-base font-semibold uppercase tracking-[0.22em] text-slate-900">
                RaDiCe WMS
              </p>
              <p className="mt-1 text-[0.68rem] uppercase tracking-[0.35em] text-slate-500">
                Research Center
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
