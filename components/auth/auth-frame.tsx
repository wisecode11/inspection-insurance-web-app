"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

import { AuthShell } from "@/components/auth/auth-shell"
import { roleMeta } from "@/lib/navigation"
import type { Role } from "@/types/role"

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
}

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
}

/**
 * Auth/onboarding page frame (super admin, invites, onboarding steps).
 * Same split + network visual as login/signup, without the side swap.
 */
export function AuthFrame({
  title,
  description,
  role,
  children,
  footer,
  wide,
  eyebrow,
  tagline = "Every claim, secured from roof to payout.",
}: {
  title: string
  description: string
  role: Role
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
  eyebrow?: string
  /** Headline shown on the visual panel. */
  tagline?: string
}) {
  return (
    <AuthShell
      wide={wide}
      copy={{
        eyebrow: roleMeta[role].label,
        tagline,
        sub: "Inspections, photo evidence and adjuster reports flow through one live network for your whole crew.",
      }}
    >
      <motion.div variants={stagger} initial="hidden" animate="show">
        {eyebrow && (
          <motion.p
            variants={rise}
            className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#12b76a]/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-[#0a4b37] uppercase dark:text-[#6ae8b0]"
          >
            <span className="size-1.5 rounded-full bg-current" />
            {eyebrow}
          </motion.p>
        )}
        <motion.h1 variants={rise} className="text-[1.7rem] leading-tight font-semibold tracking-[-0.02em] sm:text-[1.9rem]">
          {title}
        </motion.h1>
        <motion.p variants={rise} className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </motion.p>
        <motion.div variants={rise} className="mt-8">
          {children}
        </motion.div>
        {footer && <motion.div variants={rise}>{footer}</motion.div>}
      </motion.div>
    </AuthShell>
  )
}
