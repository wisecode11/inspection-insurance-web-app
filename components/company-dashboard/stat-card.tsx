"use client"

import type { LucideIcon } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"
import { motion } from "framer-motion"

import { Icon3D, type Icon3DKey } from "@/components/shared/icon-3d"
import { cn } from "@/lib/utils"

export type StatCardTone = "lime" | "green" | "emerald" | "orange" | "teal" | "slate"

type ToneConfig = {
  /** Accent bar + glow colour, as "r,g,b". */
  rgb: string
  iconBg: string
  iconFg: string
  trendBg: string
  trendFg: string
  /** Tinted cards get a soft coloured background and border instead of white. */
  tint?: { background: string; border: string }
}

const TONES: Record<StatCardTone, ToneConfig> = {
  lime: {
    rgb: "74,222,128",
    iconBg: "#E4F8EA",
    iconFg: "#16A34A",
    trendBg: "#E3F6E8",
    trendFg: "#166534",
  },
  green: {
    rgb: "52,199,123",
    iconBg: "#C9EFD7",
    iconFg: "#15803D",
    trendBg: "#D6F3E0",
    trendFg: "#166534",
    tint: {
      background: "linear-gradient(180deg, #EEFBF2 0%, #DDF5E6 100%)",
      border: "#A7E3BE",
    },
  },
  emerald: {
    rgb: "34,163,90",
    iconBg: "#DCF3E4",
    iconFg: "#15803D",
    trendBg: "#DCF3E4",
    trendFg: "#1E7B45",
  },
  orange: {
    rgb: "245,158,75",
    iconBg: "#FBD9B8",
    iconFg: "#C2410C",
    trendBg: "#FDE3CC",
    trendFg: "#9A3412",
    tint: {
      background: "linear-gradient(180deg, #FFF6EE 0%, #FDEBDB 100%)",
      border: "#F6C9A1",
    },
  },
  teal: {
    rgb: "20,184,166",
    iconBg: "#D3F2EE",
    iconFg: "#0F766E",
    trendBg: "#D3F2EE",
    trendFg: "#0F8F80",
  },
  slate: {
    rgb: "148,155,168",
    iconBg: "#E6E8EC",
    iconFg: "#475467",
    trendBg: "#EEF0F3",
    trendFg: "#344054",
  },
}

function Sparkline({ rgb, className }: { rgb: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 72 28"
      fill="none"
      aria-hidden
      className={cn("h-7 w-[4.5rem] overflow-visible", className)}
      style={{ filter: `drop-shadow(0 3px 5px rgba(${rgb},0.55))` }}
    >
      <path
        d="M1 20 C8 18, 12 10, 20 12 S32 22, 40 14 S52 4, 71 8"
        stroke={`rgb(${rgb})`}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function StatCard({
  label,
  value,
  icon: Icon,
  icon3d,
  tone = "lime",
  trend,
  trendStyle = "pill",
  caption,
  badge,
  footer,
  sparkline = true,
  className,
  delay = 0,
}: {
  label: string
  value: string
  icon?: LucideIcon
  icon3d?: Icon3DKey
  tone?: StatCardTone
  trend?: string
  /** "pill" puts the trend in a tinted chip; "text" shows it as plain coloured text. */
  trendStyle?: "pill" | "text"
  caption?: string
  badge?: ReactNode
  footer?: ReactNode
  sparkline?: boolean
  className?: string
  delay?: number
}) {
  const config = TONES[tone]
  const cardStyle: CSSProperties = config.tint
    ? { background: config.tint.background, borderColor: config.tint.border }
    : {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={{ y: -2, boxShadow: "0 12px 28px -16px rgba(16,24,40,0.18)" }}
      style={cardStyle}
      className={cn(
        "group relative isolate flex flex-col gap-3 overflow-hidden rounded-[20px] border border-[#E6E9E7] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        className,
      )}
    >
      {/* Top-left accent: a short coloured bar with a soft glow spilling down behind the label. */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 -z-10 h-20 w-3/5"
        style={{
          background: `radial-gradient(ellipse 80% 100% at 20% 0%, rgba(${config.rgb},0.22), transparent 70%)`,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-[5px] w-[45%] rounded-br-full"
        style={{
          background: `linear-gradient(90deg, rgb(${config.rgb}) 0%, rgb(${config.rgb}) 80%, rgba(${config.rgb},0.35) 100%)`,
        }}
      />

      <div className="flex items-start justify-between gap-3">
        <span className="text-[13px] font-semibold text-[#1D2939]">{label}</span>
        {icon3d ? (
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--icon-bg) shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-[background-color,box-shadow] duration-200 group-hover:bg-transparent group-hover:shadow-none"
            style={{ "--icon-bg": config.iconBg } as CSSProperties}
          >
            <Icon3D name={icon3d} size={30} className="drop-shadow-[0_4px_8px_rgba(16,24,40,0.14)]" />
          </span>
        ) : Icon ? (
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--icon-bg) transition-colors duration-200 group-hover:bg-transparent"
            style={{ "--icon-bg": config.iconBg, color: config.iconFg } as CSSProperties}
          >
            <Icon className="size-5" aria-hidden />
          </span>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[2rem] font-bold tracking-tight tabular-nums text-[#101828] leading-none">
            {value}
          </p>
          {trend ? (
            trendStyle === "pill" ? (
              <span
                className="mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: config.trendBg, color: config.trendFg }}
              >
                {trend}
              </span>
            ) : (
              <p className="mt-2 text-xs font-semibold" style={{ color: config.trendFg }}>
                {trend}
              </p>
            )
          ) : null}
          {badge ? <div className="mt-2">{badge}</div> : null}
          {caption ? (
            <p className="mt-1.5 text-xs leading-relaxed text-[#344054]">{caption}</p>
          ) : null}
          {footer ? <div className="mt-3">{footer}</div> : null}
        </div>
        {sparkline && !footer ? <Sparkline rgb={config.rgb} className="mb-0.5 shrink-0" /> : null}
      </div>
    </motion.div>
  )
}
