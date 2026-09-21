"use client"

import {
  CameraIcon,
  CloudSunIcon,
  FileTextIcon,
  MapPinIcon,
  SquareCheckIcon,
  UsersIcon,
} from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const nodes = [
  { id: "photos", label: "Field photos", icon: CameraIcon, x: 18, y: 12 },
  { id: "gps", label: "GPS stamps", icon: MapPinIcon, x: 50, y: 4 },
  { id: "storm", label: "Storm check", icon: CloudSunIcon, x: 82, y: 12 },
  { id: "staff", label: "Office staff", icon: UsersIcon, x: 10, y: 52 },
  { id: "squares", label: "Test squares", icon: SquareCheckIcon, x: 90, y: 52 },
  { id: "pdf", label: "Carrier PDF", icon: FileTextIcon, x: 50, y: 88 },
] as const

const HUB = { x: 50, y: 48 }

export function ConnectHubVisual({ className }: { className?: string }) {
  const [active, setActive] = React.useState(0)

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % nodes.length)
    }, 2400)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className={cn("relative mx-auto w-full max-w-xl", className)}>
      <div className="connect-hub relative aspect-[1.05/1] w-full sm:aspect-square">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {nodes.map((node, i) => (
            <line
              key={node.id}
              x1={HUB.x}
              y1={HUB.y}
              x2={node.x}
              y2={node.y}
              className={cn(
                "stroke-primary/25 transition-[stroke] duration-500",
                i === active && "stroke-primary/55",
              )}
              strokeWidth="0.35"
              strokeDasharray="1.2 1.1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${HUB.x}%`, top: `${HUB.y}%` }}
        >
          <div className="connect-hub-float w-[min(46vw,220px)] rounded-2xl border border-border/80 bg-surface p-4 text-center shadow-[0_16px_40px_-20px_rgba(27,67,50,0.35)] sm:w-[210px] sm:p-5">
            <p className="text-sm font-bold leading-snug text-foreground sm:text-[15px]">
              You already capture the roof.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
              The problem is the claim file never comes together.
            </p>
          </div>
        </div>

        {nodes.map((node, i) => {
          const Icon = node.icon
          const isActive = i === active
          return (
            <div
              key={node.id}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                zIndex: isActive ? 30 : 20,
              }}
            >
              <div
                className={cn(
                  "connect-hub-float flex items-center gap-2 rounded-xl border bg-surface px-2.5 py-2 shadow-[0_10px_28px_-16px_rgba(27,67,50,0.4)] transition-[box-shadow,border-color,ring] duration-500 sm:px-3",
                  isActive
                    ? "border-primary/35 shadow-[0_14px_32px_-14px_rgba(19,58,66,0.45)] ring-2 ring-primary/15"
                    : "border-border/70",
                )}
                style={{ animationDelay: `${i * 0.35}s` }}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-500",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary-tint text-primary",
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <span className="hidden text-xs font-semibold whitespace-nowrap text-foreground sm:inline">
                  {node.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
