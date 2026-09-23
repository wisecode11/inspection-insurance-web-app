import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/lib/constants/routes"
import type { CompanyDashboardOverview } from "@/modules/company-dashboard/types/dashboard.types"
import type { InspectorAnalyticsRow } from "@/modules/analytics/types/analytics.types"
import { cn } from "@/lib/utils"

const AVATAR_TONES = [
  "bg-[#133a42] text-white",
  "bg-[#7dcea0] text-primary-dark",
  "bg-[#2a6a78] text-white",
] as const

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function ProgressRing({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value))
  const r = 36
  const c = 2 * Math.PI * r
  const offset = c - (clamped / 100) * c

  return (
    <div className="relative flex size-[5.5rem] shrink-0 items-center justify-center">
      <svg viewBox="0 0 88 88" className="size-full -rotate-90" aria-hidden>
        <circle cx="44" cy="44" r={r} fill="none" stroke="#e8eef0" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="#7dcea0"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold tabular-nums text-primary-dark">{clamped}%</span>
      </div>
    </div>
  )
}

export function DashboardOperationalOverview({
  overview,
  inspectors = [],
}: {
  overview: CompanyDashboardOverview
  inspectors?: InspectorAnalyticsRow[]
}) {
  const targetPct =
    overview.totalJobs > 0
      ? Math.min(100, Math.round((overview.completedJobs / Math.max(overview.totalJobs, 1)) * 100))
      : overview.reportsSubmitted > 0
        ? Math.min(
            100,
            Math.round((overview.reportsApproved / overview.reportsSubmitted) * 100),
          )
        : 0

  const top = inspectors.slice(0, 3)

  return (
    <Card className="gap-0 rounded-xl border border-[#e4e9eb] bg-white py-0 shadow-[0_1px_2px_rgba(15,40,46,0.04)]">
      <div className="border-b border-[#eef1f2] px-5 py-4 sm:px-5">
        <h2 className="text-base font-semibold tracking-tight text-primary-dark">At a glance</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Monthly progress and top inspectors</p>
      </div>
      <CardContent className="flex flex-col gap-5 px-5 py-5">
        <div className="flex items-center gap-4">
          <ProgressRing value={targetPct} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary-dark">Monthly target reached</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {overview.completedJobs} of {overview.totalJobs} jobs completed
              {overview.activeInspectors > 0
                ? ` · ${overview.activeInspectors} inspectors active`
                : ""}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Top inspectors
          </p>
          {top.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Inspector rankings appear once jobs are assigned.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {top.map((row, i) => (
                <li key={row.id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      AVATAR_TONES[i % AVATAR_TONES.length],
                    )}
                  >
                    {initials(row.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-primary-dark">{row.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.completed} completed · {row.completionRate}% rate
                    </p>
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                    #{row.rank || i + 1}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full rounded-lg border-[#d7e0e3] bg-[#f7f9fa] text-primary-dark hover:bg-[#eef2f3]"
          nativeButton={false}
          render={<Link href={ROUTES.company.staff} />}
        >
          Manage team roster
        </Button>
      </CardContent>
    </Card>
  )
}
