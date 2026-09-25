"use client"

import Image from "next/image"
import * as React from "react"
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"

import { Icon3D, type Icon3DKey } from "@/components/marketing/icon-3d"
import { cn } from "@/lib/utils"

const beats = [
  {
    id: "capture",
    step: "01",
    icon3d: "camera" as Icon3DKey,
    title: "Capture the roof",
    text: "Photos, GPS, and test squares on site — the same shots your crew already takes.",
    image: "/marketing/journey-capture.jpg",
    alt: "Inspector photographing a roof with a phone",
  },
  {
    id: "verify",
    step: "02",
    icon3d: "weather" as Icon3DKey,
    title: "Verify the storm",
    text: "Hail and wind hits get matched against NOAA data for the date of loss.",
    image: "/marketing/journey-verify.jpg",
    alt: "Inspector on a roof checking verified storm damage on a phone",
  },
  {
    id: "send",
    step: "03",
    icon3d: "file" as Icon3DKey,
    title: "Send the file",
    text: "Approve the evidence and export a branded, carrier-ready PDF.",
    image: "/marketing/journey-send.jpg",
    alt: "Inspector sending the damage report from a phone",
  },
] as const

type Beat = (typeof beats)[number]

/**
 * The homepage's one dominant scroll-driven story: one photo per step
 * (capture → verify → send) crossfades while the text beside it advances.
 * Desktop (lg+, motion allowed) pins the photo; everyone else gets the
 * same three beats as plain, lightweight scroll-reveal cards.
 */
export function RoofJourney() {
  const reduceMotion = useReducedMotion()

  return (
    // overflow-x-clip (not overflow-hidden): hidden would create a scroll
    // container and silently break the sticky pin below.
    <section className="relative overflow-x-clip">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_55%)]"
      />

      {!reduceMotion && (
        <div className="hidden lg:block">
          <PinnedJourney />
        </div>
      )}
      <div className={cn("relative py-20 md:py-28", !reduceMotion && "lg:hidden")}>
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <SectionHeading />
        </div>
        <div className="mt-14">
          <StackedJourney />
        </div>
      </div>
    </section>
  )
}

function SectionHeading({ align = "center" }: { align?: "center" | "left" }) {
  return (
    <div className={align === "left" ? "text-left" : "text-center"}>
      <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        How a claim file comes together
      </p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.4rem] lg:leading-[1.15]">
        One job, three steps, zero reshoots.
      </h2>
    </div>
  )
}

function PinnedJourney() {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] })
  const progress = useSpring(scrollYProgress, { stiffness: 300, damping: 46, restDelta: 0.001 })
  const stage = useTransform(progress, [0, 1], [0, beats.length])

  return (
    <div ref={trackRef} className="relative h-[320vh]">
      <div className="sticky top-[4.25rem] flex h-[calc(100svh-4.25rem)] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading align="left" />
            <div className="mt-10 flex flex-col gap-7">
              {beats.map((beat, i) => (
                <Beat key={beat.id} beat={beat} index={i} stage={stage} isLast={i === beats.length - 1} />
              ))}
            </div>
            <div className="mt-9 flex items-center gap-2" aria-hidden>
              {beats.map((_, i) => (
                <RailSegment key={i} index={i} stage={stage} />
              ))}
            </div>
          </div>

          <div className="relative mx-auto aspect-[3/2] w-full max-w-[min(38rem,calc((100svh-9rem)*1.5))]">
            <div className="journey-border-beam size-full rounded-[1.65rem]">
              <div className="relative size-full overflow-hidden rounded-3xl bg-primary-dark shadow-[0_30px_60px_-30px_rgba(6,55,40,0.55)] ring-1 ring-black/5">
                {beats.map((beat, i) => (
                  <JourneyPhoto key={beat.id} beat={beat} index={i} stage={stage} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Beat({
  beat,
  index,
  stage,
  isLast,
}: {
  beat: Beat
  index: number
  stage: MotionValue<number>
  isLast: boolean
}) {
  const opacity = useTransform(
    stage,
    isLast
      ? [index - 0.35, index, beats.length]
      : [index - 0.35, index, index + 0.65, index + 1],
    isLast ? [0.35, 1, 1] : [0.35, 1, 1, 0.4],
  )
  const y = useTransform(stage, [index - 0.35, index], [10, 0])

  return (
    <motion.div style={{ opacity, y }} className="flex gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center">
        <Icon3D name={beat.icon3d} size={44} />
      </span>
      <div>
        <p className="text-xs font-bold tracking-wider text-muted-foreground">STEP {beat.step}</p>
        <h3 className="mt-1 text-xl font-semibold">{beat.title}</h3>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{beat.text}</p>
      </div>
    </motion.div>
  )
}

/** One step's photo: crossfades in as its beat arrives and settles from a slight zoom. */
function JourneyPhoto({ beat, index, stage }: { beat: Beat; index: number; stage: MotionValue<number> }) {
  const first = index === 0
  const last = index === beats.length - 1
  // Crossfade window sits at each boundary between beats (0.85–1.05, 1.85–2.05).
  const opacity = useTransform(
    stage,
    [index - 0.15, index + 0.05, index + 0.85, index + 1.05],
    [first ? 1 : 0, 1, 1, last ? 1 : 0],
  )
  const scale = useTransform(stage, [index - 0.15, index + 1.05], [1.08, 1])

  return (
    <motion.div style={{ opacity, scale }} className="absolute inset-0">
      <Image
        src={beat.image}
        alt={beat.alt}
        fill
        sizes="(min-width: 1024px) 38rem, 100vw"
        priority={first}
        className="object-cover"
      />
    </motion.div>
  )
}

function RailSegment({ index, stage }: { index: number; stage: MotionValue<number> }) {
  const scaleX = useTransform(stage, [index, index + 1], [0, 1])
  return (
    <span className="h-1 flex-1 overflow-hidden rounded-full bg-border">
      <motion.span
        style={{ scaleX, transformOrigin: "left" }}
        className="block h-full rounded-full bg-primary"
      />
    </span>
  )
}

function StackedJourney() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6">
      <div className="flex flex-col gap-6">
        {beats.map((beat, i) => {
          return (
            <motion.div
              key={beat.id}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              className="overflow-hidden rounded-2xl border bg-card"
            >
              <div className="journey-border-beam rounded-2xl">
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
                  <Image
                    src={beat.image}
                    alt={beat.alt}
                    fill
                    sizes="(min-width: 640px) 32rem, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex items-start gap-3 p-5">
                <span className="flex size-10 shrink-0 items-center justify-center">
                  <Icon3D name={beat.icon3d} size={40} />
                </span>
                <div>
                  <p className="text-xs font-bold tracking-wider text-muted-foreground">STEP {beat.step}</p>
                  <h3 className="mt-1 font-semibold">{beat.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{beat.text}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
