import type { LucideIcon } from "lucide-react"

import { Icon3D, type Icon3DKey } from "@/components/shared/icon-3d"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

/** Standard icon chip — solid primary accent. */
export const statIconChipClass =
  "flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm"

/**
 * StatCard — metric tile with visible forest-green brand accents.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  icon3d,
  className,
  highlight,
  emptyHint,
  caption,
}: {
  label: string
  value: string
  icon: LucideIcon
  icon3d?: Icon3DKey
  className?: string
  highlight?: boolean
  emptyHint?: string
  caption?: string
}) {
  const isZero = value === "0" || value === "0%"
  const supportingText = isZero ? emptyHint : caption

  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden py-0 shadow-[0_8px_28px_-16px_rgba(19,58,66,0.18)] ring-1 ring-primary/10 transition-all duration-200 hover:-translate-y-0.5 hover:ring-primary/25 hover:shadow-[0_14px_36px_-18px_rgba(19,58,66,0.28)]",
        highlight && "bg-gradient-to-br from-primary-tint/80 to-card ring-primary/25",
        className,
      )}
    >
      <CardContent className="relative p-5 sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-transparent"
        />
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-primary-dark/70 sm:text-sm">{label}</span>
          {icon3d ? (
            <span className="flex size-10 shrink-0 items-center justify-center">
              <Icon3D name={icon3d} size={36} className="drop-shadow-[0_6px_12px_rgba(16,24,40,0.14)]" />
            </span>
          ) : (
            <span className={statIconChipClass}>
              <Icon className="size-4" aria-hidden />
            </span>
          )}
        </div>
        <p
          className={cn(
            "text-2xl font-bold tracking-tight tabular-nums sm:text-3xl",
            isZero ? "text-muted-foreground" : "text-primary",
          )}
        >
          {value}
        </p>
        {supportingText ? (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{supportingText}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
