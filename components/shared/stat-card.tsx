import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

/** Standard icon chip — primary-tint bg + primary icon (app-wide). */
export const statIconChipClass =
  "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary"

/**
 * StatCard — metric tile for dashboards and analytics.
 * Uses design tokens: surface white, border, primary-tint chips, primary-dark values.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  className,
  highlight,
  emptyHint,
  caption,
}: {
  label: string
  value: string
  icon: LucideIcon
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
        "gap-0 py-0 transition-colors duration-200 hover:border-primary",
        highlight && "border-primary/30",
        className,
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</span>
          <span className={statIconChipClass}>
            <Icon className="size-4" aria-hidden />
          </span>
        </div>
        <p
          className={cn(
            "text-2xl font-bold tracking-tight tabular-nums sm:text-3xl",
            isZero ? "text-muted-foreground" : "text-primary-dark",
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
