"use client"

import * as React from "react"
import type { CSSProperties } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRightIcon,
  CameraIcon,
  CheckIcon,
  ClipboardCheckIcon,
  CloudLightningIcon,
  FileTextIcon,
  HouseIcon,
  MapPinIcon,
  SquareCheckIcon,
  type LucideIcon,
} from "lucide-react"

import { Icon3DCanvas } from "@/components/marketing/three/icon-3d-canvas"
import type { IconKey } from "@/components/marketing/three/icon-models"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

const EASE = [0.22, 1, 0.36, 1] as const

type Point = { x: number; y: number }

/**
 * Stage geometry, measured from the design reference (533 × 513). The SVG uses
 * this as its viewBox and the cards are placed in % of it, so lines, dots and
 * cards stay locked together at any size.
 */
const W = 533
const H = 513
const pctX = (x: number) => `${(x / W) * 100}%`
const pctY = (y: number) => `${(y / H) * 100}%`

const HUB = { x: 187, y: 163, w: 140, h: 134 }
/**
 * The part of the stage the composition actually occupies. The section frames
 * this box, so the visual fills its column edge to edge (outer orbit circles
 * may bleed past it).
 */
const FRAME = { x: 14, y: 20, w: 505, h: 432 }
/** Glowing platform rings under the hub card. */
const PLATFORM = { cx: 257, cy: 296, rings: [[94, 26], [76, 19], [58, 13]] as const }

const nodes: {
  model: IconKey
  icon: LucideIcon
  label: string
  /** Card centre, size and tilt. */
  center: Point
  width: number
  rotate: number
  /** Connector: dot on the card → curve → entry point on the hub. */
  path: string
  dot: Point
}[] = [
  // Top
  {
    model: "map",
    icon: MapPinIcon,
    label: "GPS stamps",
    center: { x: 257, y: 56 },
    width: 134,
    rotate: -2,
    dot: { x: 258, y: 86 },
    path: "M258 86 C 258 120, 257 135, 257 163",
  },
  // Left
  {
    model: "photos",
    icon: CameraIcon,
    label: "Field photos",
    center: { x: 84, y: 140 },
    width: 134,
    rotate: -4,
    dot: { x: 155, y: 135 },
    path: "M155 135 C 174 135, 168 192, 187 192",
  },
  {
    model: "clipboard",
    icon: ClipboardCheckIcon,
    label: "Office review",
    center: { x: 84, y: 318 },
    width: 134,
    rotate: -4,
    dot: { x: 155, y: 313 },
    path: "M155 313 C 174 313, 168 268, 187 268",
  },
  // Right
  {
    model: "storm",
    icon: CloudLightningIcon,
    label: "Storm data",
    center: { x: 430, y: 140 },
    width: 134,
    rotate: 4,
    dot: { x: 359, y: 135 },
    path: "M359 135 C 340 135, 346 192, 327 192",
  },
  {
    model: "squares",
    icon: SquareCheckIcon,
    label: "Test squares",
    center: { x: 430, y: 318 },
    width: 134,
    rotate: -4,
    dot: { x: 359, y: 323 },
    path: "M359 323 C 340 323, 346 268, 327 268",
  },
  // Bottom
  {
    model: "pdf",
    icon: FileTextIcon,
    label: "Carrier-ready PDF",
    center: { x: 257, y: 418 },
    width: 140,
    rotate: -1,
    dot: { x: 256.5, y: 388 },
    path: "M256.5 388 C 257 360, 257 345, 257 322",
  },
]

const particles: { x: number; y: number; r: number; delay: number }[] = [
  { x: 150, y: 52, r: 2.4, delay: 0 },
  { x: 368, y: 58, r: 4.5, delay: 1.2 },
  { x: 40, y: 228, r: 4, delay: 2.1 },
  { x: 160, y: 230, r: 2.2, delay: 0.6 },
  { x: 354, y: 230, r: 2.4, delay: 1.8 },
  { x: 488, y: 232, r: 2.6, delay: 2.6 },
  { x: 150, y: 395, r: 2.4, delay: 0.9 },
  { x: 372, y: 400, r: 4.5, delay: 1.5 },
  { x: 205, y: 120, r: 2, delay: 2.3 },
  { x: 312, y: 112, r: 2.2, delay: 0.3 },
]

const benefits = [
  {
    title: "Keep your current tools",
    text: "Crews capture photos. Office teams keep their review process.",
    related: ["Field photos", "Office review"],
  },
  {
    title: "Bring every detail together",
    text: "Connect GPS stamps, storm checks, photos, and test squares in one place.",
    related: ["GPS stamps", "Storm data", "Test squares", "Field photos"],
  },
  {
    title: "Deliver a cleaner claim packet",
    text: "Generate branded PDFs and organized evidence for carrier review.",
    related: ["Carrier-ready PDF"],
  },
]

/** Hub centre — cards fly out from here on load. */
const HUB_CENTER = { x: HUB.x + HUB.w / 2, y: HUB.y + HUB.h / 2 }
/** Stage units → container-query width units (the stage is W units wide). */
const cqw = (units: number) => `${(units / W) * 100}cqw`

/**
 * "Built around your existing workflow": a hub visual (one complete claim
 * file, fed by six evidence sources with live Three.js icons) beside the
 * copy, benefits and CTA.
 */
export function WorkflowHubSection() {
  // Cards highlighted from the benefit list on the right.
  const [focus, setFocus] = React.useState<readonly string[]>([])

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_45%,color-mix(in_oklab,var(--primary)_7%,transparent),transparent_55%)]"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
        <div className="order-2 lg:order-1">
          <HubStage focus={focus} />
        </div>

        <motion.div
          className="order-1 max-w-xl lg:order-2 lg:justify-self-end"
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ staggerChildren: 0.08 }}
        >
          <motion.p variants={rise} className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            Built around your existing workflow
          </motion.p>
          <motion.span
            variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1, transition: { duration: 0.7, ease: EASE } } }}
            className="mt-3 block h-0.5 w-10 origin-left rounded-full bg-primary/70"
          />
          <motion.h2
            variants={rise}
            className="mt-5 text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl lg:text-[2.6rem] lg:leading-[1.12]"
          >
            Your tools already work.{" "}
            <br className="hidden sm:block" />
            Your claim file should, too.
          </motion.h2>
          <motion.p variants={rise} className="mt-5 leading-relaxed text-muted-foreground sm:text-lg sm:leading-8">
            <span className="font-semibold text-foreground">RoofClaim</span> brings field evidence, weather
            verification, and office review into one carrier-ready workflow—without replacing the tools your team
            already uses.
          </motion.p>

          <ul className="mt-7 flex flex-col gap-2">
            {benefits.map((benefit) => (
              <motion.li
                key={benefit.title}
                variants={rise}
                onPointerEnter={() => setFocus(benefit.related)}
                onPointerLeave={() => setFocus([])}
                className="-mx-3 flex cursor-default gap-3.5 rounded-xl px-3 py-2 transition-colors duration-300 hover:bg-primary/[0.04]"
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_0_5px_color-mix(in_oklab,var(--primary)_10%,transparent)]">
                  <CheckIcon className="size-3.5" strokeWidth={3} />
                </span>
                <div>
                  <p className="font-semibold text-foreground">{benefit.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{benefit.text}</p>
                </div>
              </motion.li>
            ))}
          </ul>

          <motion.div variants={rise}>
            <Button
              size="lg"
              className="group mt-9 h-12 rounded-full bg-primary-dark px-7 shadow-[0_16px_34px_-14px_rgba(6,55,40,0.75)] transition-all hover:-translate-y-0.5 hover:bg-primary-dark/90"
              render={<Link href={ROUTES.marketing.howItWorks} />}
            >
              Explore the workflow
              <ArrowRightIcon data-icon="inline-end" className="transition-transform group-hover:translate-x-0.5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

const rise = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
}

function HubStage({ focus }: { focus: readonly string[] }) {
  const reduceMotion = useReducedMotion()
  const [hovered, setHovered] = React.useState<string | null>(null)
  const active = hovered ? [hovered] : focus
  const isActive = (label: string) => active.includes(label)
  const anyActive = active.length > 0

  return (
    <div className="relative w-full" style={{ aspectRatio: `${FRAME.w} / ${FRAME.h}` }}>
      <motion.div
      className="@container absolute aspect-[533/513]"
      style={{
        left: `${(-FRAME.x / FRAME.w) * 100}%`,
        top: `${(-FRAME.y / FRAME.h) * 100}%`,
        width: `${(W / FRAME.w) * 100}%`,
      }}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Backdrop: orbit circles, hub glow, platform rings */}
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible" aria-hidden>
        <defs>
          <radialGradient id="wf-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6ae8b0" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#6ae8b0" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#6ae8b0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="wf-beam" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="533" y2="513">
            <stop offset="0%" stopColor="#6ae8b0" />
            <stop offset="100%" stopColor="#12b76a" />
          </linearGradient>
          <filter id="wf-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        {[240, 190, 140].map((r, i) => (
          <motion.circle
            key={r}
            cx={257}
            cy={262}
            r={r}
            fill="none"
            stroke="#0a4b37"
            strokeOpacity={0.045 + i * 0.01}
            strokeWidth="1"
            style={{ transformOrigin: "257px 262px" }}
            variants={{
              hidden: { opacity: 0, scale: 0.6 },
              shown: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: EASE, delay: 0.1 + (2 - i) * 0.12 } },
            }}
          />
        ))}
        <ellipse
          cx={257}
          cy={240}
          rx={150}
          ry={130}
          fill="url(#wf-glow)"
          className="transition-opacity duration-300"
          opacity={anyActive ? 1 : 0.75}
        />

        {/* Platform rings (glow + crisp stroke) */}
        <motion.g
          style={{ transformOrigin: `${PLATFORM.cx}px ${PLATFORM.cy}px` }}
          variants={{
            hidden: { opacity: 0, scale: 0.3 },
            shown: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: EASE, delay: 0.35 } },
          }}
        >
        <g className="wf-ring" style={{ transformOrigin: `${PLATFORM.cx}px ${PLATFORM.cy}px` }}>
          {PLATFORM.rings.map(([rx, ry]) => (
            <g key={rx}>
              <ellipse cx={PLATFORM.cx} cy={PLATFORM.cy} rx={rx} ry={ry} fill="none" stroke="#6ae8b0" strokeWidth="5" strokeOpacity="0.45" filter="url(#wf-blur)" />
              <ellipse cx={PLATFORM.cx} cy={PLATFORM.cy} rx={rx} ry={ry} fill="none" stroke="#9ff0c8" strokeWidth="1.2" strokeOpacity="0.9" />
            </g>
          ))}
          <ellipse cx={PLATFORM.cx} cy={PLATFORM.cy} rx={58} ry={13} fill="#6ae8b0" fillOpacity="0.18" />
        </g>
        </motion.g>

        {/* Connectors: hairline track + a short glowing beam running along it */}
        {nodes.map((node, i) => (
          <g key={node.label}>
            <motion.path
              d={node.path}
              fill="none"
              stroke="#2bbf80"
              strokeLinecap="round"
              className="transition-[stroke-width,stroke-opacity] duration-300"
              strokeWidth={isActive(node.label) ? 1.6 : 0.9}
              strokeOpacity={isActive(node.label) ? 1 : anyActive ? 0.25 : 0.55}
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                shown: { pathLength: 1, opacity: 1, transition: { duration: 0.8, ease: EASE, delay: 0.95 + i * 0.08 } },
              }}
            />
            {!reduceMotion && (
              <motion.path
                variants={{ hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.4, delay: 1.7 + i * 0.08 } } }}
                d={node.path}
                pathLength={1}
                fill="none"
                stroke="url(#wf-beam)"
                strokeWidth={1.8}
                strokeLinecap="round"
                className={cn("wf-beam", isActive(node.label) && "wf-beam-active")}
                style={{ animationDelay: `${2 + i * 0.4}s` }}
              />
            )}
          </g>
        ))}

        {/* Floating particles */}
        <motion.g
          variants={{ hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 1, delay: 1.3 } } }}
        >
        {particles.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill={p.r > 4 ? "url(#wf-particle)" : "#2bbf80"}
            fillOpacity={p.r > 4 ? 1 : 0.75}
            className="wf-particle"
            style={{ animationDelay: `-${p.delay}s` } as CSSProperties}
          />
        ))}
        </motion.g>
        <defs>
          <radialGradient id="wf-particle" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#b9f5d6" />
            <stop offset="100%" stopColor="#2bbf80" />
          </radialGradient>
        </defs>
      </svg>

      {/* Hub: one complete claim file — children placed at the reference proportions */}
      <motion.div
        className={cn(
          "absolute z-10 rounded-[3.2cqw] border bg-white/60 text-center backdrop-blur-md transition-[box-shadow,border-color] duration-300",
          anyActive
            ? "border-[#6ae8b0] shadow-[0_24px_50px_-26px_rgba(6,55,40,0.45),0_0_60px_rgba(106,232,176,0.7),inset_0_1px_0_rgba(255,255,255,0.95)]"
            : "border-white/90 shadow-[0_24px_50px_-26px_rgba(6,55,40,0.45),0_0_40px_rgba(106,232,176,0.4),inset_0_1px_0_rgba(255,255,255,0.95)]",
        )}
        style={{ left: pctX(HUB.x), top: pctY(HUB.y), width: pctX(HUB.w), height: pctY(HUB.h) }}
        variants={{
          hidden: { opacity: 0, scale: 0.6, y: 12 },
          shown: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 180, damping: 18 } },
        }}
      >
        <Icon3DCanvas
          name="home"
          size={96}
          className="!absolute top-[17%] left-1/2 !size-[9cqw] -translate-x-1/2 -translate-y-1/2"
          fallback={<HouseIcon className="size-[7cqw] text-primary" />}
        />
        <p className="absolute inset-x-0 top-[35%] text-[clamp(10px,3cqw,20px)] leading-[1.18] font-bold text-[#14234a]">
          One complete
          <br />
          claim file
        </p>
        <span className="absolute top-[70%] left-1/2 h-[3%] w-[70%] -translate-x-1/2 rounded-full bg-[#dfe7e3]" />
        <span className="absolute top-[77%] left-1/2 h-[3%] w-[62%] -translate-x-1/2 rounded-full bg-[#e7eeea]" />
        <span className="wf-check absolute top-[91%] left-1/2 flex size-[2.4cqw] min-h-3 min-w-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#12b76a] text-white">
          <CheckIcon className="size-[66%]" strokeWidth={3.4} />
        </span>
      </motion.div>

      {/* Evidence sources */}
      {nodes.map((node, i) => (
        <motion.div
          key={node.label}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: pctX(node.center.x), top: pctY(node.center.y), minWidth: pctX(node.width) }}
          variants={{
            hidden: {
              opacity: 0,
              scale: 0.4,
              x: cqw(HUB_CENTER.x - node.center.x),
              y: cqw(HUB_CENTER.y - node.center.y),
            },
            shown: {
              opacity: 1,
              scale: 1,
              x: "0cqw",
              y: "0cqw",
              transition: { type: "spring", stiffness: 120, damping: 16, delay: 0.45 + i * 0.07 },
            },
          }}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(node.label)}
          onPointerLeave={() => setHovered(null)}
        >
          <div
            className={cn(
              "flex min-h-[11.2cqw] cursor-default items-center gap-[1.5cqw] rounded-[2.2cqw] border bg-white py-[1.2cqw] pr-[1.8cqw] pl-[1.6cqw] transition-[translate,scale,box-shadow,border-color,opacity] duration-300 ease-out",
              isActive(node.label)
                ? "-translate-y-[0.8cqw] scale-[1.06] border-[#6ae8b0] shadow-[0_22px_40px_-18px_rgba(6,55,40,0.45),0_0_0_0.5cqw_rgba(106,232,176,0.22)]"
                : "border-black/[0.04] shadow-[0_14px_32px_-18px_rgba(6,55,40,0.35),0_2px_6px_rgba(6,55,40,0.05)]",
              anyActive && !isActive(node.label) && "opacity-55",
            )}
            style={{ rotate: `${node.rotate}deg` }}
          >
            <Icon3DCanvas
              name={node.model}
              size={84}
              className="!size-[7.8cqw]"
              fallback={<node.icon className="size-[5cqw] text-primary" />}
            />
            <span
              className={cn(
                "text-[clamp(9px,2.05cqw,14px)] leading-tight font-semibold whitespace-nowrap text-[#14234a]",
              )}
            >
              {node.label.replace(/ PDF$/, "")}
              {node.label.endsWith(" PDF") && (
                <>
                  <br />
                  PDF
                </>
              )}
            </span>
          </div>
        </motion.div>
      ))}

      {/* Anchor dots sit above the cards, exactly where the lines start */}
      <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden>
        {nodes.map((node, i) => (
          <motion.g
            key={node.label}
            variants={{
              hidden: { opacity: 0, scale: 0 },
              shown: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 14, delay: 0.9 + i * 0.08 } },
            }}
            style={{ transformOrigin: `${node.dot.x}px ${node.dot.y}px` }}
          >
            <circle
              cx={node.dot.x}
              cy={node.dot.y}
              r={isActive(node.label) ? 9 : 6}
              fill="#6ae8b0"
              fillOpacity={isActive(node.label) ? 0.45 : 0.35}
              className="transition-all duration-300"
            />
            <circle cx={node.dot.x} cy={node.dot.y} r="3.6" fill="#12b76a" stroke="#fff" strokeWidth="1.2" />
          </motion.g>
        ))}
      </svg>
      </motion.div>
    </div>
  )
}
