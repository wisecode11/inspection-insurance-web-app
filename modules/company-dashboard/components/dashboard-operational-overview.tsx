import { Card, CardContent } from "@/components/ui/card"
import type { CompanyDashboardOverview } from "@/modules/company-dashboard/types/dashboard.types"
import { cn } from "@/lib/utils"

function Sparkline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 24" fill="none" aria-hidden className={cn("h-5 w-14", className)}>
      <path
        d="M1 16 C12 14, 16 6, 24 9 S36 20, 44 12 S54 4, 63 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function StatCell({
  label,
  value,
  helper,
}: {
  label: string
  value: number
  helper?: string
}) {
  const isZero = value === 0

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-[#f7f5f0] p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <Sparkline className="text-primary/50" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span
          className={
            isZero
              ? "text-2xl font-bold tracking-tight tabular-nums text-muted-foreground/80"
              : "text-2xl font-bold tracking-tight tabular-nums text-primary-dark"
          }
        >
          {value}
        </span>
        {helper ? (
          <span className="text-xs leading-relaxed text-muted-foreground">{helper}</span>
        ) : isZero ? (
          <span className="text-xs leading-relaxed text-muted-foreground">None active right now</span>
        ) : null}
      </div>
    </div>
  )
}

export function DashboardOperationalOverview({
  overview,
}: {
  overview: CompanyDashboardOverview
}) {
  return (
    <Card className="h-full gap-0 rounded-lg border-0 bg-card py-0 shadow-[0_16px_40px_-20px_rgba(26,46,40,0.28)] ring-1 ring-black/5">
      <div className="border-b border-border/50 px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">At a glance</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Active team and report approvals</p>
      </div>
      <CardContent className="flex flex-col gap-3 px-4 py-4 sm:px-5 sm:py-5">
        <StatCell
          label="Active inspectors"
          value={overview.activeInspectors}
          helper={
            overview.totalInspectors > 0
              ? `${Math.round((overview.activeInspectors / overview.totalInspectors) * 100)}% of team`
              : undefined
          }
        />
        <StatCell
          label="Reports approved"
          value={overview.reportsApproved}
          helper={
            overview.reportsSubmitted > 0
              ? `${Math.round((overview.reportsApproved / overview.reportsSubmitted) * 100)}% approval rate`
              : undefined
          }
        />
      </CardContent>
    </Card>
  )
}
