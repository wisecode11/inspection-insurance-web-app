import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Ghost button on the dark hero band (e.g. "Bulk assign"). */
export const heroGhostButtonClass =
  "inline-flex h-11 items-center gap-2 rounded-xl border border-dashed border-white/30 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/8 disabled:cursor-not-allowed disabled:text-white/70"

/** Primary white button on the dark hero band (e.g. "New job"). */
export const heroPrimaryButtonClass =
  "inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#0A3326] shadow-[0_8px_20px_-10px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-px active:scale-[0.98]"

const BAND_PATTERNS = {
  dots: {
    backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
    backgroundSize: "22px 22px",
  },
  chevron: {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='34'%3E%3Cpath d='M0 30 32 4l32 26' fill='none' stroke='rgba(255,255,255,0.06)' stroke-width='1.5'/%3E%3C/svg%3E\")",
    backgroundSize: "64px 34px",
  },
} as const

/**
 * Full-bleed dark green band that continues the app header behind page content.
 * Position it with `className` (e.g. `-top-6 -bottom-[54px]` or `-top-6 h-32`).
 */
export function HeroBand({
  className,
  pattern = "dots",
}: {
  className?: string
  pattern?: keyof typeof BAND_PATTERNS
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute left-1/2 w-screen -translate-x-1/2", className)}
      style={{ background: "linear-gradient(180deg, #063728 0%, #0A3B2C 100%)" }}
    >
      <div
        className="absolute inset-0"
        style={{
          ...BAND_PATTERNS[pattern],
          maskImage: "linear-gradient(90deg, transparent 30%, #000 85%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 30%, #000 85%)",
        }}
      />
    </div>
  )
}

/**
 * Dark green header band for company list pages (Jobs, Staff, Reports).
 * The band bleeds full-width, continues the app header, and ends halfway
 * behind the DataTable "panel" search bar that follows it.
 */
export function ListPageHero({
  eyebrow = "Company workspace",
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <HeroBand className="-top-6 -bottom-[54px]" />

      <div className="relative z-10 flex flex-wrap items-end justify-between gap-5 pt-3 pb-1">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-[#7CF0B2] uppercase">
            <span className="size-2 rounded-full bg-[#3DD388] shadow-[0_0_0_3px_rgba(61,211,136,0.25)]" />
            {eyebrow}
          </p>
          <h1 className="mt-2.5 text-[clamp(34px,4vw,48px)] leading-none font-bold tracking-[-0.035em] text-white">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#B9D3C7] sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
      </div>
    </div>
  )
}
