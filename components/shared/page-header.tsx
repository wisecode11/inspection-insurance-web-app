import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Light page header for company screens under the dark ops bar. */
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
        "page-header-card rounded-[20px] border border-[#E6E9E7] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        className,
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          {eyebrow ? (
            <span className="inline-flex w-fit items-center rounded-lg bg-[#063728] px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-white uppercase">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="text-2xl font-bold tracking-tight text-balance text-[#101828] sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-[#667085] text-pretty">
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
