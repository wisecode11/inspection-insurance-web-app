"use client"

import { cn } from "@/lib/utils"

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

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <p className="text-sm font-semibold text-[#101828]">{label}</p>
        <p className="text-2xl font-bold tabular-nums text-[#101828]">{clamped}%</p>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EEF1EF]">
        <div
          className="h-full rounded-full bg-[#063728] transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {helper ? <p className="text-xs leading-relaxed text-[#667085]">{helper}</p> : null}
    </div>
  )
}
