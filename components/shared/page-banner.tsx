import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function PageBanner({
  children,
  className,
  size = "default",
}: {
  children: ReactNode
  className?: string
  size?: "default" | "lg"
}) {
  return (
    <div
      className={cn(
        "page-banner relative overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-none",
        size === "lg" ? "p-6 sm:p-8" : "p-5 sm:p-6",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-primary)_9%,transparent)_0%,color-mix(in_srgb,var(--color-primary-tint-strong)_40%,transparent)_38%,color-mix(in_srgb,var(--color-primary)_5%,transparent)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-12 size-48 rounded-full bg-primary-tint-strong/40 blur-3xl"
      />
      <div className="relative">{children}</div>
    </div>
  )
}
