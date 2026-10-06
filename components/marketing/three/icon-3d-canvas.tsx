"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import type { IconKey } from "@/components/marketing/three/icon-models"

/**
 * A live Three.js 3D icon. All instances share one WebGL renderer (see
 * icon-renderer.ts), loaded lazily. `fallback` shows until the first frame is
 * drawn, and stays if WebGL is unavailable.
 */
export function Icon3DCanvas({
  name,
  size = 40,
  fallback,
  className,
}: {
  name: IconKey
  /** CSS pixel size of the square icon. */
  size?: number
  fallback?: React.ReactNode
  className?: string
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = canvas.height = Math.round(size * dpr)

    let cancelled = false
    let unregister: (() => void) | undefined
    import("@/components/marketing/three/icon-renderer")
      .then(({ registerIcon }) => {
        if (cancelled) return
        unregister = registerIcon(canvas, name)
        setReady(true)
      })
      .catch(() => {
        // No WebGL — the fallback stays visible.
      })

    return () => {
      cancelled = true
      unregister?.()
    }
  }, [name, size])

  return (
    <span aria-hidden className={cn("relative inline-flex shrink-0", className)} style={{ width: size, height: size }}>
      {!ready && fallback && <span className="absolute inset-0 flex items-center justify-center">{fallback}</span>}
      <canvas
        ref={canvasRef}
        className={cn("size-full drop-shadow-[0_5px_6px_rgba(6,55,40,0.22)] transition-opacity duration-500", ready ? "opacity-100" : "opacity-0")}
      />
    </span>
  )
}
