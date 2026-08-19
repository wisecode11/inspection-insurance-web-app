import { TrendingUpIcon, TrendingDownIcon, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export function KpiCard({
  label,
  value,
  icon: Icon,
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
    <Card className="gap-0 py-0">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
          <div className="flex items-center gap-2">
            {delta !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-medium",
                  positive ? "text-success" : "text-danger",
                )}
              >
                {positive ? (
                  <TrendingUpIcon className="size-3.5" />
                ) : (
                  <TrendingDownIcon className="size-3.5" />
                )}
                {positive ? "+" : ""}
                {delta}%
              </span>
            )}
            {(deltaLabel || helper) && (
              <span className="text-xs text-muted-foreground">{deltaLabel ?? helper}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
