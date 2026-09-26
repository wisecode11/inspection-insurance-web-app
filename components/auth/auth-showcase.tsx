"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { LockKeyholeIcon, ShieldCheckIcon, SmartphoneIcon } from "lucide-react"

import { BrandMark } from "@/components/brand-mark"
import { cn } from "@/lib/utils"

const PANEL_IMG = "/marketing/roof-inspect.png"

const trustChips = [
  { icon: LockKeyholeIcon, label: "Encrypted sign-in" },
  { icon: ShieldCheckIcon, label: "Company-scoped access" },
  { icon: SmartphoneIcon, label: "Field app synced" },
]

const glass =
  "border border-white/18 bg-white/10 text-white shadow-[0_20px_48px_-24px_rgba(0,0,0,0.55)] backdrop-blur-xl"

function Floating({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={cn("absolute", className)}
      initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
      animate={
        reduceMotion
          ? undefined
          : {
              opacity: 1,
              y: [0, -6, 0],
              scale: 1,
              transition: {
                opacity: { delay, duration: 0.55 },
                scale: { delay, duration: 0.55 },
                y: { delay: delay + 0.35, duration: 6.5, repeat: Infinity, ease: "easeInOut" },
              },
            }
      }
    >
      {children}
    </motion.div>
  )
}

/**
 * Left panel for auth pages: product phone visual tuned for sign-in,
 * with soft brand glow and workspace trust chips.
 */
export function AuthShowcase({ roleLabel }: { roleLabel: string }) {
  return (
    <div className="relative hidden p-4 lg:block xl:p-5">
      <div className="relative h-full min-h-[40rem] overflow-hidden rounded-[2rem] bg-[#052e22] ring-1 ring-black/10">
        <Image
          src={PANEL_IMG}
          alt="RoofClaim inspector app — secure company workspace on mobile"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />

        {/* Depth vignette so copy stays readable */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,22,16,0.55)_0%,rgba(5,46,34,0.12)_38%,rgba(5,46,34,0.2)_62%,rgba(2,18,14,0.88)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_100%_100%,rgba(15,143,90,0.42),transparent_58%),radial-gradient(ellipse_50%_40%_at_0%_70%,rgba(10,75,55,0.28),transparent_55%)]"
        />

        <div className="absolute top-6 left-6 z-10 rounded-full border border-white/20 bg-white/10 py-1 pr-4 pl-1.5 shadow-[0_12px_30px_-16px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <BrandMark href="/" onDark className="[&_.text-lg]:text-base" />
        </div>

        <Floating className="top-24 right-6 z-10 hidden xl:block" delay={0.15}>
          <div className={cn("rounded-2xl px-3.5 py-3", glass)}>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-emerald-200/90 uppercase">
              Live workspace
            </p>
            <p className="mt-1 text-sm font-semibold tracking-tight">Crew status synced</p>
            <p className="mt-0.5 text-[11px] text-white/60">14 jobs · 6 in progress</p>
          </div>
        </Floating>

        <Floating className="top-[42%] left-6 z-10" delay={0.35}>
          <div className={cn("flex max-w-[13.5rem] items-start gap-2.5 rounded-2xl p-3.5", glass)}>
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/20">
              <ShieldCheckIcon className="size-4 text-emerald-300" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">Secure portal</p>
              <p className="mt-0.5 text-[11px] leading-snug text-white/65">
                Role-based access for company admins &amp; field crews
              </p>
            </div>
          </div>
        </Floating>

        <div className="absolute inset-x-0 bottom-0 z-10 p-8 xl:p-10">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-200/90 uppercase">
            {roleLabel}
          </p>
          <p className="mt-3 max-w-md font-serif text-3xl leading-tight font-semibold tracking-tight text-white xl:text-[2.15rem]">
            Sign in. Pick up every claim where your crew left off.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {trustChips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/90 backdrop-blur-md"
              >
                <chip.icon className="size-3.5 text-emerald-300" />
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
