"use client"

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

function Sparkline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 28" fill="none" aria-hidden className={cn("h-7 w-[4.5rem]", className)}>
      <path
        d="M1 20 C8 18, 12 10, 20 12 S32 22, 40 14 S52 4, 71 8"
        stroke="currentColor"
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
  trend,
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
  trend?: string
  caption?: string
  badge?: ReactNode
  footer?: ReactNode
  sparkline?: boolean
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={{ y: -2, boxShadow: "0 12px 28px -16px rgba(16,24,40,0.18)" }}
      className={cn(
        "flex flex-col gap-3 rounded-[20px] border border-[#E6E9E7] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[13px] font-medium text-[#667085]">{label}</span>
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F5EF] text-[#0A4B37]">
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[2rem] font-bold tracking-tight tabular-nums text-[#101828] leading-none">
            {value}
          </p>
          {trend ? (
            <p className="mt-2 text-xs font-semibold text-[#12B76A]">{trend}</p>
          ) : null}
          {badge ? <div className="mt-2">{badge}</div> : null}
          {caption ? (
            <p className="mt-1.5 text-xs leading-relaxed text-[#667085]">{caption}</p>
          ) : null}
          {footer ? <div className="mt-3">{footer}</div> : null}
        </div>
        {sparkline && !footer ? (
          <Sparkline className="mb-0.5 shrink-0 text-[#12B76A]" />
        ) : null}
      </div>
    </motion.div>
  )
}
