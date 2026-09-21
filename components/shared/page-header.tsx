import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Soft cream-zone page header for company screens below the green hero band. */
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
    <div
      className={cn(
        "page-header-card rounded-lg bg-card shadow-[0_16px_40px_-20px_rgba(26,46,40,0.22)] ring-1 ring-black/5",
        className,
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6 lg:p-7">
        <div className="flex min-w-0 flex-col gap-1.5">
          {eyebrow ? (
            <span className="inline-flex w-fit items-center rounded-md bg-primary-tint px-2.5 py-0.5 text-[11px] font-semibold tracking-widest text-primary uppercase">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="font-serif text-2xl font-normal tracking-tight text-balance text-primary-dark sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-text-body)] text-pretty">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  )
}
