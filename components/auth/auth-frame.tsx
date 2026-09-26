"use client"

import type { ReactNode } from "react"

import { AuthShowcase } from "@/components/auth/auth-showcase"
import { BrandMark } from "@/components/brand-mark"
import { ThemeToggle } from "@/components/theme-toggle"
import { roleMeta } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import type { Role } from "@/types/role"

export function AuthFrame({
  title,
  description,
  role,
  children,
  footer,
  wide,
  eyebrow,
}: {
  title: string
  description: string
  role: Role
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
  eyebrow?: string
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthShowcase roleLabel={roleMeta[role].label} />

      <div className="relative flex flex-col overflow-hidden bg-white">
        {/* Soft green wash: bottom → middle + right → middle */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_100%,color-mix(in_oklab,var(--primary)_32%,transparent),transparent_68%),radial-gradient(ellipse_70%_90%_at_100%_50%,color-mix(in_oklab,var(--primary)_28%,transparent),transparent_65%),radial-gradient(ellipse_55%_50%_at_100%_100%,color-mix(in_oklab,var(--color-accent-cta)_22%,transparent),transparent_60%)]"
        />
        <div className="relative z-10 flex items-center justify-between px-6 py-5 lg:justify-end">
          <span className="lg:hidden">
            <BrandMark href="/" />
          </span>
          <ThemeToggle />
        </div>
        <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-8">
          <div
            className={cn(
              "w-full",
              wide
                ? "max-w-4xl rounded-2xl border border-border/70 bg-card p-6 shadow-[0_28px_60px_-28px_rgba(6,55,40,0.35)] sm:p-8"
                : "beam-edge-card max-w-[420px] rounded-2xl border border-border/70 bg-card p-6 shadow-[0_28px_60px_-28px_rgba(6,55,40,0.35),0_2px_8px_rgba(16,24,40,0.05)] sm:p-8",
            )}
          >
            {eyebrow && (
              <p className="mb-2 text-xs font-semibold tracking-wider text-primary uppercase">{eyebrow}</p>
            )}
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            <div className="mt-8">{children}</div>
            {footer}
          </div>
        </div>
      </div>
    </div>
  )
}
