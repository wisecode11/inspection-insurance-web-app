"use client"

import * as React from "react"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion"

import { cn } from "@/lib/utils"

/**
 * Pointer-driven 3D tilt with an optional glare that follows the cursor.
 * Mouse only; flat under prefers-reduced-motion.
 */
export function TiltCard({
  children,
  className,
  max = 8,
  glare = true,
}: {
  children: React.ReactNode
  className?: string
  /** Maximum tilt in degrees. */
  max?: number
  glare?: boolean
}) {
  const reduceMotion = useReducedMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const spring = { stiffness: 220, damping: 22 }
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring)
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring)
  const glareBg = useTransform(
    [px, py],
    ([x, y]) =>
      `radial-gradient(circle at ${(x as number) * 100}% ${(y as number) * 100}%, rgba(255,255,255,0.35), transparent 55%)`,
  )
  const [hovering, setHovering] = React.useState(false)

  if (reduceMotion) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={cn("relative", className)}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return
        const rect = e.currentTarget.getBoundingClientRect()
        px.set((e.clientX - rect.left) / rect.width)
        py.set((e.clientY - rect.top) / rect.height)
      }}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
      onPointerLeave={() => {
        setHovering(false)
        px.set(0.5)
        py.set(0.5)
      }}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light transition-opacity duration-300"
          style={{ background: glareBg, opacity: hovering ? 1 : 0 }}
        />
      )}
    </motion.div>
  )
}
