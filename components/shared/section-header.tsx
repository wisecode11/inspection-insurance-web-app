import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function SectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border/40 px-5 py-4 sm:px-6",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-1.5 h-5 w-0.5 shrink-0 rounded-full bg-primary" aria-hidden />
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-base font-semibold leading-snug tracking-tight text-[var(--color-text-heading)]">
            {title}
          </h2>
          {description ? (
            <p className="text-sm leading-relaxed text-[var(--color-text-body)]">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
