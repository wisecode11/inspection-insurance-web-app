"use client"

import type { LucideIcon } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"
import { motion } from "framer-motion"

import { CountUp } from "@/components/company-dashboard/count-up"
import { useTilt } from "@/components/shared/use-tilt"
import { cn } from "@/lib/utils"

export type StatCardTone = "green" | "amber" | "teal" | "slate"

const ACCENTS: Record<StatCardTone, string> = {
  green: "#16A34A",
  amber: "#F59E0B",
  teal: "#14B8A6",
  slate: "#64748B",
}

/** Smooth sparkline (Catmull-Rom → Bézier) drawn from a short series. */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 96
  const h = 36
  const p = 3
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pts = values.map(
    (v, i) =>
      [p + (i * (w - 2 * p)) / (values.length - 1), h - p - ((v - min) / (max - min || 1)) * (h - 2 * p)] as const,
  )
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-24 shrink-0" aria-hidden>
      <path d={`${d} L${w - p},${h} L${p},${h}Z`} fill={color} opacity={0.1} />
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: "easeInOut", delay: 0.2 }}
      />
    </svg>
  )
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "green",
  featured = false,
  meta,
  aside,
  spark,
  className,
  delay = 0,
}: {
  label: string
  value: number
  icon: LucideIcon
  tone?: StatCardTone
  /** Featured cards get a soft tint of the accent colour. */
  featured?: boolean
  /** Pills / captions under the value. */
  meta?: ReactNode
  /** Right-aligned footer content (avatars, link). Takes precedence over `spark`. */
  aside?: ReactNode
  /** Series for the footer sparkline; needs at least two points. */
  spark?: number[]
  className?: string
  delay?: number
}) {
  const accent = ACCENTS[tone]
  const tilt = useTilt<HTMLElement>()

  const style = {
    "--accent": accent,
    transform: tilt.transform,
    background: featured
      ? `linear-gradient(160deg, color-mix(in srgb, ${accent} ${tone === "amber" ? 11 : 9}%, #fff), #fff 70%)`
      : undefined,
  } as CSSProperties

  const showSpark = !aside && spark && spark.length > 1 && spark.some((v) => v > 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn("flex", className)}
    >
    <article
      {...tilt.bind}
      style={style}
      className={cn(
        "group relative flex min-h-44 w-full flex-col overflow-hidden rounded-2xl border border-[rgba(6,55,40,0.10)] bg-white p-5 shadow-[0_1px_2px_rgba(6,55,40,0.06),0_1px_3px_rgba(6,55,40,0.05)] [transform-style:preserve-3d] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] will-change-transform",
        "hover:border-[color-mix(in_srgb,var(--accent)_35%,rgba(6,55,40,0.10))] hover:shadow-[0_8px_24px_-8px_rgba(6,55,40,0.18),0_2px_6px_rgba(6,55,40,0.06)]",
      )}
    >
      {/* accent bar */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent 70%)` }}
      />
      {/* pointer spotlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(320px circle at var(--mx, 50%) var(--my, 0%), color-mix(in srgb, ${accent} 14%, transparent), transparent 60%)`,
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <span className="text-[13.5px] font-semibold text-[#475467]">{label}</span>
        <span
          className="grid size-10 place-items-center rounded-xl"
          style={{
            color: accent,
            background: `color-mix(in srgb, ${accent} 12%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accent} 20%, transparent)`,
          }}
        >
          <Icon className="size-[19px]" aria-hidden />
        </span>
      </div>

      <p className="relative mt-3.5 mb-2.5 text-[40px] leading-none font-extrabold tracking-[-0.03em] tabular-nums text-[#0B1712]">
        <CountUp value={value} />
      </p>

      <div className="relative mt-auto flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5 text-[13px] text-[#667085]">{meta}</div>
        {aside ?? (showSpark ? <Sparkline values={spark} color={accent} /> : null)}
      </div>
    </article>
    </motion.div>
  )
}

export function Pill({
  tone = "green",
  icon: Icon,
  children,
}: {
  tone?: "green" | "red"
  icon?: LucideIcon
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 self-start rounded-full px-2.5 py-[3px] text-[12.5px] font-semibold",
        tone === "green" ? "bg-[#DFF7EA] text-[#0F5D44]" : "bg-[#FEE2E2] text-[#DC2626]",
      )}
    >
      {Icon ? <Icon className="size-[13px]" aria-hidden /> : null}
      {children}
    </span>
  )
}
