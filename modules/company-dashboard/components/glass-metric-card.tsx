import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Decorative sparkline — solid stroke, no blur. */
function Sparkline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 24"
      fill="none"
      aria-hidden
      className={cn("h-6 w-16 opacity-80", className)}
    >
      <path
        d="M1 18 C10 16, 14 8, 22 10 S34 20, 42 14 S54 4, 63 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Solid forest-green metric tile (reference cards) — no backdrop-blur / glass fog.
 */
export function GlassMetricCard({
  label,
  value,
  icon: Icon,
  emptyHint,
  caption,
  className,
}: {
  label: string
  value: string
  icon: LucideIcon
  emptyHint?: string
  caption?: string
  className?: string
}) {
  const isZero = value === "0" || value === "0%"
  const supportingText = isZero ? emptyHint : caption

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-white/10 bg-primary p-5 text-white shadow-[0_12px_28px_-16px_rgba(0,0,0,0.45)] sm:p-6",
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-white/80">{label}</span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-dark text-white ring-1 ring-white/15">
          <Icon className="size-4" aria-hidden />
        </span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "text-3xl font-bold tracking-tight tabular-nums sm:text-4xl",
              isZero ? "text-white/50" : "text-white",
            )}
          >
            {value}
          </p>
          {supportingText ? (
            <p className="mt-1.5 text-xs leading-relaxed text-white/60">{supportingText}</p>
          ) : null}
        </div>
        <Sparkline className="mb-1 shrink-0 text-[#9bc4cc]" />
      </div>
    </div>
  )
}
