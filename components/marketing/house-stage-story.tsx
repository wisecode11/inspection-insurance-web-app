"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const stages = [
  { id: "blueprint", label: "Blueprint" },
  { id: "house", label: "3D House" },
  { id: "inspect", label: "Inspection" },
  { id: "new", label: "New roof" },
] as const

type Stage = (typeof stages)[number]["id"]

export function HouseStageStory() {
  const [stage, setStage] = React.useState<Stage>("blueprint")
  const index = stages.findIndex((s) => s.id === stage)

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setStage((current) => {
        const i = stages.findIndex((s) => s.id === current)
        return stages[(i + 1) % stages.length].id
      })
    }, 2800)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a3a63]">
        <div className="hero-blueprint pointer-events-none absolute inset-0 opacity-40" />
        {stage === "blueprint" && <span className="hero-scan" />}

        <svg viewBox="0 0 420 340" className="relative z-10 h-auto w-full" aria-hidden>
          <defs>
            <linearGradient id="wallL" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e8e0d2" />
              <stop offset="100%" stopColor="#cfc6b6" />
            </linearGradient>
            <linearGradient id="wallR" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d5cdc0" />
              <stop offset="100%" stopColor="#b7ae9f" />
            </linearGradient>
            <linearGradient id="roofOld" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6a6358" />
              <stop offset="100%" stopColor="#4a453c" />
            </linearGradient>
            <linearGradient id="roofNew" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3d7eb0" />
              <stop offset="100%" stopColor="#0f4c81" />
            </linearGradient>
            <linearGradient id="roofNewR" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          <ellipse cx="210" cy="292" rx="128" ry="16" className="fill-black/30" />

          {/* Walls */}
          <g
            className={cn(
              "transition-opacity duration-700",
              stage === "blueprint" ? "opacity-0" : "opacity-100",
            )}
          >
            <path d="M92 168 L210 228 L210 292 L92 232 Z" fill="url(#wallL)" />
            <path d="M210 228 L328 168 L328 232 L210 292 Z" fill="url(#wallR)" />
            <rect x="164" y="236" width="32" height="44" fill="#0f4c81" opacity="0.85" />
            <rect x="118" y="198" width="28" height="22" fill="#8fb4cc" />
            <rect x="248" y="198" width="28" height="22" fill="#6f93ab" />
            <rect x="286" y="186" width="22" height="18" fill="#6f93ab" />
          </g>

          {/* Old roof */}
          <g
            className={cn(
              "transition-opacity duration-700",
              stage === "house" || stage === "inspect" ? "opacity-100" : "opacity-0",
            )}
          >
            <path d="M210 72 L88 138 L210 198 L332 138 Z" fill="url(#roofOld)" />
            <path d="M210 72 L332 138 L332 158 L210 92 Z" fill="#3f3a33" />
            <path d="M198 86 L222 86 L228 102 L192 102 Z" fill="#2c2c2a" />
          </g>

          {/* New roof */}
          <g
            className={cn(
              "transition-opacity duration-700",
              stage === "new" ? "opacity-100" : "opacity-0",
            )}
          >
            <path d="M210 72 L88 138 L210 198 L332 138 Z" fill="url(#roofNew)" />
            <path d="M210 72 L332 138 L332 158 L210 92 Z" fill="url(#roofNewR)" />
            <path d="M198 86 L222 86 L228 102 L192 102 Z" fill="#0a3a63" />
            <circle cx="318" cy="108" r="14" fill="#16a34a" />
            <path d="M312 108 L316 112 L326 100" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
          </g>

          {/* Inspection markers */}
          <g
            className={cn(
              "transition-opacity duration-500",
              stage === "inspect" ? "opacity-100" : "opacity-0",
            )}
          >
            <circle className="hero-pin" cx="156" cy="142" r="7" fill="#f59e0b" />
            <circle className="hero-pin" cx="214" cy="158" r="7" fill="#d97706" />
            <circle className="hero-pin" cx="268" cy="132" r="7" fill="#f59e0b" />
            <circle cx="156" cy="142" r="12" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.7" />
            <circle cx="268" cy="132" r="12" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.7" />
            <rect x="236" y="96" width="86" height="22" rx="4" fill="#f59e0b" />
            <text x="279" y="111" textAnchor="middle" fill="#1c1403" fontSize="10" fontFamily="ui-sans-serif">
              Hail hits
            </text>
          </g>

          {/* Blueprint strokes on top */}
          <g
            fill="none"
            stroke={stage === "blueprint" ? "#8ecae6" : "rgba(255,255,255,0.18)"}
            strokeWidth={stage === "blueprint" ? 1.6 : 0.8}
            className={cn(stage === "blueprint" && "hero-draw")}
          >
            <path d="M210 72 L88 138 L210 198 L332 138 Z" />
            <path d="M210 72 L332 138 L332 158 L210 92 Z" />
            <path d="M88 138 L88 202 L210 262 L210 198" />
            <path d="M332 138 L332 202 L210 262" />
            <path d="M88 202 L210 262 L332 202" />
            <path d="M210 92 L210 262" />
            <path d="M118 198 L146 212 L146 234 L118 220 Z" />
            <path d="M248 198 L276 184 L276 206 L248 220 Z" />
            <path d="M164 236 L196 252 L196 280 L164 264 Z" />
          </g>
        </svg>
      </div>

      <ol className="mt-4 grid grid-cols-4 gap-2">
        {stages.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setStage(item.id)}
              className={cn(
                "w-full rounded-lg border px-1.5 py-2 text-center text-[11px] font-medium transition-colors sm:text-xs",
                i === index
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10",
              )}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
