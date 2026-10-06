"use client"

import * as React from "react"
import { MotionConfig, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion"
import { LockKeyholeIcon } from "lucide-react"

import { AuthAurora } from "@/components/auth/auth-aurora"
import { AuthSceneProvider } from "@/components/auth/auth-scene-context"
import { AuthVisualPanel, type AuthVisualCopy } from "@/components/auth/auth-visual-panel"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

/** Off-screen bleed on the panel's outer edge so only the inner curve shows. */
const BLEED_VW = 8

/** Matches the panel widths below: md 50%, lg 57% (wide: 40%). */
function useOverhang(wide: boolean) {
  const [overhang, setOverhang] = React.useState(0)
  React.useEffect(() => {
    const md = window.matchMedia("(min-width: 768px)")
    const lg = window.matchMedia("(min-width: 1024px)")
    const update = () => {
      if (!md.matches) return setOverhang(0)
      const share = wide ? 40 : lg.matches ? 57 : 50
      setOverhang(BLEED_VW / (share + BLEED_VW))
    }
    update()
    md.addEventListener("change", update)
    lg.addEventListener("change", update)
    return () => {
      md.removeEventListener("change", update)
      lg.removeEventListener("change", update)
    }
  }, [wide])
  return overhang
}

const swap = { type: "spring", stiffness: 70, damping: 18, mass: 1.1 } as const

/**
 * Split auth layout: immersive visual panel + glass form card, divided by
 * a living curve. Changing `side` swaps the two halves with a layout
 * animation (used for login ↔ signup). On mobile the visual becomes a
 * full-bleed backdrop with the card centred on top.
 */
export function AuthShell({
  side = "left",
  copy,
  copyKey = "default",
  wide = false,
  children,
}: {
  side?: "left" | "right"
  copy: AuthVisualCopy
  copyKey?: string
  wide?: boolean
  children: React.ReactNode
}) {
  const overhang = useOverhang(wide)

  return (
    <MotionConfig reducedMotion="user">
      <AuthSceneProvider>
        <main
          className={cn(
            "relative min-h-svh overflow-hidden bg-[#f3f7f5] text-foreground dark:bg-[#050f0c] md:flex md:h-svh",
            side === "right" && "md:flex-row-reverse",
          )}
        >
          <AuthAurora tone="page" className="hidden md:block" />

          <motion.div
            layout="position"
            transition={swap}
            className={cn(
              "fixed inset-0 z-0 md:relative md:inset-auto md:z-20 md:h-svh md:shrink-0",
              wide ? "md:w-[calc(40%+8vw)]" : "md:w-[calc(50%+8vw)] lg:w-[calc(57%+8vw)]",
              side === "left" ? "md:-ml-[8vw]" : "md:-mr-[8vw]",
            )}
          >
            <AuthVisualPanel side={side} overhang={overhang} copy={copy} copyKey={copyKey} className="absolute inset-0" />
          </motion.div>

          <motion.section
            layout="position"
            transition={swap}
            className="relative z-10 flex min-h-svh flex-1 flex-col md:h-svh md:min-h-0 md:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {/* Toggle + footer float over the column so the card gets the full height. */}
            <div className={cn("absolute top-4 z-10", side === "left" ? "right-4 sm:right-6" : "right-4 sm:right-6 md:right-auto md:left-6")}>
              <ThemeToggle className="size-10 rounded-full bg-white/70 backdrop-blur-md dark:bg-white/10" />
            </div>
            <div className="flex flex-1 items-center justify-center px-4 pt-16 pb-12 sm:px-8 md:py-10">
              <GlassCard wide={wide}>{children}</GlassCard>
            </div>
            <p className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 px-5 text-[11px] text-white/70 md:text-muted-foreground">
              <LockKeyholeIcon className="size-3" />
              Encrypted sign-in · Company-scoped access
            </p>
          </motion.section>
        </main>
      </AuthSceneProvider>
    </MotionConfig>
  )
}

/** Frosted card with a soft reflection and a very slight pointer tilt. */
function GlassCard({ wide, children }: { wide: boolean; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const rotateX = useSpring(rx, { stiffness: 120, damping: 20 })
  const rotateY = useSpring(ry, { stiffness: 120, damping: 20 })

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || wide || event.pointerType !== "mouse") return
    const rect = event.currentTarget.getBoundingClientRect()
    ry.set(((event.clientX - rect.left) / rect.width - 0.5) * 3)
    rx.set(-((event.clientY - rect.top) / rect.height - 0.5) * 3)
  }

  return (
    <motion.div
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className={cn(
        "relative w-full min-w-0 rounded-[28px] border p-6 sm:px-9 sm:py-8",
        "border-white/70 bg-white/72 shadow-[0_40px_90px_-35px_rgba(6,55,40,0.45),0_2px_6px_rgba(16,24,40,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl",
        "dark:border-white/10 dark:bg-[#0a1c17]/70 dark:shadow-[0_40px_90px_-35px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)]",
        wide ? "max-w-4xl" : "max-w-[440px]",
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,rgba(255,255,255,0.55)_0%,transparent_38%)] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,transparent_38%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-[#12b76a]/60 to-transparent"
      />
      <div className="relative">{children}</div>
    </motion.div>
  )
}
