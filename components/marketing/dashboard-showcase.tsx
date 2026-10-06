"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion"
import {
  ArrowRightIcon,
  CheckIcon,
  RefreshCwIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  type LucideIcon,
} from "lucide-react"

import { Icon3DCanvas } from "@/components/marketing/three/icon-3d-canvas"
import type { IconKey } from "@/components/marketing/three/icon-models"
import { ThreeCanvas } from "@/components/marketing/three/three-canvas"
import { Button } from "@/components/ui/button"

const EASE = [0.22, 1, 0.36, 1] as const

const roles: { model: IconKey; icon: LucideIcon; title: string; text: string }[] = [
  {
    model: "dashboard",
    icon: LayoutDashboardIcon,
    title: "Company admins",
    text: "Run jobs, staff, branding, and reports from one dashboard.",
  },
  {
    model: "phone",
    icon: SmartphoneIcon,
    title: "Inspectors in the field",
    text: "Capture GPS-stamped evidence in the Inspector app — it syncs straight in.",
  },
  {
    model: "shield",
    icon: ShieldCheckIcon,
    title: "Platform admins",
    text: "Manage tenants, billing, and support with role-based access.",
  },
]

const rise = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
}

/** Must match the `pin` variant in globals.css. */
const PIN_QUERY = "(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)"

/**
 * Scroll progress for the 3D sequence. Pinned (desktop): progress through the
 * tall track while the content is held in place. Unpinned (mobile / tablet):
 * progress while the visual itself crosses the viewport.
 */
function useSequenceProgress() {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const visualRef = React.useRef<HTMLDivElement>(null)
  const pinned = useScroll({ target: trackRef, offset: ["start start", "end end"] }).scrollYProgress
  const inline = useScroll({ target: visualRef, offset: ["start 0.95", "end 0.05"] }).scrollYProgress
  const progress = useMotionValue(0)

  React.useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY)
    const source = () => (mq.matches ? pinned : inline)
    const sync = () => progress.set(source().get())
    sync()
    const offPinned = pinned.on("change", () => mq.matches && sync())
    const offInline = inline.on("change", () => !mq.matches && sync())
    mq.addEventListener("change", sync)
    return () => {
      offPinned()
      offInline()
      mq.removeEventListener("change", sync)
    }
  }, [pinned, inline, progress])

  return { trackRef, visualRef, progress }
}

/**
 * "One dashboard for the entire claims operation": copy and roles on the left,
 * a Three.js laptop (company dashboard) + phone (Inspector app) on the right.
 * On desktop the section pins while scroll plays the sequence: closed laptop →
 * lid opens and the dashboard boots → lid closes → the Inspector phone enters.
 */
export function DashboardShowcase() {
  const { trackRef, visualRef, progress } = useSequenceProgress()
  // Cards ease like the 3D scene (which smooths progress itself), so they stay in step.
  const easedProgress = useSpring(progress, { stiffness: 60, damping: 22, mass: 1 })

  return (
    // overflow-x-clip (not overflow-hidden): hidden would break the sticky pin.
    <section className="relative overflow-x-clip py-20 md:py-28 pin:py-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_75%_50%,color-mix(in_oklab,var(--primary)_9%,transparent),transparent_70%)]"
      />
      {/* Taller track = more scroll per step, so the sequence plays at a relaxed pace. */}
      <div ref={trackRef} className="relative pin:h-[520vh]">
      <div className="pin:sticky pin:top-[4.25rem] pin:flex pin:h-[calc(100svh-4.25rem)] pin:items-center">
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
        <motion.div
          className="max-w-xl"
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.35 }}
          transition={{ staggerChildren: 0.08 }}
        >
          <motion.p variants={rise} className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            Company + platform portals
          </motion.p>
          <motion.span
            variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1, transition: { duration: 0.7, ease: EASE } } }}
            className="mt-3 block h-0.5 w-10 origin-left rounded-full bg-primary/70"
          />
          <motion.h2
            variants={rise}
            className="mt-5 text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl lg:text-[2.6rem] lg:leading-[1.15]"
          >
            One dashboard for the entire{" "}
            <span className="rounded bg-primary px-2.5 py-0.5 text-white [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">
              claims operation
            </span>
          </motion.h2>
          <motion.p variants={rise} className="mt-5 leading-relaxed text-muted-foreground sm:text-lg sm:leading-8">
            The office works in the dashboard, inspectors work on their phones — and every job, photo, and report
            lands in the same place.
          </motion.p>

          <ul className="mt-7 flex flex-col gap-2">
            {roles.map((role) => (
              <motion.li
                key={role.title}
                variants={rise}
                className="-mx-3 flex items-center gap-3.5 rounded-xl px-3 py-2 transition-colors duration-300 hover:bg-primary/[0.04]"
              >
                <Icon3DCanvas
                  name={role.model}
                  size={44}
                  fallback={
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <role.icon className="size-4" />
                    </span>
                  }
                />
                <div>
                  <p className="font-semibold text-foreground">{role.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{role.text}</p>
                </div>
              </motion.li>
            ))}
          </ul>

          <motion.div variants={rise} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="group h-12 rounded-full bg-primary-dark px-7 shadow-[0_16px_34px_-14px_rgba(6,55,40,0.75)] transition-all hover:-translate-y-0.5 hover:bg-primary-dark/90"
              render={<Link href="/login?role=company" />}
            >
              Open company portal
              <ArrowRightIcon data-icon="inline-end" className="transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-primary-dark/20 bg-white/60 px-6 text-primary-dark hover:bg-white"
              render={<Link href="/login?role=platform" />}
            >
              Platform admin login
            </Button>
          </motion.div>
        </motion.div>

        <div ref={visualRef} className="relative aspect-[1.25/1] w-full lg:-mr-6">
          <ThreeCanvas
            scene="devices"
            progress={progress}
            fallback={
              <Image
                src="/laptop-view.png"
                alt="RoofClaim admin dashboard on laptop and the Inspector app on a phone"
                width={1152}
                height={864}
                sizes="(max-width: 1024px) 92vw, 44rem"
                className="absolute inset-0 m-auto h-auto w-full select-none drop-shadow-[0_40px_70px_-34px_rgba(6,55,40,0.6)]"
              />
            }
          />
          <FloatingCard
            progress={easedProgress}
            range={[0.28, 0.34]}
            out={[0.54, 0.6]}
            className="top-[8%] left-[2%] sm:left-[4%]"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <RefreshCwIcon className="size-4 animate-spin [animation-duration:3s] motion-reduce:animate-none" />
            </span>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-[#12b76a] motion-reduce:animate-none" />
                Live sync
              </p>
              <p className="text-sm font-semibold text-primary-dark">12 photos from the field</p>
            </div>
          </FloatingCard>
          <FloatingCard
            progress={easedProgress}
            range={[0.84, 0.9]}
            className="right-[2%] bottom-[10%] sm:right-[4%]"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-dark text-white">
              <CheckIcon className="size-4" strokeWidth={3} />
            </span>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Inspector app</p>
              <p className="text-sm font-semibold text-primary-dark">Inspection synced</p>
            </div>
          </FloatingCard>
        </div>
      </div>
      </div>
      </div>
    </section>
  )
}

/**
 * Small status card over the 3D scene: fades and rises in over `range` of the
 * scroll progress and, if `out` is given, fades back out over that slice.
 */
function FloatingCard({
  progress,
  range,
  out,
  className,
  children,
}: {
  progress: MotionValue<number>
  range: [number, number]
  out?: [number, number]
  className?: string
  children: React.ReactNode
}) {
  const stops = out ? [range[0], range[1], out[0], out[1]] : range
  const opacity = useTransform(progress, stops, out ? [0, 1, 1, 0] : [0, 1])
  const y = useTransform(progress, stops, out ? [18, 0, 0, -12] : [18, 0])
  const scale = useTransform(progress, stops, out ? [0.94, 1, 1, 0.97] : [0.94, 1])
  return (
    <motion.div style={{ opacity, y, scale }} className={`absolute z-10 ${className ?? ""}`}>
      <div className="flex items-center gap-3 rounded-2xl border border-black/[0.04] bg-white/90 px-3.5 py-3 shadow-[0_24px_48px_-24px_rgba(6,55,40,0.4),0_2px_6px_rgba(6,55,40,0.05)] backdrop-blur">
        {children}
      </div>
    </motion.div>
  )
}
