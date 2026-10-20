"use client"

import * as React from "react"
import { useReducedMotion } from "framer-motion"

/**
 * 3D hover tilt + pointer spotlight for metric cards.
 * Spread `bind` on the card; render a spotlight layer that reads `--mx` / `--my`.
 * Tilt runs only for fine pointers and when motion is allowed.
 */
export function useTilt<T extends HTMLElement>({ enabled = true }: { enabled?: boolean } = {}) {
  const reduceMotion = useReducedMotion()
  const ref = React.useRef<T>(null)
  const [transform, setTransform] = React.useState<string | undefined>(undefined)
  const canTilt = React.useRef(false)

  React.useEffect(() => {
    canTilt.current =
      enabled && !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches
  }, [enabled, reduceMotion])

  const onPointerMove = React.useCallback((event: React.PointerEvent<T>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (event.clientX - r.left) / r.width
    const py = (event.clientY - r.top) / r.height
    el.style.setProperty("--mx", `${px * 100}%`)
    el.style.setProperty("--my", `${py * 100}%`)
    if (canTilt.current) {
      setTransform(
        `perspective(800px) rotateX(${(0.5 - py) * 5}deg) rotateY(${(px - 0.5) * 6}deg) translateY(-3px)`,
      )
    }
  }, [])

  const onPointerLeave = React.useCallback(() => setTransform(undefined), [])

  return {
    ref,
    transform,
    bind: { ref, onPointerMove, onPointerLeave },
  }
}
