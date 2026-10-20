"use client"

import Image from "next/image"
import * as React from "react"
import { ShieldCheckIcon } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"

import { Icon3D, type Icon3DKey } from "@/components/marketing/icon-3d"
import { cn } from "@/lib/utils"
import styles from "./roof-journey.module.css"

const beats = [
  {
    id: "capture",
    step: "01",
    icon3d: "camera" as Icon3DKey,
    title: "Capture the roof",
    text: "Photos, GPS, and test squares on site — the same shots your crew already takes.",
    tag: "Capture",
    points: [
      "Guided prompts for every slope and elevation",
      "10×10 ft hail test squares with hit counts",
      "GPS and timestamp on every photo",
    ],
    big: (
      <>
        GPS on <em>every</em> shot.
      </>
    ),
    line: "Guided slope-by-slope capture, stamped with location and time.",
    chip: "Front slope · GPS + time stamped",
    image: "/marketing/journey-capture.jpg",
    alt: "Inspector photographing a roof with a phone",
  },
  {
    id: "verify",
    step: "02",
    icon3d: "weather" as Icon3DKey,
    title: "Verify the storm",
    text: "Hail and wind hits get matched against storm data for the date of loss.",
    tag: "Verify",
    points: [
      "Storm date checked for the property address",
      "Hail and wind hits tied to the date of loss",
      "Mismatches flagged before the file goes out",
    ],
    big: (
      <>
        Storm-<em>verified</em>.
      </>
    ),
    line: "Every hit is checked against storm data for the date of loss.",
    chip: "Storm date verified",
    image: "/marketing/journey-verify.jpg",
    alt: "Inspector on a roof checking verified storm damage on a phone",
  },
  {
    id: "send",
    step: "03",
    icon3d: "file" as Icon3DKey,
    title: "Send the file",
    text: "Approve the evidence and export a branded, carrier-ready PDF.",
    tag: "Send",
    points: [
      "Your logo and colours on every report",
      "Review and approve before it’s sent",
      "Share by link, email or WhatsApp",
    ],
    big: (
      <>
        <em>One</em> carrier-ready PDF.
      </>
    ),
    line: "Branded, approved and shared by link, email or WhatsApp.",
    chip: "Report shared",
    image: "/marketing/journey-send.jpg",
    alt: "Inspector sending the damage report from a phone",
  },
] as const

const EASE = [0.22, 1, 0.36, 1] as const

/** The sticky stack needs room for both columns. */
const STACK_QUERY = "(min-width: 1120px)"

/**
 * The homepage's scroll story. Wide screens (motion allowed) get a sticky stack:
 * the copy on the left cross-fades while photo cards slide over each other on the
 * right. Everyone else gets the same three beats as simple scroll-reveal cards.
 */
export function RoofJourney() {
  const reduceMotion = useReducedMotion()

  return (
    // overflow-x-clip (not overflow-hidden): hidden would create a scroll
    // container and silently break the sticky stack below.
    <section className="relative overflow-x-clip">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_55%)]"
      />

      {!reduceMotion && (
        <div className="relative hidden py-24 min-[1120px]:block">
          <div className="mx-auto max-w-2xl px-6">
            <SectionHeading />
          </div>
          <div className="mx-auto mt-20 max-w-7xl px-6">
            <StackJourney />
          </div>
        </div>
      )}
      <div className={cn("relative py-20 md:py-28", !reduceMotion && "min-[1120px]:hidden")}>
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

/* =========================================================
   Sticky stack (port of the "why-stack" pattern)
   Each card scales down to SCALES[i] as the next one arrives;
   the copy cross-fades by how far the stack has advanced.
   ========================================================= */

const SCALES = [0.82, 0.91, 1]
const SMOOTH = 0.12
const CARD_CLASS = [styles.card1, styles.card2, styles.card3]

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

function StackJourney() {
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const textRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const segRefs = React.useRef<(HTMLElement | null)[]>([])
  const sectionRef = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState(-1)

  React.useEffect(() => {
    const desktop = window.matchMedia(STACK_QUERY)
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[]
    const texts = textRefs.current.filter(Boolean) as HTMLDivElement[]
    const segs = segRefs.current.filter(Boolean) as HTMLElement[]
    if (!cards.length) return

    const cur = { scale: cards.map(() => 1), op: texts.map((_, i) => (i === 0 ? 1 : 0)) }
    let current = -1
    let raf = 0
    let inView = false

    const targets = () => {
      const vh = window.innerHeight
      // 0 = card still below, 1 = card has arrived on top of the stack
      const enter = cards.map((c, i) => {
        if (i === 0) return 1
        const top = c.getBoundingClientRect().top
        const start = vh * 0.72
        const end = parseFloat(getComputedStyle(c).top) + 10
        return clamp((start - top) / (start - end))
      })
      const scale = cards.map((_, i) => {
        const p = i < cards.length - 1 ? enter[i + 1] : 0
        return 1 - (1 - SCALES[i]) * p
      })
      let f = 0
      for (let i = 1; i < enter.length; i++) f += clamp((enter[i] - 0.15) / 0.55)
      const op = texts.map((_, i) => clamp(1 - Math.abs(f - i) * 1.8))
      // how far the first card has scrolled into view (fills the first segment)
      const first = clamp((vh - cards[0].getBoundingClientRect().top) / (vh * 0.6))
      return { scale, op, f, first }
    }

    const tick = () => {
      raf = 0
      if (!desktop.matches) return
      const t = targets()
      let moving = false

      cards.forEach((c, i) => {
        const d = t.scale[i] - cur.scale[i]
        if (Math.abs(d) > 0.0005) moving = true
        cur.scale[i] += d * SMOOTH
        c.style.transform = `translate3d(0,0,0) scale3d(${cur.scale[i].toFixed(4)},${cur.scale[i].toFixed(4)},1)`
      })

      let best = 0
      texts.forEach((el, i) => {
        const d = t.op[i] - cur.op[i]
        if (Math.abs(d) > 0.001) moving = true
        cur.op[i] += d * SMOOTH
        el.style.opacity = cur.op[i] < 0.001 ? "0" : cur.op[i].toFixed(4)
        if (cur.op[i] > cur.op[best]) best = i
      })
      texts.forEach((el, i) => {
        el.style.pointerEvents = i === best ? "auto" : "none"
        el.style.zIndex = i === best ? "2" : "1"
        el.setAttribute("aria-hidden", String(i !== best))
      })

      // progress: first segment fills as the stack scrolls in, the rest as cards arrive
      segs.forEach((s, i) =>
        s.style.setProperty("--p", (i === 0 ? t.first : clamp(t.f - (i - 1))).toFixed(3)),
      )

      if (t.first > 0.35 && best !== current) {
        current = best
        setActive(best)
      }
      if (moving || inView) raf = requestAnimationFrame(tick)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting
      if (inView) kick()
    })
    if (sectionRef.current) io.observe(sectionRef.current)
    const onChange = () => {
      if (!desktop.matches) cards.forEach((c) => (c.style.transform = ""))
      kick()
    }
    window.addEventListener("scroll", kick, { passive: true })
    window.addEventListener("resize", kick)
    desktop.addEventListener("change", onChange)
    kick()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener("scroll", kick)
      window.removeEventListener("resize", kick)
      desktop.removeEventListener("change", onChange)
    }
  }, [])

  /** Subtle 3D tilt of the photo panel under the cursor (fine pointers only). */
  function onCardMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return
    const card = event.currentTarget
    const panel = card.querySelector<HTMLElement>(`.${styles.vis}`)
    if (!panel) return
    const r = card.getBoundingClientRect()
    const x = (event.clientX - r.left) / r.width - 0.5
    const y = (event.clientY - r.top) / r.height - 0.5
    panel.style.setProperty("--ry", `${(x * 6).toFixed(2)}deg`)
    panel.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`)
  }
  function onCardLeave(event: React.PointerEvent<HTMLDivElement>) {
    const panel = event.currentTarget.querySelector<HTMLElement>(`.${styles.vis}`)
    panel?.style.setProperty("--ry", "0deg")
    panel?.style.setProperty("--rx", "0deg")
  }

  const shown = Math.max(active, 0)

  return (
    <div ref={sectionRef} className={styles.wrap}>
      {/* Left: sticky copy */}
      <div className={styles.texts}>
        {beats.map((beat, i) => (
          <div
            key={beat.id}
            ref={(el) => {
              textRefs.current[i] = el
            }}
            className={styles.text}
            data-current={i === active ? "" : undefined}
            style={{ opacity: i === 0 ? 1 : 0 }}
            aria-hidden={i !== 0}
          >
            <span className={styles.label}>
              <b>{beat.step}</b>
              {beat.tag}
            </span>
            <h3 className={styles.h}>{beat.title}</h3>
            <p className={styles.p}>{beat.text}</p>
            <ul className={styles.points}>
              {beat.points.map((point) => (
                <li key={point}>
                  <i className={styles.tick} aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className={styles.progress} aria-hidden>
          <span className={styles.count}>
            <b>{beats[shown].step}</b> / {String(beats.length).padStart(2, "0")}
          </span>
          <div className={styles.segs}>
            {beats.map((beat, i) => (
              <i key={beat.id}>
                <b
                  ref={(el) => {
                    segRefs.current[i] = el
                  }}
                />
              </i>
            ))}
          </div>
        </div>
      </div>

      {/* Right: stacking poster cards */}
      <div className={styles.cards}>
        {beats.map((beat, i) => (
          <div
            key={beat.id}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            className={cn(styles.card, CARD_CLASS[i])}
            data-active={i === active ? "" : undefined}
            onPointerMove={onCardMove}
            onPointerLeave={onCardLeave}
          >
            <div className={styles.top}>
              <span className={styles.tag}>
                {beat.step} · {beat.tag}
              </span>
              <span className={styles.logo} aria-hidden>
                <ShieldCheckIcon className="size-[18px]" strokeWidth={2.2} />
              </span>
            </div>
            <div className={styles.big}>
              <p className={styles.num}>{beat.big}</p>
              <p className={styles.line}>{beat.line}</p>
            </div>
            <div className={styles.vis}>
              <div className={styles.photo}>
                <div className="journey-kenburns absolute inset-0" style={{ animationDelay: `-${i * 6}s` }}>
                  <Image
                    src={beat.image}
                    alt={beat.alt}
                    fill
                    sizes="(min-width: 1440px) 600px, 560px"
                    priority={i === 0}
                    className="object-cover"
                  />
                </div>
              </div>
              <span className={styles.chip}>
                <i className={styles.tick} aria-hidden />
                {beat.chip}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
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
