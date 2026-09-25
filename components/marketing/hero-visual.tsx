import Image from "next/image"

import { cn } from "@/lib/utils"

export function HeroVisual({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute top-[12%] left-[12%] h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_70%)] blur-3xl"
      />
      <Image
        src="/hero-phone-inspector-hd-1.png"
        alt="RoofClaim Inspector Portal — field jobs, progress stats, and claim-ready inspections"
        width={2048}
        height={2048}
        priority
        quality={100}
        className="relative z-10 -mt-3 h-auto w-full select-none drop-shadow-[0_28px_50px_rgba(27,67,50,0.18)] sm:-mt-4 md:-mt-5"
        sizes="(max-width: 768px) 75vw, 34rem"
      />
    </div>
  )
}
