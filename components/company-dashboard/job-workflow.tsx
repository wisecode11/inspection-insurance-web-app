"use client"

import * as React from "react"
import { CheckCircle2Icon, CloudHailIcon, PauseIcon, PlayIcon } from "lucide-react"
import { useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"
import styles from "./job-workflow.module.css"

/* =========================================================
   Timeline model — one job, roof to claim-ready report.
   Each step is a list of [ms, action]; actions are pure
   state transforms, so any step can be rebuilt instantly.
   ========================================================= */

type Slope = "N" | "E" | "S" | "W"

type FlowState = {
  caption: string
  slopes: Record<Slope, "idle" | "active" | "done">
  square: boolean
  tag: boolean
  tagFinal: boolean
  hits: number
  pins: number
  shift: boolean
  dim: boolean
  weather: boolean
  weatherStatus: "idle" | "checking" | "ok"
  report: boolean
  rows: number
  share: boolean
  sent: boolean
}

type Action = (s: FlowState) => FlowState
type Step = { dur: number; actions: [number, Action][] }

const INITIAL: FlowState = {
  caption: "Guided inspection",
  slopes: { N: "idle", E: "idle", S: "idle", W: "idle" },
  square: false,
  tag: false,
  tagFinal: false,
  hits: 0,
  pins: 0,
  shift: false,
  dim: false,
  weather: false,
  weatherStatus: "idle",
  report: false,
  rows: 0,
  share: false,
  sent: false,
}

const SLOPE_ORDER: [Slope, string][] = [
  ["S", "Front"],
  ["E", "Right"],
  ["N", "Rear"],
  ["W", "Left"],
]
const HIT_POINTS = [
  [136, 166], [152, 163], [164, 172], [140, 180],
  [155, 178], [166, 189], [137, 191], [151, 192],
] as const
const PIN_POINTS = [
  [140, 62], [322, 84], [218, 180], [80, 178],
] as const
const REPORT_ROWS = 4

const setSlope = (k: Slope, v: FlowState["slopes"][Slope]): Action => (s) => ({
  ...s,
  slopes: { ...s.slopes, [k]: v },
})
const patch = (p: Partial<FlowState>): Action => (s) => ({ ...s, ...p })

const inspect: [number, Action][] = SLOPE_ORDER.flatMap(([k, name], i) => [
  [i * 800, (s) => ({ ...setSlope(k, "active")(s), caption: `Guided inspection · ${name} slope (${i + 1} of 4)` })] as [number, Action],
  [i * 800 + 650, setSlope(k, "done")] as [number, Action],
])
inspect.push([3300, patch({ caption: "All 4 slopes inspected — no elevation missed" })])

const measure: [number, Action][] = [
  [0, patch({ square: true, caption: "Hail test square · 10 × 10 ft on the front slope" })],
  [650, patch({ tag: true })],
  ...HIT_POINTS.map((_, i) => [800 + i * 210, patch({ hits: i + 1 })] as [number, Action]),
  [2700, patch({ tagFinal: true, caption: "Hit density calculated automatically" })],
]

const verify: [number, Action][] = [
  [0, patch({ caption: "Evidence · GPS + time-stamped photos on every slope" })],
  ...PIN_POINTS.map((_, i) => [150 + i * 260, patch({ pins: i + 1 })] as [number, Action]),
  [1400, patch({ shift: true, weather: true, caption: "Weather verification · checking the storm date" })],
  [1750, patch({ weatherStatus: "checking" })],
  [3150, patch({ weatherStatus: "ok", caption: "Storm date verified for this address" })],
]

const report: [number, Action][] = [
  [0, patch({ weather: false, dim: true, report: true, caption: "Auto report · building the branded assessment PDF" })],
  ...Array.from({ length: REPORT_ROWS }, (_, i) => [550 + i * 380, patch({ rows: i + 1 })] as [number, Action]),
  [2500, patch({ share: true, caption: "Report ready · share by link, email or WhatsApp" })],
  [3700, patch({ sent: true, caption: "Shared — claim-ready evidence, in one report" })],
]

const STEPS: Step[] = [
  { dur: 4300, actions: inspect },
  { dur: 4300, actions: measure },
  { dur: 4500, actions: verify },
  { dur: 5800, actions: report },
]

function buildState(step: number, complete: boolean) {
  let s = INITIAL
  for (let i = 0; i < step; i++) for (const [, fn] of STEPS[i].actions) s = fn(s)
  if (complete) for (const [, fn] of STEPS[step].actions) s = fn(s)
  return s
}

const hitLabel = (n: number) => `${n} hit${n === 1 ? "" : "s"} / 100 sq ft`
const on = (v: boolean) => (v ? "" : undefined)

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "RC"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

/* =========================================================
   Component — renders the stage and the step rail as two
   siblings so the parent grid can place them separately.
   ========================================================= */

export function JobWorkflow({
  companyName,
  activeJobs,
  reportsSubmitted,
  stageClassName,
  railClassName,
}: {
  companyName: string
  activeJobs: number
  reportsSubmitted: number
  stageClassName?: string
  railClassName?: string
}) {
  const reduceMotion = useReducedMotion()
  const [flow, setFlow] = React.useState<FlowState>(INITIAL)
  const [step, setStep] = React.useState(0)
  const [instant, setInstant] = React.useState(false)
  const [fading, setFading] = React.useState(false)
  const [playing, setPlayingState] = React.useState(false)
  const [cap, setCap] = React.useState({ text: INITIAL.caption, swap: false })

  const stageRef = React.useRef<HTMLDivElement>(null)
  const progRefs = React.useRef<(HTMLElement | null)[]>([])
  const clock = React.useRef({ step: 0, t: 0, fired: 0, playing: false, fading: false })
  const syncRef = React.useRef<() => void>(() => {})

  const paintRail = React.useCallback(() => {
    const c = clock.current
    progRefs.current.forEach((el, i) => {
      if (!el) return
      const v = i < c.step ? 1 : i === c.step ? Math.min(c.t / STEPS[i].dur, 1) : 0
      el.style.transform = `scaleX(${v})`
    })
  }, [])

  const goTo = React.useCallback(
    (k: number, complete = false) => {
      const c = clock.current
      c.step = k
      c.fired = complete ? STEPS[k].actions.length : 0
      c.t = complete ? STEPS[k].dur : 0
      setInstant(true)
      setFlow(buildState(k, complete))
      setStep(k)
      paintRail()
    },
    [paintRail],
  )

  // Commit the jumped-to state with transitions off, then re-enable them.
  React.useLayoutEffect(() => {
    if (!instant) return
    void stageRef.current?.offsetWidth
    setInstant(false)
  }, [instant])

  // Caption cross-fade.
  const capRef = React.useRef(INITIAL.caption)
  const capTimer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => {
    const next = flow.caption
    if (next === capRef.current) return
    capRef.current = next
    window.clearTimeout(capTimer.current)
    if (instant) {
      setCap({ text: next, swap: false })
      return
    }
    setCap((c) => ({ ...c, swap: true }))
    capTimer.current = window.setTimeout(() => setCap({ text: next, swap: false }), 180)
  }, [flow.caption, instant])
  React.useEffect(() => () => window.clearTimeout(capTimer.current), [])

  const setPlaying = React.useCallback(
    (v: boolean) => {
      const c = clock.current
      c.playing = v
      setPlayingState(v)
      if (v && c.t >= STEPS[c.step].dur) goTo(c.step === STEPS.length - 1 ? 0 : c.step + 1)
      syncRef.current()
    },
    [goTo],
  )

  // Clock: runs only while playing, on-screen and the tab is visible.
  React.useEffect(() => {
    if (reduceMotion === null) return
    const c = clock.current
    let raf = 0
    let last = 0
    let visible = true
    let fadeTimer: number | undefined

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64)
      last = now
      if (!c.fading) {
        c.t += dt
        const acts = STEPS[c.step].actions
        const due: Action[] = []
        while (c.fired < acts.length && acts[c.fired][0] <= c.t) due.push(acts[c.fired++][1])
        if (due.length) setFlow((s) => due.reduce((acc, fn) => fn(acc), s))
        paintRail()
        if (c.t >= STEPS[c.step].dur) {
          if (c.step < STEPS.length - 1) goTo(c.step + 1)
          else {
            // Soft loop back to step 1.
            c.fading = true
            setFading(true)
            fadeTimer = window.setTimeout(() => {
              goTo(0)
              setFading(false)
              c.fading = false
            }, 450)
          }
        }
      }
      raf = requestAnimationFrame(tick)
    }

    const sync = () => {
      const run = c.playing && visible && !document.hidden
      if (run && !raf) {
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
      if (!run && raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }
    syncRef.current = sync

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    if (stageRef.current) io.observe(stageRef.current)
    document.addEventListener("visibilitychange", sync)

    if (reduceMotion) {
      goTo(STEPS.length - 1, true)
      setPlaying(false)
    } else {
      goTo(0)
      setPlaying(true)
    }

    return () => {
      cancelAnimationFrame(raf)
      raf = 0
      window.clearTimeout(fadeTimer)
      c.fading = false
      io.disconnect()
      document.removeEventListener("visibilitychange", sync)
      syncRef.current = () => {}
    }
  }, [reduceMotion, goTo, paintRail, setPlaying])

  const rail = [
    { title: "Inspect", hint: "Slope-by-slope prompts, nothing missed", stat: `${activeJobs} active`, statTitle: "Active jobs" },
    { title: "Measure", hint: "Hail hits per 10×10 ft test square" },
    { title: "Verify", hint: "Stamped photos + storm-date check" },
    { title: "Report", hint: "Branded PDF, shared in one tap", stat: `${reportsSubmitted} sent`, statTitle: "Reports submitted" },
  ]

  return (
    <>
      <div className={stageClassName}>
        <div
          ref={stageRef}
          className={styles.stage}
          data-shift={on(flow.shift)}
          data-dim={on(flow.dim)}
          data-instant={on(instant)}
          data-fading={on(fading)}
        >
          <div className={styles.bar}>
            <span className={styles.tag}>How a job works</span>
            <span className={styles.cap} data-swap={on(cap.swap)} aria-hidden>
              {cap.text}
            </span>
            <button
              type="button"
              className={styles.play}
              aria-label={playing ? "Pause walkthrough" : "Play walkthrough"}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? (
                <PauseIcon className="size-3" fill="currentColor" />
              ) : (
                <PlayIcon className="size-3" fill="currentColor" />
              )}
            </button>
          </div>

          <div
            className={styles.art}
            role="img"
            aria-label="Walkthrough of one job: the inspector checks each of four roof slopes, marks hail hits in a 10 by 10 foot test square, takes GPS and time-stamped photos, the storm date is verified, and a branded assessment report is generated and shared."
          >
            <svg className={styles.svg} viewBox="0 0 400 250" preserveAspectRatio="xMidYMid meet" aria-hidden>
              <defs>
                <pattern id="rc-shingles" width="12" height="7" patternUnits="userSpaceOnUse">
                  <path d="M0 6.5h12" className={styles.shingles} />
                </pattern>
              </defs>
              <g className={styles.roof}>
                {/* four slopes of a hip roof, top-down */}
                <polygon className={styles.slope} data-state={flow.slopes.N} points="60,35 340,35 250,125 150,125" />
                <polygon className={styles.slope} data-state={flow.slopes.E} points="340,35 340,215 250,125" />
                <polygon className={styles.slope} data-state={flow.slopes.S} points="340,215 60,215 150,125 250,125" />
                <polygon className={styles.slope} data-state={flow.slopes.W} points="60,215 60,35 150,125" />
                <rect x="60" y="35" width="280" height="180" fill="url(#rc-shingles)" pointerEvents="none" />
                <rect className={styles.eave} x="60" y="35" width="280" height="180" rx="1" />
                <path className={styles.ridge} d="M60 35 150 125 250 125 340 35M60 215 150 125M250 125 340 215" />

                <text className={styles.slopeLabel} x="200" y="84">REAR</text>
                <text className={styles.slopeLabel} x="312" y="142">RIGHT</text>
                <text className={styles.slopeLabel} x="262" y="200">FRONT</text>
                <text className={styles.slopeLabel} x="88" y="142">LEFT</text>
                {(
                  [
                    ["N", 200, 66],
                    ["E", 312, 124],
                    ["S", 262, 182],
                    ["W", 88, 124],
                  ] as const
                ).map(([k, x, y]) => (
                  <g key={k} transform={`translate(${x},${y})`}>
                    <g className={styles.check} data-on={on(flow.slopes[k] === "done")}>
                      <circle r="7" />
                      <path d="m-3 0 2 2 4-4" />
                    </g>
                  </g>
                ))}

                {/* 10 x 10 ft hail test square on the front slope */}
                <rect className={styles.square} data-on={on(flow.square)} x="128" y="158" width="44" height="44" />
                <text className={styles.squareLabel} data-on={on(flow.square)} x="131" y="199">10×10 FT</text>
                {HIT_POINTS.map(([cx, cy], i) => (
                  <circle key={i} className={styles.hit} data-on={on(i < flow.hits)} cx={cx} cy={cy} r="2.6" />
                ))}
                <g transform="translate(150,145)">
                  <g className={styles.hitsTag} data-on={on(flow.tag)} data-final={on(flow.tagFinal)}>
                    <rect x="-46" y="-9" width="92" height="15" rx="7.5" />
                    <text y="1.6">{hitLabel(flow.hits)}</text>
                  </g>
                </g>

                {/* GPS + time-stamped photo pins */}
                {PIN_POINTS.map(([x, y], i) => (
                  <g key={i} transform={`translate(${x},${y})`}>
                    <g className={styles.pin} data-on={on(i < flow.pins)}>
                      <circle className={styles.pinFlash} cy="-12" r="8" />
                      <path className={styles.pinBody} d="M0 0-4-5.5A8 8 0 1 1 4-5.5Z" />
                      <rect className={styles.pinIcon} x="-4.5" y="-15" width="9" height="6.5" rx="1.5" />
                      <circle className={styles.pinIcon} cy="-11.8" r="1.7" />
                    </g>
                  </g>
                ))}
              </g>
            </svg>

            {/* weather verification */}
            <div
              className={cn(styles.overlay, styles.weather)}
              data-on={on(flow.weather)}
              data-status={flow.weatherStatus}
              aria-hidden
            >
              <div className={styles.weatherTop}>
                <span className={styles.weatherIcon}>
                  <CloudHailIcon className="size-4" />
                </span>
                <div>
                  <b>Storm date check</b>
                  <small>Centralized weather data</small>
                </div>
              </div>
              <div className={styles.weatherRow}>
                <span>Property address</span>
                <span />
              </div>
              <div className={styles.weatherRow}>
                <span>Date of loss</span>
                <span />
              </div>
              <div className={styles.weatherBar}>
                <i />
              </div>
            </div>

            {/* auto-generated branded report */}
            <div
              className={cn(styles.overlay, styles.report)}
              data-on={on(flow.report)}
              data-share={on(flow.share)}
              data-sent={on(flow.sent)}
              aria-hidden
            >
              <div className={styles.reportHead}>
                <span className={styles.reportLogo}>{initials(companyName)}</span>
                <div className="min-w-0">
                  <b>{companyName}</b>
                  <small>Roof Assessment Report</small>
                </div>
              </div>
              <div className={styles.reportBody}>
                <svg className={styles.reportThumb} viewBox="40 20 320 210">
                  <polygon points="60,35 340,35 250,125 150,125" fill="#cdebd9" stroke="#0f5d44" strokeWidth="4" />
                  <polygon points="340,35 340,215 250,125" fill="#b7e2c8" stroke="#0f5d44" strokeWidth="4" />
                  <polygon points="340,215 60,215 150,125 250,125" fill="#cdebd9" stroke="#0f5d44" strokeWidth="4" />
                  <polygon points="60,215 60,35 150,125" fill="#b7e2c8" stroke="#0f5d44" strokeWidth="4" />
                  <rect x="128" y="158" width="44" height="44" fill="#fde7c0" stroke="#d97706" strokeWidth="5" />
                </svg>
                <ul className={styles.reportRows}>
                  {[
                    ["Slopes inspected", "4 / 4"],
                    ["Test square", `${HIT_POINTS.length} hits`],
                    ["Photos", "GPS + time"],
                    ["Storm date", "Verified"],
                  ].map(([label, value], i) => (
                    <li key={label} data-on={on(i < flow.rows)}>
                      <span>{label}</span>
                      <b>{value}</b>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.reportFoot}>
                <div className={styles.share}>
                  <span>Link</span>
                  <span>Email</span>
                  <span>WhatsApp</span>
                </div>
                <div className={styles.sent}>
                  <CheckCircle2Icon className="size-3.5" />
                  Report shared
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ol
        aria-label="Job workflow steps"
        className={cn("m-0 grid list-none grid-cols-2 gap-2 p-0 md:grid-cols-4 md:gap-2.5", railClassName)}
      >
        {rail.map((item, i) => {
          const current = i === step
          const done = i < step
          return (
            <li key={item.title}>
              <button
                type="button"
                aria-current={current ? "step" : undefined}
                onClick={() => goTo(i, !clock.current.playing)}
                className={cn(
                  "relative grid h-full w-full grid-cols-[auto_1fr] content-start gap-x-2.5 gap-y-px overflow-hidden rounded-[14px] border px-3 pt-2.5 pb-3 text-left transition-[background-color,border-color,box-shadow] duration-200 sm:px-3.5 sm:pt-3 sm:pb-3.5",
                  current
                    ? "border-[#8CE0B0] bg-[#EEFAF3] shadow-[0_6px_18px_-12px_rgba(22,163,74,0.6)]"
                    : "border-[#E6E9E7] bg-white/70 hover:bg-white",
                )}
              >
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-[9px] text-xs font-extrabold transition-colors duration-200 sm:row-span-2 sm:size-7",
                    current
                      ? "bg-[#2FBF6B] text-white"
                      : done
                        ? "bg-[#C6E8D6] text-[#063728]"
                        : "bg-[#E8F5EF] text-[#0F5D44]",
                  )}
                >
                  {i + 1}
                </span>
                <b className="flex flex-wrap items-center gap-2 text-[13.5px] leading-snug font-semibold text-[#101828]">
                  {item.title}
                  {item.stat ? (
                    <span
                      title={item.statTitle}
                      className="rounded-full bg-[#E8F5EF] px-[7px] py-px text-[11px] font-bold tabular-nums text-[#0F5D44]"
                    >
                      {item.stat}
                    </span>
                  ) : null}
                </b>
                <small className="hidden text-xs leading-snug text-[#667085] sm:block">{item.hint}</small>
                <i
                  ref={(el) => {
                    progRefs.current[i] = el
                  }}
                  className={styles.prog}
                />
              </button>
            </li>
          )
        })}
      </ol>
    </>
  )
}
