"use client"

import { motion, type MotionValue } from "framer-motion"

import { cn } from "@/lib/utils"

type Opacity = number | MotionValue<number>

/**
 * Isometric house used by the roof-journey story. Every layer's visibility is
 * driven from the outside (either a scroll-linked MotionValue on desktop, or
 * a plain 0/1 number for the static mobile / reduced-motion fallback) — this
 * component has no state or timers of its own.
 */
export function HouseIllustration({
  wallsOpacity,
  blueprintOpacity,
  oldRoofOpacity,
  newRoofOpacity,
  markersOpacity,
  scanOpacity,
  className,
}: {
  wallsOpacity: Opacity
  blueprintOpacity: Opacity
  oldRoofOpacity: Opacity
  newRoofOpacity: Opacity
  markersOpacity: Opacity
  scanOpacity?: Opacity
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-primary-dark",
        className,
      )}
    >
      <div className="roof-journey-grid pointer-events-none absolute inset-0" />
      {scanOpacity !== undefined && (
        <motion.div
          aria-hidden
          style={{ opacity: scanOpacity }}
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <span className="roof-journey-scan" />
        </motion.div>
      )}

      <svg viewBox="0 0 420 340" className="relative z-10 h-auto w-full" aria-hidden>
        <defs>
          <linearGradient id="rj-wallL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e8e0d2" />
            <stop offset="100%" stopColor="#cfc6b6" />
          </linearGradient>
          <linearGradient id="rj-wallR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d5cdc0" />
            <stop offset="100%" stopColor="#b7ae9f" />
          </linearGradient>
          <linearGradient id="rj-roofOld" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6a6358" />
            <stop offset="100%" stopColor="#4a453c" />
          </linearGradient>
          <linearGradient id="rj-roofNew" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0f5c43" />
            <stop offset="100%" stopColor="#063728" />
          </linearGradient>
          <linearGradient id="rj-roofNewR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8ce0b0" />
            <stop offset="100%" stopColor="#4ade9a" />
          </linearGradient>
        </defs>

        <ellipse cx="210" cy="292" rx="128" ry="16" className="fill-black/30" />

        {/* Walls: the house itself, present from the moment it's captured */}
        <motion.g style={{ opacity: wallsOpacity }}>
          <path d="M92 168 L210 228 L210 292 L92 232 Z" fill="url(#rj-wallL)" />
          <path d="M210 228 L328 168 L328 232 L210 292 Z" fill="url(#rj-wallR)" />
          <rect x="164" y="236" width="32" height="44" fill="#0f4c81" opacity="0.85" />
          <rect x="118" y="198" width="28" height="22" fill="#8fb4cc" />
          <rect x="248" y="198" width="28" height="22" fill="#6f93ab" />
          <rect x="286" y="186" width="22" height="18" fill="#6f93ab" />
        </motion.g>

        {/* Existing roof, as photographed on site */}
        <motion.g style={{ opacity: oldRoofOpacity }}>
          <path d="M210 72 L88 138 L210 198 L332 138 Z" fill="url(#rj-roofOld)" />
          <path d="M210 72 L332 138 L332 158 L210 92 Z" fill="#3f3a33" />
          <path d="M198 86 L222 86 L228 102 L192 102 Z" fill="#2c2c2a" />
        </motion.g>

        {/* New roof, once the report is approved */}
        <motion.g style={{ opacity: newRoofOpacity }}>
          <path d="M210 72 L88 138 L210 198 L332 138 Z" fill="url(#rj-roofNew)" />
          <path d="M210 72 L332 138 L332 158 L210 92 Z" fill="url(#rj-roofNewR)" />
          <path d="M198 86 L222 86 L228 102 L192 102 Z" fill="#063728" />
          <circle cx="318" cy="108" r="14" fill="var(--success)" />
          <path
            d="M312 108 L316 112 L326 100"
            fill="none"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </motion.g>

        {/* Storm-verification markers */}
        <motion.g style={{ opacity: markersOpacity }}>
          <circle className="roof-journey-pin" cx="156" cy="142" r="7" fill="var(--warning)" />
          <circle className="roof-journey-pin" cx="214" cy="158" r="7" fill="#d97706" />
          <circle className="roof-journey-pin" cx="268" cy="132" r="7" fill="var(--warning)" />
          <circle cx="156" cy="142" r="12" fill="none" stroke="var(--warning)" strokeWidth="1.5" opacity="0.7" />
          <circle cx="268" cy="132" r="12" fill="none" stroke="var(--warning)" strokeWidth="1.5" opacity="0.7" />
          <rect x="236" y="96" width="86" height="22" rx="4" fill="var(--warning)" />
          <text x="279" y="111" textAnchor="middle" fill="#1c1403" fontSize="10" fontFamily="ui-sans-serif">
            Hail hits
          </text>
        </motion.g>

        {/* Blueprint linework: prominent before the house resolves, a faint watermark after */}
        <motion.g fill="none" stroke="#8ce0b0" strokeWidth="1.1" style={{ opacity: blueprintOpacity }}>
          <path d="M210 72 L88 138 L210 198 L332 138 Z" />
          <path d="M210 72 L332 138 L332 158 L210 92 Z" />
          <path d="M88 138 L88 202 L210 262 L210 198" />
          <path d="M332 138 L332 202 L210 262" />
          <path d="M88 202 L210 262 L332 202" />
          <path d="M210 92 L210 262" />
          <path d="M118 198 L146 212 L146 234 L118 220 Z" />
          <path d="M248 198 L276 184 L276 206 L248 220 Z" />
          <path d="M164 236 L196 252 L196 280 L164 264 Z" />
        </motion.g>
      </svg>
    </div>
  )
}
