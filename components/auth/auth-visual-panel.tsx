"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion"

import { AuthAurora } from "@/components/auth/auth-aurora"
import { useAuthSceneState } from "@/components/auth/auth-scene-context"
import { BrandMark } from "@/components/brand-mark"
import { cn } from "@/lib/utils"

const EvidenceScene = dynamic(() => import("@/components/auth/evidence-scene"), { ssr: false })


export type AuthVisualCopy = {
  eyebrow: string
  tagline: string
  sub: string
}

/* Both edges curve; the outer one sits off-screen. Same command layout so `d` can morph. */
const CURVE_A =
  "M0.045,0 L0.955,0 C1,0.22 0.93,0.42 0.965,0.6 C1,0.78 1,0.88 0.95,1 L0.05,1 C0,0.88 0,0.78 0.035,0.6 C0.07,0.42 0,0.22 0.045,0 Z"
const CURVE_B =
  "M0.04,0 L0.96,0 C0.925,0.25 1,0.45 0.96,0.62 C0.93,0.8 0.99,0.9 0.955,1 L0.045,1 C0.01,0.9 0.07,0.8 0.04,0.62 C0,0.45 0.075,0.25 0.04,0 Z"

const NUMBER = /-?\d*\.?\d+/g
const CURVE_NUMS_A = CURVE_A.match(NUMBER)!.map(Number)
const CURVE_NUMS_B = CURVE_B.match(NUMBER)!.map(Number)
const CURVE_PARTS = CURVE_A.split(NUMBER)

/** Curve between A (t=0) and B (t=1); both share the same command layout. */
function curveAt(t: number) {
  return CURVE_PARTS.reduce(
    (d, part, i) => d + part + (i < CURVE_NUMS_A.length ? (CURVE_NUMS_A[i] + (CURVE_NUMS_B[i] - CURVE_NUMS_A[i]) * t).toFixed(4) : ""),
    "",
  )
}

const CHECKPOINTS = 4

function statusCopy(status: string, done: number) {
  if (status === "loading") return "Authenticating…"
  if (status === "error") return "Authentication failed"
  if (done >= CHECKPOINTS) return "Ready to connect"
  if (done > 0) return `Securing session · ${done}/${CHECKPOINTS}`
  return "Awaiting credentials"
}

/**
 * Immersive side of the auth experience: aurora, cursor spotlight, the
 * 3D evidence ring (field photos scanned for damage, floating tool icons) and a curved
 * glowing edge. On mobile it becomes the full-screen backdrop behind the form.
 */
export function AuthVisualPanel({
  side,
  overhang,
  copy,
  copyKey,
  className,
}: {
  side: "left" | "right"
  /** Fraction of the panel width hidden off-screen on its outer edge. */
  overhang: number
  copy: AuthVisualCopy
  /** Changes when copy should cross-fade (e.g. login ↔ signup). */
  copyKey: string
  className?: string
}) {
  const state = useAuthSceneState()
  const reduceMotion = useReducedMotion()
  const clipId = `auth-curve-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`

  const effective = state.status === "loading" ? 1 : state.progress
  const done = Math.min(CHECKPOINTS, Math.floor(effective * CHECKPOINTS + 0.001))

  // Slow breathing morph of the curved edge (14s loop).
  const curve = useMotionValue(CURVE_A)
  useAnimationFrame((time) => {
    if (reduceMotion) return
    curve.set(curveAt(0.5 - 0.5 * Math.cos((time / 14000) * Math.PI * 2)))
  })

  // Pointer-following spotlight.
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.4)
  const sx = useSpring(px, { stiffness: 60, damping: 18 })
  const sy = useSpring(py, { stiffness: 60, damping: 18 })
  const spotX = useTransform(sx, (v) => `${v * 100}%`)
  const spotY = useTransform(sy, (v) => `${v * 100}%`)
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${spotX} ${spotY}, rgba(106,232,176,0.12), transparent 65%)`

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion) return
    const rect = event.currentTarget.getBoundingClientRect()
    px.set((event.clientX - rect.left) / rect.width)
    py.set((event.clientY - rect.top) / rect.height)
  }

  // Keep content inside the visible part: skip the off-screen overhang and the curve.
  const inset = side === "left" ? "md:pl-[calc(8vw+2.5rem)] md:pr-24" : "md:pr-[calc(8vw+2.5rem)] md:pl-24"

  return (
    <div
      onPointerMove={onPointerMove}
      className={cn("overflow-hidden bg-[#03140f] md:[clip-path:var(--auth-clip)]", className)}
      style={{ "--auth-clip": `url(#${clipId})` } as React.CSSProperties}
    >
      <svg aria-hidden className="absolute size-0">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <motion.path
              d={curve}
            />
          </clipPath>
        </defs>
      </svg>

      <AuthAurora tone="night" />
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: spotlight }} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_75%_at_50%_45%,transparent_50%,rgba(3,20,15,0.7)_100%),linear-gradient(180deg,rgba(3,20,15,0.35)_0%,transparent_18%,transparent_68%,rgba(3,20,15,0.85)_100%)]"
      />
      {/* 3D evidence ring. Above the vignette so it stays crisp; takes hover itself. */}
      <EvidenceScene state={state} side={side} overhang={overhang} />

      {/* Glowing curved edge */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden size-full md:block"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`${clipId}-stroke`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6ae8b0" stopOpacity="0" />
            <stop offset="45%" stopColor="#6ae8b0" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#12b76a" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <motion.path
          d={curve}
          fill="none"
          stroke={`url(#${clipId}-stroke)`}
          strokeWidth={3}
          vectorEffect="non-scaling-stroke"
          style={{ filter: "drop-shadow(0 0 8px rgba(106,232,176,0.7))" }}
        />
      </svg>

      {/* Copy layer lets the pointer through to the 3D tools; only its controls take hover. */}
      <div
        className={cn(
          "pointer-events-none relative z-10 flex h-full flex-col justify-between p-5 sm:p-7 md:py-9",
          inset,
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <BrandMark href="/" onDark className="pointer-events-auto [&_.text-lg]:text-base" />
          <div
            role="status"
            aria-live="polite"
            className="hidden shrink-0 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.06] py-1.5 pr-3.5 pl-2.5 text-[11px] font-medium whitespace-nowrap text-white/80 backdrop-blur-md lg:flex"
          >
            <span className="relative flex size-2">
              <span
                className={cn(
                  "absolute inset-0 rounded-full",
                  state.status === "error" ? "bg-[#ff7a6b]" : "bg-[#6ae8b0]",
                  state.status === "loading" && "animate-ping",
                )}
              />
              <span
                className={cn("relative size-2 rounded-full", state.status === "error" ? "bg-[#ff7a6b]" : "bg-[#6ae8b0]")}
              />
            </span>
            <span className="font-mono tracking-tight">{statusCopy(state.status, done)}</span>
          </div>
        </div>

        <div className="hidden md:block">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={copyKey}
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[11px] font-semibold tracking-[0.24em] text-[#6ae8b0] uppercase">{copy.eyebrow}</p>
              <p className="mt-3 max-w-lg font-serif text-3xl leading-[1.08] tracking-tight text-white lg:text-[2.6rem]">
                {copy.tagline}
              </p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">{copy.sub}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
