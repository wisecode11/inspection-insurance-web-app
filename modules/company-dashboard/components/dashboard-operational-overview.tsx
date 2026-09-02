import { Card, CardContent } from "@/components/ui/card"
import { SectionHeader } from "@/components/shared/section-header"
import type { CompanyDashboardOverview } from "@/modules/company-dashboard/types/dashboard.types"

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
    <div className="flex flex-col gap-2 rounded-[var(--radius)] bg-card p-4 shadow-[0_2px_16px_color-mix(in_oklab,var(--foreground)_5%,transparent)]">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
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
    <Card className="h-full gap-0 py-0 shadow-none">
      <SectionHeader
        title="At a glance"
        description="Active team and report approvals"
      />
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
