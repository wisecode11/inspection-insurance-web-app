"use client"

import * as React from "react"

import { Icon3D, type Icon3DKey } from "@/components/marketing/icon-3d"
import { cn } from "@/lib/utils"

const nodes: {
  id: string
  label: string
  icon3d: Icon3DKey
  x: number
  y: number
}[] = [
  { id: "photos", label: "Field photos", icon3d: "camera", x: 18, y: 12 },
  { id: "gps", label: "GPS stamps", icon3d: "zap", x: 50, y: 4 },
  { id: "storm", label: "Storm check", icon3d: "weather", x: 82, y: 12 },
  { id: "staff", label: "Office staff", icon3d: "users", x: 10, y: 52 },
  { id: "squares", label: "Test squares", icon3d: "clipboard", x: 90, y: 52 },
  { id: "pdf", label: "Carrier PDF", icon3d: "file", x: 50, y: 88 },
]

const HUB = { x: 50, y: 48 }

const EMERGE_MS = 1000
const STAGGER_MS = 110
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

export function ConnectHubVisual({ className }: { className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState(0)
  const [shown, setShown] = React.useState(false)
  const [settled, setSettled] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true)
      setSettled(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (!shown || settled) return
    const id = window.setTimeout(
      () => setSettled(true),
      EMERGE_MS + STAGGER_MS * nodes.length + 100,
    )
    return () => window.clearTimeout(id)
  }, [shown, settled])

  React.useEffect(() => {
    if (!settled) return
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % nodes.length)
    }, 2400)
    return () => window.clearInterval(timer)
  }, [settled])

  return (
    <div ref={ref} className={cn("relative mx-auto w-full max-w-xl", className)}>
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
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={shown ? 0 : 1}
              className={cn(
                "stroke-primary/12 motion-reduce:transition-none",
                settled && i === active && "stroke-primary/30",
              )}
              strokeWidth="0.3"
              style={{
                transition: `stroke-dashoffset ${EMERGE_MS}ms ${EASE} ${i * STAGGER_MS}ms, stroke 500ms`,
              }}
            />
          ))}

          {settled &&
            nodes.map((node, i) => (
              <line
                key={`beam-${node.id}`}
                x1={node.x}
                y1={node.y}
                x2={HUB.x}
                y2={HUB.y}
                pathLength={1}
                strokeDasharray="0.12 1.88"
                strokeDashoffset={0.12}
                strokeLinecap="round"
                stroke="#4ade9a"
                strokeWidth="0.8"
                className="connect-hub-beam"
                style={{ animationDelay: `${i * 0.45}s` }}
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
          const isActive = settled && i === active
          const delay = `${i * STAGGER_MS}ms`
          return (
            <div
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 motion-reduce:transition-none"
              style={{
                left: `${shown ? node.x : HUB.x}%`,
                top: `${shown ? node.y : HUB.y}%`,
                zIndex: settled ? (isActive ? 30 : 20) : 5,
                transition: `left ${EMERGE_MS}ms ${EASE} ${delay}, top ${EMERGE_MS}ms ${EASE} ${delay}`,
              }}
            >
              <div
                className="motion-reduce:transition-none"
                style={{
                  opacity: shown ? 1 : 0,
                  transform: shown ? "scale(1)" : "scale(0.4)",
                  transition: `opacity 600ms ease-out ${delay}, transform ${EMERGE_MS}ms ${EASE} ${delay}`,
                }}
              >
                <div
                  className={cn(
                    "connect-hub-float flex items-center gap-2 rounded-xl border bg-surface px-2.5 py-1.5 shadow-[0_10px_28px_-16px_rgba(27,67,50,0.4)] transition-[box-shadow,border-color,ring] duration-500 sm:px-3 sm:py-2",
                    isActive
                      ? "border-primary/35 shadow-[0_14px_32px_-14px_rgba(19,58,66,0.45)] ring-2 ring-primary/15"
                      : "border-border/70",
                  )}
                  style={{ animationDelay: `${i * 0.35}s` }}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center sm:size-9">
                    <Icon3D
                      name={node.icon3d}
                      size={34}
                      className="drop-shadow-[0_6px_10px_rgba(16,24,40,0.16)]"
                    />
                  </span>
                  <span className="hidden text-xs font-semibold whitespace-nowrap text-foreground sm:inline">
                    {node.label}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
