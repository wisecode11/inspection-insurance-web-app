"use client"

import { motion } from "framer-motion"

import { CountUp } from "@/components/company-dashboard/count-up"
import { cn } from "@/lib/utils"

const R = 40
const CIRCUMFERENCE = 2 * Math.PI * R

/** Progress ring with label + helper, as in the "At a glance" panel. */
export function ProgressWidget({
  label = "Monthly Target Reached",
  percent,
  helper,
  className,
}: {
  label?: string
  percent: number
  helper?: string
  className?: string
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)))
  // Keep a visible sliver even at 0%.
  const offset = CIRCUMFERENCE * (1 - Math.max(clamped, 0.5) / 100)

  return (
    <div className={cn("flex items-center gap-[18px]", className)}>
      <div
        className="relative size-24 shrink-0"
        role="img"
        aria-label={`${label}: ${clamped}%`}
      >
        <svg viewBox="0 0 96 96" className="size-24 -rotate-90" aria-hidden>
          <defs>
            <linearGradient id="rc-ring-grad" x1="0" x2="1">
              <stop offset="0" stopColor="#2FBF6B" />
              <stop offset="1" stopColor="#8CE0B0" />
            </linearGradient>
          </defs>
          <circle cx="48" cy="48" r={R} fill="none" strokeWidth="9" stroke="#F1F5F3" />
          <motion.circle
            cx="48"
            cy="48"
            r={R}
            fill="none"
            strokeWidth="9"
            strokeLinecap="round"
            stroke="url(#rc-ring-grad)"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            whileInView={{ strokeDashoffset: offset }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </svg>
        <b className="absolute inset-0 grid place-items-center text-[22px] font-extrabold tracking-[-0.02em] text-[#0B1712]">
          <span>
            <CountUp value={clamped} />%
          </span>
        </b>
      </div>
      <div>
        <h4 className="m-0 text-[15px] font-semibold text-[#0B1712]">{label}</h4>
        {helper ? <p className="mt-1 text-[13.5px] text-[#667085]">{helper}</p> : null}
      </div>
    </div>
  )
}
