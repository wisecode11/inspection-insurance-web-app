"use client"

import Link from "next/link"
import * as React from "react"
import {
  ArrowRightIcon,
} from "lucide-react"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion"

import { Button } from "@/components/ui/button"
import { Icon3D, type Icon3DKey } from "@/components/marketing/icon-3d"
import { cn } from "@/lib/utils"

const STEPS: {
  id: string
  eyebrow: string
  title: string
  description: string
  cta: string
  href: string
  icon3d: Icon3DKey
}[] = [
  {
    id: "account",
    eyebrow: "Get started",
    title: "Create your account",
    description:
      "Open a company workspace in minutes — the roof-to-carrier flow above is what happens next.",
    cta: "Start free trial",
    href: "/signup",
    icon3d: "users",
  },
  {
    id: "setup",
    eyebrow: "Company setup",
    title: "Configure your workspace",
    description:
      "Add organization details, pick a plan, and lock in branding for every report you send.",
    cta: "Continue setup",
    href: "/signup",
    icon3d: "clipboard",
  },
  {
    id: "crew",
    eyebrow: "Your team",
    title: "Invite your crew",
    description:
      "Add inspectors and office staff so jobs land with the right people in the field.",
    cta: "See team tools",
    href: "/login",
    icon3d: "users",
  },
  {
    id: "send",
    eyebrow: "Ship the file",
    title: "Review & send evidence",
    description:
      "Approve the package and export a carrier-ready PDF from one company workspace.",
    cta: "Log in to review",
    href: "/login",
    icon3d: "file",
  },
]

const AUTO_MS = 5200
const SEGMENT_COUNT = STEPS.length - 1

/** Shared shiny beam used by top connectors + bottom card bar. */
function GuideBeam({
  fill,
  paused,
  className,
  trackClassName,
}: {
  fill: number
  paused?: boolean
  className?: string
  trackClassName?: string
}) {
  const width = `${Math.max(0, Math.min(1, fill)) * 100}%`

  return (
    <div className={cn("guide-beam-track", trackClassName, className)} aria-hidden>
      <div
        className="guide-beam-fill"
        data-paused={paused ? "true" : "false"}
        style={{ width }}
      />
    </div>
  )
}

/** Fill for connector between step `index` and `index + 1` — locked to card progress. */
function segmentFill(index: number, active: number, progress: number) {
  if (index < active) return 1
  if (index === active) return progress
  return 0
}

/**
 * Homepage user guide — horizontal step tabs + one featured card.
 * Top + bottom beams share the same progress clock so they move in lockstep.
 */
export function UserGuideSteps() {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = React.useState(0)
  const [direction, setDirection] = React.useState(1)
  const [paused, setPaused] = React.useState(false)
  const [progress, setProgress] = React.useState(0)

  const pausedRef = React.useRef(paused)
  const progressRef = React.useRef(0)
  const lastTsRef = React.useRef<number | null>(null)

  pausedRef.current = paused
  progressRef.current = progress

  const goTo = React.useCallback((index: number) => {
    setActive((current) => {
      setDirection(index >= current ? 1 : -1)
      return index
    })
    progressRef.current = 0
    setProgress(0)
    lastTsRef.current = null
  }, [])

  React.useEffect(() => {
    if (reduceMotion) return

    let frame = 0
    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts
      const delta = ts - lastTsRef.current
      lastTsRef.current = ts

      if (!pausedRef.current) {
        const next = Math.min(1, progressRef.current + delta / AUTO_MS)
        if (next >= 1) {
          progressRef.current = 0
          setProgress(0)
          setDirection(1)
          setActive((current) => (current + 1) % STEPS.length)
        } else if (Math.abs(next - progressRef.current) > 0.001) {
          progressRef.current = next
          setProgress(next)
        }
      }

      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [reduceMotion])

  React.useEffect(() => {
    if (!paused) lastTsRef.current = null
  }, [paused])

  const step = STEPS[active]

  // Last step has no outgoing connector — still drive bottom beam with `progress`.
  // Overall journey (0→1) keeps top trail + bottom bar feeling aligned.
  const journey =
    SEGMENT_COUNT <= 0 ? progress : (active + progress) / STEPS.length

  const slide = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, x: direction * 36, filter: "blur(4px)" },
        animate: { opacity: 1, x: 0, filter: "blur(0px)" },
        exit: { opacity: 0, x: direction * -28, filter: "blur(4px)" },
      }

  return (
    <section id="how-it-works" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-[#F4F8F6] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-8 md:rounded-[2rem] md:p-10 lg:p-12 dark:border-border/40 dark:bg-muted/40">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,55,40,0.12)_0%,rgba(18,183,106,0.08)_42%,transparent_68%)] dark:bg-[linear-gradient(90deg,rgba(18,183,106,0.16)_0%,rgba(18,183,106,0.06)_45%,transparent_70%)]"
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              User guide
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              From signup to carrier-ready file
            </h2>
            <p className="mt-3 text-muted-foreground">
              Four steps your office runs in RoofClaim. Hover the guide to pause —
              the timer picks up where it left off.
            </p>
          </div>

          <div
            className="relative mt-12"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setPaused(false)
              }
            }}
          >
          <nav aria-label="User guide steps" className="mx-auto max-w-3xl">
            <ol className="flex items-center">
              {STEPS.map((item, index) => {
                const isActive = index === active
                const isDone = index < active
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-center",
                      index < STEPS.length - 1 ? "flex-1" : "shrink-0",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => goTo(index)}
                      aria-current={isActive ? "step" : undefined}
                      aria-label={`Step ${index + 1}: ${item.title}`}
                      className={cn(
                        "relative z-[1] flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all sm:size-12",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-[0_12px_28px_-14px_rgba(6,55,40,0.65)] scale-105"
                          : isDone
                            ? "bg-primary/15 text-primary hover:bg-primary/25"
                            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </button>

                    {index < STEPS.length - 1 ? (
                      <div className="mx-2 min-w-4 flex-1 sm:mx-3">
                        <GuideBeam
                          fill={segmentFill(index, active, progress)}
                          paused={paused || reduceMotion === true}
                          trackClassName="h-[3px]"
                        />
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ol>

            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {STEPS.map((item, index) => (
                <button
                  key={`${item.id}-label`}
                  type="button"
                  onClick={() => goTo(index)}
                  className={cn(
                    "truncate text-[11px] font-medium transition-colors sm:text-xs",
                    index === active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.eyebrow}
                </button>
              ))}
            </div>
          </nav>

          <div className="relative mt-10">
            <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-card shadow-[0_24px_50px_-32px_rgba(6,55,40,0.4)]">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={step.id}
                  custom={direction}
                  initial={slide.initial}
                  animate={slide.animate}
                  exit={slide.exit}
                  transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                  className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-7 md:p-8"
                >
                  <motion.span
                    className="flex size-14 shrink-0 items-center justify-center"
                    animate={
                      reduceMotion
                        ? undefined
                        : { scale: [0.92, 1.04, 1], rotate: [0, -4, 0] }
                    }
                    transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    <Icon3D name={step.icon3d} size={56} />
                  </motion.span>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      {step.eyebrow}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
                      {step.description}
                    </p>
                  </div>

                  <Button
                    size="lg"
                    className="w-full shrink-0 rounded-full sm:w-auto"
                    render={<Link href={step.href} />}
                  >
                    {step.cta}
                    <ArrowRightIcon data-icon="inline-end" />
                  </Button>
                </motion.div>
              </AnimatePresence>

              {!reduceMotion ? (
                <GuideBeam
                  fill={progress}
                  paused={paused}
                  trackClassName="h-1 rounded-none bg-primary/10"
                />
              ) : (
                <GuideBeam
                  fill={journey}
                  paused
                  trackClassName="h-1 rounded-none bg-primary/10"
                />
              )}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goTo((active - 1 + STEPS.length) % STEPS.length)}
                className="rounded-full border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                Previous
              </button>
              <p className="text-xs text-muted-foreground tabular-nums">
                {active + 1} / {STEPS.length}
              </p>
              <button
                type="button"
                onClick={() => goTo((active + 1) % STEPS.length)}
                className="rounded-full border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}
