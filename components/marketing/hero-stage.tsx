"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { CheckIcon, CloudLightningIcon, FileTextIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * The hero's right column: the Inspector app on a forest-green stage disc.
 * The phone tilts toward the pointer and floats; status cards sit on a nearer
 * depth layer so they parallax against it. Static under prefers-reduced-motion.
 */
export function HeroStage({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()

  // Pointer position over the stage, -0.5..0.5, eased with a spring.
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 90, damping: 18, mass: 0.6 })
  const sy = useSpring(my, { stiffness: 90, damping: 18, mass: 0.6 })

  const phoneRotateY = useTransform(sx, [-0.5, 0.5], [-9, 9])
  const phoneRotateX = useTransform(sy, [-0.5, 0.5], [7, -7])
  const phoneX = useTransform(sx, [-0.5, 0.5], [-10, 10])
  const discX = useTransform(sx, [-0.5, 0.5], [8, -8])
  const discY = useTransform(sy, [-0.5, 0.5], [6, -6])

  return (
    <div
      className={cn("relative mx-auto aspect-[1/1.02] w-full max-w-[34rem] sm:aspect-[1/0.95]", className)}
      onPointerMove={(e) => {
        if (reduceMotion || e.pointerType !== "mouse") return
        const rect = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - rect.left) / rect.width - 0.5)
        my.set((e.clientY - rect.top) / rect.height - 0.5)
      }}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
      }}
    >
      {/* Stage disc — far layer */}
      <motion.div
        aria-hidden
        className="absolute top-[16%] left-1/2 aspect-square w-[78%] -translate-x-1/2"
        style={{ x: discX, y: discY }}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: EASE }}
      >
        <div className="absolute -inset-[10%] rounded-full bg-[radial-gradient(circle,rgba(18,183,106,0.28),transparent_68%)] blur-2xl" />
        <div className="absolute inset-0 overflow-hidden rounded-full bg-[radial-gradient(circle_at_30%_25%,#13704f_0%,#0a4b37_45%,#063728_100%)] shadow-[0_50px_90px_-40px_rgba(6,55,40,0.75),inset_0_2px_0_rgba(255,255,255,0.12)]">
          {[0.82, 0.64, 0.46].map((size) => (
            <span
              key={size}
              className="absolute top-1/2 left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08]"
              style={{ width: `${size * 100}%` }}
            />
          ))}
          <span className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.1),transparent_45%)]" />
        </div>
        <span className="hero-ring-spin absolute -inset-[5%] rounded-full border border-dashed border-primary/25" />
      </motion.div>

      {/* Ground shadow */}
      <div
        aria-hidden
        className="hero-shadow-breathe absolute bottom-[3%] left-1/2 h-[5%] w-[40%] -translate-x-1/2 rounded-[100%] bg-primary-dark/30 blur-xl"
      />

      {/* Phone — middle layer */}
      <motion.div
        className="absolute inset-x-0 top-0 bottom-[6%] flex items-end justify-center [perspective:1200px]"
        initial={reduceMotion ? false : { opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
      >
        <motion.div style={{ rotateX: phoneRotateX, rotateY: phoneRotateY, x: phoneX }} className="h-full">
          <div className={cn("h-full", !reduceMotion && "hero-phone-float")}>
            <Image
              src="/marketing/hero-inspector-phone-mirrored.png"
              alt="RoofClaim Inspector app — today's jobs, progress, and inspections in progress"
              width={866}
              height={1586}
              priority
              sizes="(min-width: 1024px) 20rem, 60vw"
              className="h-full w-auto select-none drop-shadow-[0_40px_50px_rgba(6,55,40,0.35)]"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Status cards — near layer */}
      <StatusCard depth={sx} depthY={sy} strength={26} delay={0.7} className="bottom-[4%] left-0 sm:top-[10%] sm:bottom-auto sm:left-[-9%]">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f3ff] text-[#3b82c4]">
          <CloudLightningIcon className="size-4" />
        </span>
        <div>
          <p className="text-[11px] font-medium text-muted-foreground">Storm verified · NOAA</p>
          <p className="text-sm font-semibold text-primary-dark">Hail 1.75&quot; · 06/14</p>
        </div>
        <span className="flex size-5 items-center justify-center rounded-full bg-[#12b76a] text-white">
          <CheckIcon className="size-3" strokeWidth={3} />
        </span>
      </StatusCard>

      <StatusCard depth={sx} depthY={sy} strength={34} delay={0.85} className="top-[46%] right-0 sm:right-[-3%]">
        <ProgressRing value={0.6} />
        <div>
          <p className="text-sm font-semibold text-primary-dark">Inspection</p>
          <p className="text-[11px] font-medium text-muted-foreground">6 of 10 steps</p>
        </div>
      </StatusCard>

      <StatusCard depth={sx} depthY={sy} strength={20} delay={1} className="bottom-[7%] left-[2%] hidden sm:block sm:left-[-8%]">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-dark text-white">
          <FileTextIcon className="size-4" />
        </span>
        <div>
          <p className="text-[11px] font-medium text-muted-foreground">Carrier report</p>
          <p className="text-sm font-semibold text-primary-dark">PDF ready to send</p>
        </div>
      </StatusCard>
    </div>
  )
}

function StatusCard({
  children,
  className,
  depth,
  depthY,
  strength,
  delay,
}: {
  children: ReactNode
  className?: string
  depth: MotionValue<number>
  depthY: MotionValue<number>
  /** Parallax travel in px — larger reads as closer to the viewer. */
  strength: number
  delay: number
}) {
  const reduceMotion = useReducedMotion()
  const x = useTransform(depth, [-0.5, 0.5], [-strength, strength])
  const y = useTransform(depthY, [-0.5, 0.5], [-strength * 0.6, strength * 0.6])

  return (
    <motion.div className={cn("absolute z-20", className)} style={{ x, y }}>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE, delay }}
        className="flex items-center gap-3 rounded-2xl border border-black/[0.04] bg-white px-3.5 py-3 shadow-[0_24px_48px_-24px_rgba(6,55,40,0.4),0_2px_6px_rgba(6,55,40,0.05)]"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function ProgressRing({ value }: { value: number }) {
  const r = 15
  const c = 2 * Math.PI * r
  return (
    <span className="relative flex size-10 shrink-0 items-center justify-center">
      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3.5" className="stroke-primary/10" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="stroke-[#12b76a]"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value)}
        />
      </svg>
      <span className="text-[10px] font-bold text-primary-dark tabular-nums">{Math.round(value * 100)}%</span>
    </span>
  )
}
