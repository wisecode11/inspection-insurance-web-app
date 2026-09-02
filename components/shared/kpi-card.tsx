import { TrendingUpIcon, TrendingDownIcon, type LucideIcon } from "lucide-react"

import { StatCard } from "@/components/shared/stat-card"
import { cn } from "@/lib/utils"

/** KpiCard — metric with optional delta trend (platform/analytics dashboards). */
export function KpiCard({
  label,
  value,
  icon,
  delta,
  deltaLabel,
  helper,
}: {
  label: string
  value: string
  icon: LucideIcon
  delta?: number
  deltaLabel?: string
  helper?: string
}) {
  const positive = (delta ?? 0) >= 0

  return (
    <div className="flex flex-col gap-2">
      <StatCard label={label} value={value} icon={icon} emptyHint={helper} />
      {delta !== undefined && (
        <div className="flex items-center gap-2 px-1">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium",
              positive ? "text-success" : "text-danger",
            )}
          >
            {positive ? <TrendingUpIcon className="size-3.5" /> : <TrendingDownIcon className="size-3.5" />}
            {positive ? "+" : ""}
            {delta}%
          </span>
          {deltaLabel ? <span className="text-xs text-muted-foreground">{deltaLabel}</span> : null}
        </div>
      )}
    </div>
  )
}
