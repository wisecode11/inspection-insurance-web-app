"use client"

import * as React from "react"
import { useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

type Particle = {
  /** Angle on the lower semicircle (0 = right, π = left, π/2 = bottom). */
  angle: number
  /** Distance from glow center, as fraction of max radius. */
  radiusT: number
  speed: number
  wobble: number
  wobbleSpeed: number
  phase: number
  size: number
  alpha: number
  /** RGB channels for this particle. */
  color: [number, number, number]
}

const PARTICLE_COLORS: [number, number, number][] = [
  [234, 88, 12], // orange
  [28, 54, 59], // dark teal
  [16, 185, 129], // emerald
  [14, 165, 233], // sky
  [168, 85, 247], // violet
  [244, 63, 94], // rose
  [234, 179, 8], // amber
  [99, 102, 241], // indigo
]

/**
 * Hero glow + orange sparkles that already sit in an invisible lower
 * half-circle under the light bar, drifting slowly along that arc
 * (not falling from the top).
 */
export function HeroSparkles({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const wrapRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (reduceMotion) return

    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let running = true
    let particles: Particle[] = []
    let seeded = false
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const { width, height } = wrap.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seeded = false
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const makeParticle = (): Particle => ({
      // Lower half-circle: 0 → π (right → bottom → left)
      angle: Math.random() * Math.PI,
      // Prefer mid ring; keep some near the arc edge
      radiusT: 0.28 + Math.random() * 0.72,
      speed: (Math.random() < 0.5 ? -1 : 1) * (0.00035 + Math.random() * 0.00055),
      wobble: 0.012 + Math.random() * 0.03,
      wobbleSpeed: 0.008 + Math.random() * 0.015,
      phase: Math.random() * Math.PI * 2,
      size: 0.35 + Math.random() * 0.85,
      alpha: 0.3 + Math.random() * 0.55,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    })

    const seed = (count: number) => {
      particles = Array.from({ length: count }, makeParticle)
      seeded = true
    }

    const tick = () => {
      if (!running) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)

      const cx = w * 0.5
      const cy = h * 0.08
      const maxR = Math.min(w * 0.34, h * 0.72)

      if (!seeded) {
        const count = Math.min(110, Math.max(48, Math.floor(w * 0.09)))
        seed(count)
      }

      for (const p of particles) {
        p.angle += p.speed
        // Stay on the lower semicircle; wrap at edges
        if (p.angle < 0) p.angle += Math.PI
        if (p.angle > Math.PI) p.angle -= Math.PI

        p.phase += p.wobbleSpeed
        const radius =
          maxR * p.radiusT * (1 + Math.sin(p.phase) * p.wobble)

        // Polar → cartesian; angle 0 at +x, π/2 at +y (down)
        const x = cx + Math.cos(p.angle) * radius
        const y = cy + Math.sin(p.angle) * radius

        // Soft fade near the left/right tips of the half-circle
        const edge = Math.sin(p.angle)
        const a = p.alpha * (0.35 + 0.65 * edge)
        const [r, g, b] = p.color

        ctx.beginPath()
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.45)`
        ctx.shadowBlur = p.size * 2
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.shadowBlur = 0
        ctx.fillStyle = `rgba(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 20)}, ${a * 0.9})`
        ctx.arc(x, y, p.size * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.shadowBlur = 0
      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)

    return () => {
      running = false
      window.cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [reduceMotion])

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-[1] h-[min(72%,28rem)] overflow-hidden",
        className,
      )}
    >
      <div className="absolute top-[7%] left-1/2 h-px w-[min(72%,36rem)] -translate-x-1/2">
        <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,transparent_0%,rgba(16,185,129,0.15)_18%,rgba(110,231,183,0.95)_48%,rgba(52,211,153,1)_50%,rgba(110,231,183,0.95)_52%,rgba(16,185,129,0.15)_82%,transparent_100%)]" />
        <div className="absolute top-1/2 left-1/2 h-8 w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(110,231,183,0.55)_0%,rgba(16,185,129,0.2)_40%,transparent_72%)] blur-md" />
        <div className="absolute top-1/2 left-1/2 h-16 w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(167,243,208,0.45)_0%,rgba(16,185,129,0.12)_45%,transparent_70%)] blur-xl" />
      </div>

      <div className="absolute top-[7%] left-1/2 h-[85%] w-[min(90%,42rem)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_0%,rgba(110,231,183,0.18)_0%,rgba(16,185,129,0.06)_28%,transparent_62%)]" />

      {!reduceMotion ? (
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      ) : (
        <div className="absolute inset-x-[18%] top-[10%] h-[55%] rounded-[100%] bg-[radial-gradient(ellipse_at_50%_0%,rgba(234,88,12,0.12)_0%,transparent_60%)] opacity-70" />
      )}
    </div>
  )
}
