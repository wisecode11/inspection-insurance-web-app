import type { LucideIcon } from "lucide-react"

import { statIconChipClass } from "@/components/shared/stat-card"
import { cn } from "@/lib/utils"

export function PageStatChip({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: string | number
  icon?: LucideIcon
  tone?: "default" | "brand" | "success" | "warning"
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2.5 rounded-[var(--radius)] border border-border bg-card px-3.5 py-2.5 shadow-none",
        tone === "success" && "border-success/20",
        tone === "warning" && "border-warning/25",
      )}
    >
      {Icon ? (
        <span
          className={cn(
            statIconChipClass,
            tone === "success" && "bg-success/12 text-success",
            tone === "warning" && "bg-warning/14 text-warning",
          )}
        >
          <Icon className="size-4" />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-bold tracking-tight tabular-nums text-primary-dark">{value}</p>
      </div>
    </div>
  )
}
