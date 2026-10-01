import Image from "next/image"

import { cn } from "@/lib/utils"

type PhoneBubble = {
  top: string
  side: "left" | "right"
  offset: string
  size: string
  opacity: number
  duration: string
  delay: string
  x: string
  y: string
}

const phoneBubbles: PhoneBubble[] = [
  { top: "8%", side: "left", offset: "-14%", size: "7px", opacity: 0.4, duration: "5.2s", delay: "0s", x: "3px", y: "-11px" },
  { top: "18%", side: "left", offset: "-22%", size: "4px", opacity: 0.35, duration: "6.4s", delay: "0.8s", x: "-4px", y: "-8px" },
  { top: "32%", side: "left", offset: "-10%", size: "5px", opacity: 0.42, duration: "4.8s", delay: "1.4s", x: "5px", y: "-12px" },
  { top: "48%", side: "left", offset: "-18%", size: "3px", opacity: 0.3, duration: "5.8s", delay: "0.4s", x: "-3px", y: "-9px" },
  { top: "62%", side: "left", offset: "-12%", size: "6px", opacity: 0.38, duration: "6.1s", delay: "1.1s", x: "4px", y: "-10px" },
  { top: "12%", side: "right", offset: "-16%", size: "5px", opacity: 0.36, duration: "5.5s", delay: "0.6s", x: "-4px", y: "-10px" },
  { top: "28%", side: "right", offset: "-22%", size: "4px", opacity: 0.32, duration: "6.8s", delay: "1.6s", x: "3px", y: "-8px" },
  { top: "44%", side: "right", offset: "-12%", size: "7px", opacity: 0.4, duration: "4.6s", delay: "0.2s", x: "-5px", y: "-12px" },
  { top: "58%", side: "right", offset: "-20%", size: "3px", opacity: 0.28, duration: "5.9s", delay: "1.9s", x: "2px", y: "-7px" },
  { top: "72%", side: "right", offset: "-14%", size: "5px", opacity: 0.34, duration: "6.2s", delay: "0.9s", x: "-3px", y: "-11px" },
]

export function HeroVisual({ className }: { className?: string }) {
  return (
    <div className={cn("relative ml-auto w-full", className)}>
      <div className="relative z-10 flex items-center justify-end gap-4 sm:gap-5 md:gap-6">
        <div className="relative shrink-0">
          {/* Soft olive bubbles near phone — slow float like hero sparkles */}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] overflow-visible">
            {phoneBubbles.map((bubble, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-[#9a8b55]/80 shadow-[0_0_6px_rgba(154,139,85,0.35)] motion-reduce:animate-none"
                style={{
                  top: bubble.top,
                  [bubble.side]: bubble.offset,
                  width: bubble.size,
                  height: bubble.size,
                  opacity: bubble.opacity,
                  animation: `hero-phone-bubble ${bubble.duration} ease-in-out ${bubble.delay} infinite`,
                  ["--bubble-opacity" as string]: String(bubble.opacity),
                  ["--bubble-x" as string]: bubble.x,
                  ["--bubble-y" as string]: bubble.y,
                }}
              />
            ))}
          </div>

          <Image
            src="/mobile-image-hero.png"
            alt="RoofClaim Inspector Portal — field jobs, progress stats, and claim-ready inspections"
            width={346}
            height={721}
            priority
            quality={100}
            className="relative z-10 h-auto w-[11.5rem] select-none drop-shadow-[0_28px_48px_rgba(27,67,50,0.2)] sm:w-[13rem] md:w-[14rem] lg:w-[15rem] xl:w-[16rem]"
            sizes="(max-width: 768px) 42vw, 16rem"
          />
        </div>

        <p
          className="font-serif hidden shrink-0 text-[0.95rem] leading-[1.55] font-normal text-[#9a8d5e] italic sm:block sm:text-[1.05rem] md:text-[1.15rem] lg:text-[1.2rem]"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          Live. Verifiable. Field-Driven.
        </p>
      </div>
    </div>
  )
}
