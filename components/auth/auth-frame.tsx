"use client"

import type { ReactNode } from "react"

import { BrandMark } from "@/components/brand-mark"
import { ThemeToggle } from "@/components/theme-toggle"
import { roleMeta } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import type { Role } from "@/types/role"

const PANEL_IMG = "/images/roof-inspect.png"

export function AuthFrame({
  title,
  description,
  role,
  children,
  footer,
  wide,
}: {
  title: string
  description: string
  role: Role
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={PANEL_IMG} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-primary/78" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-primary-foreground">
          <BrandMark href="/" onDark />
          <div>
            <p className="text-xs font-medium tracking-wider text-terracotta uppercase">
              {roleMeta[role].label}
            </p>
            <p className="mt-3 max-w-sm text-3xl font-semibold tracking-tight">
              Roof evidence the carrier can trust.
            </p>
            <div className="mt-5 h-1 w-16 rounded-full bg-terracotta" />
          </div>
        </div>
      </div>

      <div className="relative flex flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 lg:justify-end">
          <span className="lg:hidden">
            <BrandMark href="/" />
          </span>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-8">
          <div className={cn("w-full", wide ? "max-w-4xl" : "max-w-[420px]")}>
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
