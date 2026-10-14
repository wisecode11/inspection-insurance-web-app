"use client"

import type { ReactNode } from "react"

import { useTilt } from "@/components/shared/use-tilt"
import { cn } from "@/lib/utils"

/**
 * Client wrapper that gives its child card the dashboard's 3D hover tilt.
 * Sets `--mx` / `--my` for a spotlight layer inside the card (`group-hover/tilt:`).
 */
export function TiltSurface({ className, children }: { className?: string; children: ReactNode }) {
  const tilt = useTilt<HTMLDivElement>()
  return (
    <div
      {...tilt.bind}
      style={{ transform: tilt.transform }}
      className={cn(
        "group/tilt [transform-style:preserve-3d] transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] will-change-transform",
        className,
      )}
    >
      {children}
    </div>
  )
}
