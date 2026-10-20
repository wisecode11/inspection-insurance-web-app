"use client"

import { useEffect, useState } from "react"
import {
  ActivityIcon,
  CalendarIcon,
  CameraIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardCheckIcon,
  Clock3Icon,
  FileCheck2Icon,
  HouseIcon,
  PauseIcon,
  PlayIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

export const DASHBOARD_RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
] as const

export type DashboardRange = (typeof DASHBOARD_RANGES)[number]["value"]

/** Date-range picker shown beside the "Key metrics" heading. */
export function DashboardRangeSelect({
  value,
  onChange,
}: {
  value: DashboardRange
  onChange: (range: DashboardRange) => void
}) {
  return (
    <label className="relative inline-flex">
      <span className="sr-only">Dashboard date range</span>
      <CalendarIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as DashboardRange)}
        className="h-10 cursor-pointer appearance-none rounded-xl border border-border bg-card pr-9 pl-10 text-sm font-semibold text-foreground transition-colors hover:border-[#1FB86A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1FB86A]"
      >
        {DASHBOARD_RANGES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
    </label>
  )
}

const EVIDENCE_STAGES = [
  { title: "Roof slopes inspected", description: "Guided inspection coverage", Icon: HouseIcon },
  { title: "Hail evidence measured", description: "Test-square damage recorded", Icon: ClipboardCheckIcon },
  { title: "Photos verified", description: "GPS and timestamp attached", Icon: CameraIcon },
  { title: "Storm date confirmed", description: "Date-of-loss evidence checked", Icon: CalendarIcon },
]

const RING_R = 26
const RING_C = 2 * Math.PI * RING_R

function ClaimReadinessCard({ reduceMotion }: { reduceMotion: boolean }) {
  const [completed, setCompleted] = useState(reduceMotion ? 4 : 0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (reduceMotion) {
      setCompleted(4)
      return
    }

    if (paused) return

    const timer = window.setInterval(() => {
      setCompleted((current) => (current >= 4 ? 0 : current + 1))
    }, 1450)

    return () => window.clearInterval(timer)
  }, [paused, reduceMotion])

  const progress = completed * 25
  const ready = completed === 4
  const activeStage = completed < 4 ? completed : -1

  return (
    <section
      aria-label="Example claim evidence workflow"
      className="min-w-0 rounded-3xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(14,27,22,0.04),0_12px_32px_-16px_rgba(14,27,22,0.12)] sm:p-6 dark:shadow-[0_1px_2px_rgba(0,0,0,0.35),0_12px_32px_-16px_rgba(0,0,0,0.45)]"
    >
      {/* Header: progress ring + job */}
      <div className="flex items-center gap-4 border-b border-dashed border-border pb-[18px]">
        <div className="relative size-16 shrink-0">
          <svg viewBox="0 0 64 64" className="size-16 -rotate-90" aria-hidden="true">
            <circle cx="32" cy="32" r={RING_R} fill="none" className="stroke-[#EAF0EC] dark:stroke-border" strokeWidth="6" />
            <motion.circle
              cx="32"
              cy="32"
              r={RING_R}
              fill="none"
              stroke="#1FB86A"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={RING_C}
              initial={false}
              animate={{ strokeDashoffset: RING_C * (1 - progress / 100) }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: "easeOut" }}
            />
          </svg>
          <b className="absolute inset-0 grid place-items-center text-[15px] font-bold tracking-[-0.3px] tabular-nums text-foreground">
            {progress}%
          </b>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold tracking-[0.11em] text-[#1FB86A] uppercase">Claim readiness</p>
          <h2 className="mt-0.5 truncate text-lg font-bold tracking-[-0.3px] text-foreground">
            Sample job · RC-1042
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {ready ? "All required evidence collected" : `${completed} of 4 evidence checks completed`}
          </p>
        </div>

        {!reduceMotion && (
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? "Resume workflow animation" : "Pause workflow animation"}
            aria-pressed={paused}
            className="grid size-8 shrink-0 place-items-center self-start rounded-[10px] border border-border text-muted-foreground transition-colors hover:bg-primary/10 hover:text-[#1FB86A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1FB86A]"
          >
            {paused ? <PlayIcon className="size-3.5" /> : <PauseIcon className="size-3.5" />}
          </button>
        )}
      </div>

      {/* Evidence checklist */}
      <ul className="mt-2.5">
        {EVIDENCE_STAGES.map((stage, index) => {
          const isDone = index < completed
          const isActive = index === activeStage
          const Icon = stage.Icon

          return (
            <li
              key={stage.title}
              className={cn(
                "flex min-w-0 items-center gap-3.5 rounded-[14px] px-2.5 py-[11px] transition-colors duration-200",
                isActive && "bg-primary/8 dark:bg-primary/15",
              )}
            >
              <motion.span
                initial={false}
                animate={{ scale: isDone && !reduceMotion ? [1, 1.08, 1] : 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.25 }}
                className={cn(
                  "grid size-[34px] shrink-0 place-items-center rounded-[11px] transition-colors duration-200",
                  isDone
                    ? "bg-[#1FB86A] text-white"
                    : isActive
                      ? "border-[1.5px] border-[#1FB86A] bg-card text-[#1FB86A]"
                      : "border-[1.5px] border-dashed border-border bg-muted text-muted-foreground",
                )}
              >
                {isDone ? <CheckIcon className="size-[18px]" strokeWidth={2.2} /> : <Icon className="size-[18px]" strokeWidth={1.8} />}
              </motion.span>

              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-semibold text-foreground">{stage.title}</h4>
                <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">{stage.description}</p>
              </div>

              {isDone ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#E3F6EC] px-2.5 py-[5px] text-xs font-semibold text-[#155A45] dark:bg-[#1FB86A]/18 dark:text-[#9BEBC0]">
                  <CheckIcon className="size-[13px]" strokeWidth={2.4} />
                  Done
                </span>
              ) : isActive ? (
                <span className="inline-flex shrink-0 items-center gap-[5px] rounded-full border border-[#BFEBD2] bg-card px-2.5 py-[5px] text-xs font-semibold text-[#1FB86A] dark:border-[#1FB86A]/40">
                  <motion.i
                    animate={reduceMotion ? {} : { opacity: [1, 0.35, 1] }}
                    transition={reduceMotion ? {} : { duration: 1.5, repeat: Infinity }}
                    className="size-1.5 rounded-full bg-[#1FB86A] shadow-[0_0_0_3px_rgba(31,184,106,0.2)]"
                  />
                  In progress
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-[5px] text-xs font-semibold text-muted-foreground">
                  Pending
                </span>
              )}
            </li>
          )
        })}
      </ul>

      {/* Report status */}
      <div
        className={cn(
          "mt-2.5 flex items-center gap-3 rounded-[14px] border px-3.5 py-[13px] transition-colors duration-300",
          ready
            ? "border-[#C6EBD2] bg-[#EAF8EF] dark:border-[#1FB86A]/35 dark:bg-[#1FB86A]/12"
            : "border-border bg-[repeating-linear-gradient(-45deg,var(--background),var(--background)_8px,var(--muted)_8px,var(--muted)_16px)]",
        )}
      >
        <span
          className={cn(
            "grid size-[34px] shrink-0 place-items-center rounded-[11px] border bg-card",
            ready ? "border-[#BFEBD2] text-[#1FB86A] dark:border-[#1FB86A]/40" : "border-border text-muted-foreground",
          )}
        >
          {ready ? <CheckIcon className="size-[18px]" strokeWidth={2.2} /> : <Clock3Icon className="size-[18px]" />}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-[13.5px] font-semibold text-foreground">
            {ready ? "Claim-ready report" : "Report awaiting evidence"}
          </h4>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            {ready ? "All four evidence checks are complete." : "Complete all four checks to prepare the report."}
          </p>
        </div>
        {ready && (
          <span className="shrink-0 rounded-full border border-[#BFEBD2] bg-card px-2.5 py-1 text-xs font-semibold text-[#155A45] dark:border-[#1FB86A]/40 dark:text-[#9BEBC0]">
            Ready
          </span>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {ready
          ? "All four sample evidence stages are complete."
          : `${completed} of 4 sample evidence stages complete.`}
      </p>
    </section>
  )
}

/** Decorative storm-radar rings with a slow sweep, behind the welcome copy. */
function StormRadar({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <svg
      viewBox="0 0 520 520"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 -right-[110px] hidden size-[520px] -translate-y-1/2 sm:block"
    >
      <defs>
        <radialGradient id="rc-radar-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#3DD388" stopOpacity=".18" />
          <stop offset="1" stopColor="#3DD388" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rc-radar-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3DD388" stopOpacity="0" />
          <stop offset="1" stopColor="#3DD388" stopOpacity=".28" />
        </linearGradient>
      </defs>
      <circle cx="260" cy="260" r="258" fill="url(#rc-radar-glow)" />
      <g fill="none" stroke="#7CF0B2" strokeOpacity=".14">
        <circle cx="260" cy="260" r="70" />
        <circle cx="260" cy="260" r="130" />
        <circle cx="260" cy="260" r="190" />
        <circle cx="260" cy="260" r="250" />
        <path d="M260 10v500M10 260h500" strokeDasharray="3 6" />
      </g>
      <motion.path
        d="M260 260 L260 10 A250 250 0 0 1 437 83 Z"
        fill="url(#rc-radar-sweep)"
        style={{ transformOrigin: "260px 260px" }}
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={reduceMotion ? undefined : { duration: 9, ease: "linear", repeat: Infinity }}
      />
      <g fill="#9BEBC0">
        <circle cx="352" cy="118" r="5" />
        <circle cx="196" cy="168" r="3.5" opacity=".7" />
        <circle cx="330" cy="330" r="4" opacity=".8" />
        <circle cx="150" cy="300" r="3" opacity=".5" />
      </g>
      <motion.circle
        cx="352"
        cy="118"
        r="13"
        fill="none"
        stroke="#9BEBC0"
        strokeOpacity=".5"
        style={{ transformOrigin: "352px 118px" }}
        animate={reduceMotion ? undefined : { scale: [1, 1.6, 1], opacity: [0.9, 0, 0.9] }}
        transition={reduceMotion ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeOut" }}
      />
    </svg>
  )
}

export function WelcomeBanner({
  greetingName,
  companyName,
  activeJobs,
  reportsSubmitted,
}: {
  greetingName: string
  companyName: string
  activeJobs: number
  reportsSubmitted: number
}) {
  const reduceMotion = useReducedMotion() ?? false
  const enter = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay, ease: [0.2, 0.8, 0.2, 1] as const },
        }

  return (
    <section
      aria-labelledby="dashboard-hero-title"
      className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_470px]"
    >
      {/* Welcome panel */}
      <motion.div
        {...enter(0)}
        className="relative isolate flex min-w-0 flex-col justify-center overflow-hidden rounded-3xl px-6 py-8 text-white shadow-[0_20px_40px_-18px_rgba(6,36,27,0.45)] sm:px-11 sm:py-10"
        style={{ background: "linear-gradient(135deg, #0E4434 0%, #0A3326 55%, #06241B 100%)" }}
      >
        <StormRadar reduceMotion={reduceMotion} />

        <div className="relative">
          <motion.span
            {...enter(0.05)}
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-[rgba(61,211,136,0.3)] bg-[rgba(61,211,136,0.14)] px-3 py-[7px] text-[11.5px] font-bold tracking-[0.1em] text-[#9BEBC0] uppercase"
          >
            <ShieldCheckIcon className="size-3.5 shrink-0" />
            <span className="truncate">{companyName} · Workspace</span>
          </motion.span>

          <motion.h1
            {...enter(0.1)}
            id="dashboard-hero-title"
            className="mt-[22px] text-[clamp(34px,4vw,52px)] leading-[1.05] font-bold tracking-[-0.03em] text-white"
          >
            Welcome back,
            <br />
            <em className="bg-linear-to-r from-[#7CF0B2] to-[#3DD388] bg-clip-text not-italic text-transparent">
              {greetingName}.
            </em>
          </motion.h1>

          <motion.p
            {...enter(0.15)}
            className="mt-4 max-w-[560px] text-[15px] leading-[1.6] text-[#B9D3C7] sm:text-[16.5px]"
          >
            Track roof inspections, measured hail evidence, GPS-stamped photos, and verified storm
            dates—all the essentials for a complete, claim-ready report.
          </motion.p>

          <motion.div {...enter(0.2)} className="mt-7 flex flex-wrap gap-3">
            {(
              [
                { label: "Active jobs", value: activeJobs, Icon: ActivityIcon, bg: "rgba(61,211,136,0.18)", fg: "#7CF0B2" },
                { label: "Reports submitted", value: reportsSubmitted, Icon: FileCheck2Icon, bg: "rgba(96,165,250,0.18)", fg: "#93C5FD" },
              ] as const
            ).map(({ label, value, Icon, bg, fg }) => (
              <div
                key={label}
                className="flex items-center gap-3.5 rounded-2xl border border-white/12 bg-white/7 py-3 pr-[18px] pl-3.5 backdrop-blur-md"
              >
                <span className="grid size-9 place-items-center rounded-[10px]" style={{ background: bg, color: fg }}>
                  <Icon className="size-[18px]" />
                </span>
                <span>
                  <small className="block text-[12.5px] text-[#9FBFB1]">{label}</small>
                  <b className="mt-px block text-[22px] leading-tight font-bold tracking-[-0.02em] tabular-nums">
                    {value.toLocaleString("en-US")}
                  </b>
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Claim readiness */}
      <motion.div {...enter(0.08)} className="min-w-0">
        <ClaimReadinessCard reduceMotion={reduceMotion} />
      </motion.div>
    </section>
  )
}
