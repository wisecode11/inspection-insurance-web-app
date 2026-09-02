import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("page-header-card rounded-[var(--radius)] bg-card", className)}>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          {eyebrow ? (
            <span className="inline-flex w-fit items-center text-[11px] font-semibold tracking-widest text-primary uppercase">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="text-xl font-bold tracking-tight text-balance text-[var(--color-text-heading)] sm:text-2xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-text-body)] text-pretty">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
