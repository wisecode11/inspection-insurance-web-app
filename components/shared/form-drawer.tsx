"use client"

import type { ReactNode } from "react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const sizeClass = {
  default: "sm:w-[clamp(20rem,25vw,30rem)]",
  lg: "sm:w-[clamp(22rem,28vw,36rem)]",
  xl: "sm:w-[clamp(24rem,32vw,42rem)]",
  full: "sm:w-[clamp(26rem,38vw,48rem)]",
} as const

/**
 * FormDrawer — right-side panel for create/edit forms (replaces center modals).
 */
export function FormDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "lg",
  side = "right",
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  size?: keyof typeof sizeClass
  side?: "left" | "right"
  className?: string
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-slot="form-drawer"
        side={side}
        className={cn(
          "flex w-full max-w-full flex-col gap-0 border-border p-0 shadow-xl sm:max-w-none",
          sizeClass[size],
          className,
        )}
      >
        <SheetHeader className="shrink-0 border-b border-border px-6 py-5 text-left">
          <SheetTitle className="text-lg font-semibold text-[var(--color-text-heading)]">
            {title}
          </SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>

        {children ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        ) : null}

        {footer ? (
          <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border bg-primary-tint/30 px-6 py-4">
            {footer}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
