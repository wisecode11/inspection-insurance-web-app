"use client"

import Image from "next/image"
import * as React from "react"
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
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

const EASE = [0.22, 1, 0.36, 1] as const

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

const headingWords = "One job, three steps, zero reshoots.".split(" ")

/** Eyebrow fades up, then the title rises in word by word the first time it scrolls into view. */
function SectionHeading({ align = "center" }: { align?: "center" | "left" }) {
  const reduceMotion = useReducedMotion()
  const shown = { opacity: 1, y: 0 }

  return (
    <motion.div
      className={align === "left" ? "text-left" : "text-center"}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.6 }}
      transition={{ staggerChildren: 0.06 }}
    >
      <motion.p
        variants={{ hidden: reduceMotion ? shown : { opacity: 0, y: 14 }, shown }}
        transition={{ duration: 0.6, ease: EASE }}
        className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase"
      >
        How a claim file comes together
      </motion.p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.4rem] lg:leading-[1.15]">
        {headingWords.map((word, i) => (
          <React.Fragment key={i}>
            <motion.span
              variants={{ hidden: reduceMotion ? shown : { opacity: 0, y: "0.45em" }, shown }}
              transition={{ duration: 0.7, ease: EASE }}
              className="inline-block"
            >
              {word}
            </motion.span>
            {i < headingWords.length - 1 && " "}
          </React.Fragment>
        ))}
      </h2>
    </motion.div>
  )
}

function PinnedJourney() {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] })
  const progress = useSpring(scrollYProgress, { stiffness: 300, damping: 46, restDelta: 0.001 })
  const stage = useTransform(progress, [0, 1], [0, beats.length])

  // Which step is in focus — changes only a few times, so state is fine here.
  const [active, setActive] = React.useState(0)
  useMotionValueEvent(stage, "change", (v) => {
    const next = Math.min(beats.length - 1, Math.max(0, Math.floor(v + 0.1)))
    setActive((prev) => (prev === next ? prev : next))
  })

  // Gentle tilt of the photo toward the pointer, like the hero phone.
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-4, 4]), { stiffness: 120, damping: 20 })
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [3, -3]), { stiffness: 120, damping: 20 })

  return (
    <div ref={trackRef} className="relative h-[320vh]">
      <div className="sticky top-[4.25rem] flex h-[calc(100svh-4.25rem)] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading align="left" />
            <div className="mt-10 flex flex-col gap-7">
              {beats.map((beat, i) => (
                <Beat key={beat.id} beat={beat} index={i} stage={stage} isLast={i === beats.length - 1} active={active === i} />
              ))}
            </div>
            <div className="mt-9 flex items-center gap-2" aria-hidden>
              {beats.map((_, i) => (
                <RailSegment key={i} index={i} stage={stage} />
              ))}
            </div>
          </div>

          <motion.div
            className="relative mx-auto aspect-[3/2] w-full max-w-[min(38rem,calc((100svh-9rem)*1.5))]"
            style={{ rotateX, rotateY, transformPerspective: 1200 }}
            onPointerMove={(e) => {
              if (e.pointerType !== "mouse") return
              const rect = e.currentTarget.getBoundingClientRect()
              px.set((e.clientX - rect.left) / rect.width - 0.5)
              py.set((e.clientY - rect.top) / rect.height - 0.5)
            }}
            onPointerLeave={() => {
              px.set(0)
              py.set(0)
            }}
          >
            <div className="journey-border-beam size-full rounded-[1.65rem]">
              <div className="relative size-full overflow-hidden rounded-3xl bg-primary-dark shadow-[0_30px_60px_-30px_rgba(6,55,40,0.55)] ring-1 ring-black/5">
                {beats.map((beat, i) => (
                  <JourneyPhoto key={beat.id} beat={beat} index={i} stage={stage} />
                ))}
                <ScanSweep key={active} />
              </div>
            </div>
          </motion.div>
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
  active,
}: {
  beat: Beat
  index: number
  stage: MotionValue<number>
  isLast: boolean
  active: boolean
}) {
  const opacity = useTransform(
    stage,
    isLast
      ? [index - 0.35, index, beats.length]
      : [index - 0.35, index, index + 0.65, index + 1],
    isLast ? [0.35, 1, 1] : [0.35, 1, 1, 0.4],
  )
  const y = useTransform(stage, [index - 0.35, index], [10, 0])
  const iconScale = useTransform(
    stage,
    isLast ? [index - 0.35, index] : [index - 0.35, index, index + 0.65, index + 1],
    isLast ? [0.9, 1.12] : [0.9, 1.12, 1.12, 0.92],
  )

  return (
    <motion.div style={{ opacity, y }} className="flex gap-4">
      <motion.span style={{ scale: iconScale }} className="relative flex size-11 shrink-0 items-center justify-center">
        <span
          aria-hidden
          className={cn(
            "absolute -inset-2 rounded-full bg-[radial-gradient(circle,rgba(18,183,106,0.28),transparent_70%)] transition-opacity duration-500",
            active ? "journey-icon-glow opacity-100" : "opacity-0",
          )}
        />
        <span className={cn("relative", active && "journey-icon-bob")}>
          <Icon3D name={beat.icon3d} size={44} />
        </span>
      </motion.span>
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
      <div className="journey-kenburns absolute inset-0" style={{ animationDelay: `-${index * 6}s` }}>
        <Image
          src={beat.image}
          alt={beat.alt}
          fill
          sizes="(min-width: 1024px) 38rem, 100vw"
          priority={first}
          className="object-cover"
        />
      </div>
    </motion.div>
  )
}

function RailSegment({ index, stage }: { index: number; stage: MotionValue<number> }) {
  const scaleX = useTransform(stage, [index, index + 1], [0, 1])
  return (
    <span className="h-1 flex-1 overflow-hidden rounded-full bg-border">
      <motion.span
        style={{ scaleX, transformOrigin: "left" }}
        className="journey-rail-fill block h-full rounded-full bg-primary"
      />
    </span>
  )
}

/** A mint scan line that sweeps down the photo once whenever the step changes (remounted via key). */
function ScanSweep() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 z-10 h-24"
      initial={{ top: "-25%", opacity: 0 }}
      animate={{ top: "110%", opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.4, ease: EASE, times: [0, 0.15, 0.8, 1] }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#6ae8b0]/25 to-transparent" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-[#6ae8b0] shadow-[0_0_12px_2px_rgba(106,232,176,0.7)]" />
    </motion.div>
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
                  <motion.div
                    className="absolute inset-0"
                    initial={reduceMotion ? false : { scale: 1.12 }}
                    whileInView={reduceMotion ? undefined : { scale: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 1.2, ease: EASE }}
                  >
                    <Image
                      src={beat.image}
                      alt={beat.alt}
                      fill
                      sizes="(min-width: 640px) 32rem, 100vw"
                      className="object-cover"
                    />
                  </motion.div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-5">
                <motion.span
                  className="flex size-10 shrink-0 items-center justify-center"
                  initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
                  whileInView={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.25 }}
                >
                  <Icon3D name={beat.icon3d} size={40} />
                </motion.span>
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
