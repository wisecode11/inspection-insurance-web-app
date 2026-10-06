"use client"

import * as React from "react"
import { useReducedMotion, type MotionValue } from "framer-motion"

import { cn } from "@/lib/utils"
import type { SceneName } from "@/components/marketing/three/scenes"

/**
 * Three.js layer. `three` and the scene code are only fetched once the canvas
 * comes near the viewport, rendering pauses while it is off screen, and the
 * `fallback` shows instead under prefers-reduced-motion or without WebGL.
 */
export function ThreeCanvas({
  scene,
  className,
  fallback = null,
  progress,
}: {
  scene: SceneName
  className?: string
  fallback?: React.ReactNode
  /** Optional 0..1 value (e.g. scroll progress) the scene animates from. */
  progress?: MotionValue<number>
}) {
  const reduceMotion = useReducedMotion()
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const [failed, setFailed] = React.useState(false)
  const [ready, setReady] = React.useState(false)
  // Shared with the scene; updated without re-rendering React.
  const progressRef = React.useRef({ value: progress?.get() ?? 0 })
  React.useEffect(() => {
    if (!progress) return
    progressRef.current.value = progress.get()
    return progress.on("change", (v) => (progressRef.current.value = v))
  }, [progress])

  React.useEffect(() => {
    if (reduceMotion) return
    const wrap = wrapRef.current
    if (!wrap) return

    let cancelled = false
    let cleanup: (() => void) | undefined

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        import("@/components/marketing/three/scenes")
          .then(({ mountScene }) => {
            if (cancelled) return
            cleanup = mountScene(scene, wrap, progressRef.current)
            setReady(true)
          })
          .catch(() => {
            if (!cancelled) setFailed(true)
          })
      },
      { rootMargin: "300px 0px" },
    )
    io.observe(wrap)

    return () => {
      cancelled = true
      io.disconnect()
      cleanup?.()
    }
  }, [reduceMotion, scene])

  if (reduceMotion || failed) return <>{fallback}</>

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-1000",
        ready ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  )
}
