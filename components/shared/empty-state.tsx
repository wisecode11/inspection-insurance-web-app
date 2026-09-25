import type { LucideIcon } from "lucide-react"

import { Icon3D, type Icon3DKey } from "@/components/shared/icon-3d"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

/**
 * EmptyState — intentional zero-data placeholder for cards, tables, and panels.
 */
export function EmptyState({
  icon: Icon,
  icon3d,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  icon3d?: Icon3DKey
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <Empty
      className={cn(
        "border border-dashed border-border bg-primary-tint/40 py-10 shadow-none",
        className,
      )}
    >
      <EmptyHeader>
        {icon3d ? (
          <EmptyMedia variant="icon" className="size-14 rounded-xl bg-transparent shadow-none">
            <Icon3D name={icon3d} size={48} className="drop-shadow-[0_8px_14px_rgba(16,24,40,0.14)]" />
          </EmptyMedia>
        ) : (
          <EmptyMedia variant="icon" className="size-11 rounded-lg bg-primary-tint text-primary">
            <Icon className="size-5" aria-hidden />
          </EmptyMedia>
        )}
        <EmptyTitle className="text-sm font-semibold text-foreground">{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  )
}
