import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Decorative sparkline for metric cards. */
function Sparkline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 24"
      fill="none"
      aria-hidden
      className={cn("h-6 w-16", className)}
    >
      <path
        d="M1 18 C10 16, 14 8, 22 10 S34 20, 42 14 S54 4, 63 8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Light metric tile — white card, dark type, teal accents (Wise Studio).
 */
export function GlassMetricCard({
  label,
  value,
  icon: Icon,
  emptyHint,
  caption,
  trend,
  accent,
  footer,
  className,
}: {
  label: string
  value: string
  icon: LucideIcon
  emptyHint?: string
  caption?: string
  trend?: string
  accent?: "default" | "warning" | "success"
  footer?: ReactNode
  className?: string
}) {
  const isZero = value === "0" || value === "0%"
  const supportingText = isZero ? emptyHint : caption

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-xl border border-[#e4e9eb] bg-white p-5 shadow-[0_1px_2px_rgba(15,40,46,0.04)] sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
        <span
          className={cn(
            "relative flex size-9 shrink-0 items-center justify-center rounded-lg",
            accent === "warning"
              ? "bg-red-50 text-red-600"
              : "bg-primary-tint text-primary",
          )}
        >
          <Icon className="size-4" aria-hidden />
          {accent === "warning" ? (
            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-red-500 ring-2 ring-white" />
          ) : null}
        </span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "text-3xl font-bold tracking-tight tabular-nums text-primary-dark sm:text-[2rem]",
              isZero && "text-muted-foreground/70",
            )}
          >
            {value}
          </p>
          {trend ? (
            <p className="mt-1.5 text-xs font-medium text-[#2f9e6a]">{trend}</p>
          ) : null}
          {supportingText ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{supportingText}</p>
          ) : null}
          {footer ? <div className="mt-2">{footer}</div> : null}
        </div>
        {!footer ? (
          <Sparkline
            className={cn(
              "mb-1 shrink-0",
              accent === "warning" ? "text-red-300" : "text-[#7dcea0]",
            )}
          />
        ) : null}
      </div>
    </div>
  )
}
