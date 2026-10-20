"use client"

import * as React from "react"
import Link from "next/link"
import { PlusIcon } from "lucide-react"
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion"

import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

type Ripple = { id: number; x: number; y: number; size: number }

/** GSAP "power3.out" as a cubic-bezier. */
const POWER3_OUT = [0.215, 0.61, 0.355, 1] as const

/**
 * Primary "New job" CTA for the dark header.
 * - Magnetic: drifts toward the cursor (fine pointers only), springs back elastically.
 * - Ripple: ink ripple from the press point.
 * Both are skipped under prefers-reduced-motion.
 */
export function NewJobButton({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const [magnetic, setMagnetic] = React.useState(false)
  const [ripples, setRipples] = React.useState<Ripple[]>([])
  const nextId = React.useRef(0)
  const timers = React.useRef<number[]>([])

  // Magnetic only for mouse/trackpad users who allow motion.
  React.useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)")
    const update = () => setMagnetic(query.matches && !reduceMotion)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [reduceMotion])

  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!magnetic) return
    const rect = event.currentTarget.getBoundingClientRect()
    const offsetX = event.clientX - (rect.left + rect.width / 2)
    const offsetY = event.clientY - (rect.top + rect.height / 2)
    animate(x, offsetX * 0.22, { duration: 0.5, ease: POWER3_OUT })
    animate(y, offsetY * 0.3, { duration: 0.5, ease: POWER3_OUT })
  }

  function onPointerLeave() {
    if (!magnetic) return
    // Under-damped spring ≈ GSAP elastic.out(1, 0.4).
    const spring = { type: "spring", stiffness: 260, damping: 9, mass: 0.7 } as const
    animate(x, 0, spring)
    animate(y, 0, spring)
  }

  function onPointerDown(event: React.PointerEvent<HTMLAnchorElement>) {
    if (reduceMotion) return
    const rect = event.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2.2
    const ripple = {
      id: nextId.current++,
      x: event.clientX - rect.left - size / 2,
      y: event.clientY - rect.top - size / 2,
      size,
    }
    setRipples((list) => [...list, ripple])
    timers.current.push(
      window.setTimeout(() => setRipples((list) => list.filter((r) => r.id !== ripple.id)), 750),
    )
  }

  return (
    // The wrapper carries the magnetic transform; no CSS transition on transform here.
    <motion.div
      style={{ x, y }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn("inline-flex", className)}
    >
      <Link
        href={ROUTES.company.jobs}
        onPointerDown={onPointerDown}
        className="relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-[11px] bg-[#16A34A] px-[18px] text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(22,163,74,0.9)] transition-colors duration-200 hover:bg-[#12923F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4ADE80]"
      >
        <PlusIcon className="relative size-4" aria-hidden />
        <span className="relative">New job</span>
        {ripples.map((r) => (
          <span
            key={r.id}
            aria-hidden
            className="nav-ripple"
            style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
          />
        ))}
      </Link>
    </motion.div>
  )
}
