"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, type Variants } from "framer-motion"

import { AuthShell } from "@/components/auth/auth-shell"
import type { AuthVisualCopy } from "@/components/auth/auth-visual-panel"
import { cn } from "@/lib/utils"
import { LoginForm } from "@/modules/auth/components/login-form"
import { SignupForm } from "@/modules/auth/components/signup-form"

type Mode = "login" | "signup"

const COPY: Record<Mode, AuthVisualCopy> = {
  login: {
    eyebrow: "Company workspace",
    tagline: "Every claim, secured from roof to payout.",
    sub: "Inspections, photo evidence and adjuster reports flow through one live network for your whole crew.",
  },
  signup: {
    eyebrow: "Start in minutes",
    tagline: "Bring your crew's claims online.",
    sub: "Create your admin account, name your organization, then invite inspectors from the field app.",
  },
}

/** Form content slides toward where the card is heading, with blur + scale. */
const formSwap: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: 48 * dir, scale: 0.96, filter: "blur(8px)" }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] },
    transitionEnd: { filter: "none" },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: -48 * dir,
    scale: 0.96,
    filter: "blur(8px)",
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
  }),
}

/**
 * Persistent login ↔ signup experience. Lives in the (auth) route-group
 * layout so it survives navigation between /login and /signup: the visual
 * panel and form card trade sides while the form content cross-fades.
 */
export function AuthExperience() {
  const pathname = usePathname()
  const mode: Mode = pathname?.startsWith("/signup") ? "signup" : "login"
  // Login card sits right, signup card sits left; content enters from the side it travels toward.
  const direction = mode === "signup" ? -1 : 1

  return (
    <AuthShell side={mode === "login" ? "left" : "right"} copy={COPY[mode]} copyKey={mode}>
      <ModeSwitch mode={mode} />
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div key={mode} custom={direction} variants={formSwap} initial="enter" animate="center" exit="exit">
          {mode === "login" ? (
            <React.Suspense fallback={null}>
              <LoginForm />
            </React.Suspense>
          ) : (
            <SignupForm />
          )}
        </motion.div>
      </AnimatePresence>
    </AuthShell>
  )
}

function ModeSwitch({ mode }: { mode: Mode }) {
  const tabs: { id: Mode; label: string; href: string }[] = [
    { id: "login", label: "Sign in", href: "/login" },
    { id: "signup", label: "Create account", href: "/signup" },
  ]
  return (
    <nav
      aria-label="Authentication"
      className="relative mb-6 grid grid-cols-2 rounded-2xl border border-black/[0.05] bg-black/[0.035] p-1 dark:border-white/[0.06] dark:bg-white/[0.05]"
    >
      {tabs.map((tab) => {
        const active = tab.id === mode
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            scroll={false}
            className={cn(
              "relative flex h-10 items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#12b76a]/40 focus-visible:outline-none",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="auth-mode-pill"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="absolute inset-0 rounded-xl bg-white shadow-[0_2px_10px_-2px_rgba(6,55,40,0.18),0_0_0_1px_rgba(6,55,40,0.04)] dark:bg-white/10 dark:shadow-none"
              />
            )}
            <span className="relative">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
