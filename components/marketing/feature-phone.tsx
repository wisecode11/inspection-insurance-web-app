"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type FeaturePhoneItem = {
  title: string
  description: string
  tag: string
  icon: React.ReactNode
  iconClassName: string
}

export function FeaturePhone({
  items,
  className,
}: {
  items: FeaturePhoneItem[]
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [shown, setShown] = React.useState(false)

  // Cascade the cards in once, when the phone scrolls into view.
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Phone showing a list of RoofClaim features"
      className={cn(
        "relative h-[560px] w-[280px] shrink-0 rounded-[46px] bg-black p-[11px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)] dark:bg-zinc-800",
        className,
      )}
    >
      {/* side buttons */}
      <span aria-hidden className="absolute top-[110px] -left-1 h-9 w-1 rounded-l-sm bg-inherit" />
      <span aria-hidden className="absolute top-[160px] -left-1 h-14 w-1 rounded-l-sm bg-inherit" />
      <span aria-hidden className="absolute top-[140px] -right-1 h-[70px] w-1 rounded-r-sm bg-inherit" />

      <div className="beam-edge-screen relative h-full overflow-hidden rounded-[36px] bg-surface">
        {/* dynamic island */}
        <div
          aria-hidden
          className="absolute top-2.5 left-1/2 z-10 h-6 w-20 -translate-x-1/2 rounded-[20px] bg-black"
        >
          <span className="absolute top-1/2 right-2 size-2.5 -translate-y-1/2 rounded-full bg-[#1f2937]" />
        </div>

        {/* status bar */}
        <div
          aria-hidden
          className="flex items-center justify-between px-4 pt-3.5 text-[0.75rem] font-semibold text-foreground"
        >
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 18 11" className="h-[11px]" fill="currentColor">
              <rect x="0" y="7" width="3" height="4" rx="0.6" />
              <rect x="5" y="5" width="3" height="6" rx="0.6" />
              <rect x="10" y="2.5" width="3" height="8.5" rx="0.6" />
              <rect x="15" y="0" width="3" height="11" rx="0.6" />
            </svg>
            <svg viewBox="0 0 16 11" className="h-[11px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M1 4a10 10 0 0 1 14 0" />
              <path d="M3.5 6.6a6.5 6.5 0 0 1 9 0" />
              <circle cx="8" cy="9.4" r="1" fill="currentColor" stroke="none" />
            </svg>
            <svg viewBox="0 0 26 11" className="h-[11px]" fill="none">
              <rect x="0.5" y="0.5" width="21" height="10" rx="2.8" stroke="currentColor" opacity="0.5" />
              <rect x="2" y="2" width="18" height="7" rx="1.6" fill="currentColor" />
              <rect x="23" y="3.6" width="2" height="3.8" rx="1" fill="currentColor" opacity="0.5" />
            </svg>
          </span>
        </div>

        <ul
          data-shown={shown}
          className="flex flex-col gap-3.5 px-3 py-[18px]"
        >
          {items.map((item, i) => (
            <li
              key={item.title}
              className="feature-phone-item rounded-[10px] bg-card px-3 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_10px_-6px_rgba(0,0,0,0.18)]"
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-white",
                    item.iconClassName,
                  )}
                >
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[0.82rem] leading-tight font-medium text-foreground">
                      {item.title}
                    </p>
                    <span className="shrink-0 rounded-full border bg-muted/50 px-1.5 py-px text-[8px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {item.tag}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[0.72rem] leading-[1.45] text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
