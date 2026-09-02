import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

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
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
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
        <EmptyMedia variant="icon" className="size-11 rounded-lg bg-primary-tint text-primary">
          <Icon className="size-5" aria-hidden />
        </EmptyMedia>
        <EmptyTitle className="text-sm font-semibold text-foreground">{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  )
}
