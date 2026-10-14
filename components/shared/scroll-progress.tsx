"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

/** Routes where the bar is not rendered. */
const HIDDEN_ON = new Set(["/"])

/** Same check as the @supports block in globals.css — only one of CSS / JS drives the bar. */
function supportsScrollTimeline() {
  return (
    typeof CSS !== "undefined" &&
    CSS.supports("animation-timeline: scroll()") &&
    CSS.supports("timeline-scope: --a")
  )
}

/**
 * Thin page-scroll progress bar, fixed to the top of the viewport.
 * Styling + the native scroll-driven animation live in globals.css (.scroll-progress).
 * This component only adds a JS fallback for browsers without scroll timelines.
 * Works with Lenis too, since Lenis drives native scroll positions.
 */
export function ScrollProgress() {
  const barRef = React.useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  React.useEffect(() => {
    const bar = barRef.current
    if (!bar || supportsScrollTimeline()) return

    // Admin pages scroll an inner container; everything else scrolls the document.
    const scroller = document.querySelector<HTMLElement>("[data-scroll-root]")
    const root = document.documentElement
    let frame = 0

    const update = () => {
      frame = 0
      const top = scroller ? scroller.scrollTop : window.scrollY
      const max = scroller
        ? scroller.scrollHeight - scroller.clientHeight
        : root.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, top / max)) : 0
      bar.style.transform = `scaleX(${progress})`
    }
    // At most one update per animation frame.
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    const target: HTMLElement | Window = scroller ?? window
    target.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    // Content that loads after mount changes the scroll height without a scroll event.
    const observer = new ResizeObserver(schedule)
    observer.observe(scroller?.firstElementChild ?? document.body)
    update()

    return () => {
      cancelAnimationFrame(frame)
      target.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      observer.disconnect()
    }
  }, [pathname])

  // Not shown on the marketing home page.
  if (HIDDEN_ON.has(pathname)) return null

  return <div ref={barRef} className="scroll-progress" aria-hidden="true" />
}
