import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import {
  CheckCircle2Icon,
  ClipboardListIcon,
  ClockIcon,
  FileEditIcon,
  XCircleIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

export type ActivityTimelineItem = {
  id: string
  title: string
  description: string
  time: string
  type: "completed" | "pending" | "cancelled" | "draft" | "updated"
  meta?: ReactNode
  action?: ReactNode
}

const typeConfig: Record<
  ActivityTimelineItem["type"],
  { icon: LucideIcon; iconClass: string; dotClass: string }
> = {
  completed: {
    icon: CheckCircle2Icon,
    iconClass: "bg-success/10 text-success",
    dotClass: "bg-success",
  },
  pending: {
    icon: ClockIcon,
    iconClass: "bg-warning/10 text-warning",
    dotClass: "bg-warning",
  },
  cancelled: {
    icon: XCircleIcon,
    iconClass: "bg-destructive/10 text-destructive",
    dotClass: "bg-destructive",
  },
  draft: {
    icon: FileEditIcon,
    iconClass: "bg-primary-tint text-primary",
    dotClass: "bg-primary",
  },
  updated: {
    icon: ClipboardListIcon,
    iconClass: "bg-primary-tint-strong text-primary-dark",
    dotClass: "bg-primary-dark",
  },
}

/**
 * ActivityTimeline — vertical feed with per-type icons for job/report activity.
 */
export function ActivityTimeline({
  items,
  className,
}: {
  items: ActivityTimelineItem[]
  className?: string
}) {
  return (
    <ol className={cn("relative", className)}>
      {items.map((item, index) => {
        const config = typeConfig[item.type]
        const Icon = config.icon
        const isLast = index === items.length - 1

        return (
          <li
            key={item.id}
            className={cn(
              "relative flex gap-4 pb-6 pl-1 transition-colors last:pb-0",
              !isLast && "before:absolute before:top-10 before:bottom-0 before:left-[1.125rem] before:w-px before:bg-border",
            )}
          >
            <span
              className={cn(
                "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ring-card",
                config.iconClass,
              )}
            >
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {item.meta}
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                {item.action}
              </div>
              <time className="shrink-0 text-xs text-muted-foreground tabular-nums">{item.time}</time>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
