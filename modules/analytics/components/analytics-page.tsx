"use client"

import {
  CheckCircle2Icon,
  ClipboardListIcon,
  ClockIcon,
  FileCheckIcon,
  FileXIcon,
  TimerIcon,
} from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { KpiCard } from "@/components/shared/kpi-card"
import {
  ClaimDonutChart,
  InspectionVolumeChart,
  MonthlyJobsChart,
} from "@/components/shared/charts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCompanyAnalytics } from "@/modules/analytics/hooks/use-analytics"
import type { InspectorAnalyticsRow } from "@/modules/analytics/types/analytics.types"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"

const inspectorColumns: Column<InspectorAnalyticsRow>[] = [
  {
    key: "rank",
    header: "#",
    className: "w-10",
    cell: (row) => <span className="text-muted-foreground tabular-nums">{row.rank}</span>,
  },
  {
    key: "name",
    header: "Inspector",
    sortable: true,
    accessor: (r) => r.name,
    cell: (r) => <span className="font-medium">{r.name}</span>,
  },
  {
    key: "assigned",
    header: "Assigned",
    sortable: true,
    accessor: (r) => r.assigned,
    align: "right",
    cell: (r) => <span className="tabular-nums">{r.assigned}</span>,
  },
  {
    key: "completed",
    header: "Completed",
    sortable: true,
    accessor: (r) => r.completed,
    align: "right",
    cell: (r) => <span className="tabular-nums">{r.completed}</span>,
  },
  {
    key: "reportsSubmitted",
    header: "Reports submitted",
    sortable: true,
    accessor: (r) => r.reportsSubmitted,
    align: "right",
    cell: (r) => <span className="tabular-nums">{r.reportsSubmitted}</span>,
  },
  {
    key: "completionRate",
    header: "Productivity",
    sortable: true,
    accessor: (r) => r.completionRate,
    align: "right",
    cell: (r) => <span className="tabular-nums">{r.completionRate}%</span>,
  },
]

export default function AnalyticsPage() {
  const { data, isLoading, error } = useCompanyAnalytics()

  if (isLoading) return <LoadingState label="Loading analytics…" />
  if (error || !data) return <ErrorState message={error || "Unable to load analytics"} />

  const { jobs, inspectors, reports } = data
  const statusDonut = jobs.byStatus.map((row) => ({
    name: row.label,
    value: row.count,
    key: row.status,
  }))

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Company analytics"
        description="Job, inspector, and report metrics for your company."
      />

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Job analytics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Total jobs" value={String(jobs.total)} icon={ClipboardListIcon} />
          <KpiCard
            label="Avg completion time"
            value={jobs.avgCompletionLabel}
            icon={ClockIcon}
            helper="Start → complete"
          />
          <KpiCard
            label="Completed (6 mo)"
            value={String(jobs.monthly.reduce((sum, row) => sum + row.completed, 0))}
            icon={CheckCircle2Icon}
          />
          <KpiCard
            label="Statuses tracked"
            value={String(jobs.byStatus.length)}
            icon={ClipboardListIcon}
            helper="Distinct job statuses"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Jobs by status</CardTitle>
              <CardDescription>Current distribution across the company pipeline.</CardDescription>
            </CardHeader>
            <CardContent>
              {statusDonut.length ? (
                <ClaimDonutChart data={statusDonut} />
              ) : (
                <p className="text-sm text-muted-foreground">No jobs yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly trends</CardTitle>
              <CardDescription>Jobs created vs completed over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyJobsChart data={jobs.monthly} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Inspector analytics</h2>
        <Card>
          <CardHeader>
            <CardTitle>Productivity ranking</CardTitle>
            <CardDescription>
              Jobs assigned, completed, reports submitted, and completion rate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={inspectors}
              columns={inspectorColumns}
              rowKey={(r) => r.id}
              searchable
              searchPlaceholder="Search inspectors…"
              pageSize={10}
              emptyTitle="No inspectors"
              emptyDescription="Add inspectors on the Staff page to see productivity ranking."
            />
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Report analytics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard
            label="Reports approved"
            value={String(reports.approved)}
            icon={FileCheckIcon}
          />
          <KpiCard
            label="Reports rejected"
            value={String(reports.rejected)}
            icon={FileXIcon}
          />
          <KpiCard
            label="Avg review time"
            value={reports.avgReviewLabel}
            icon={TimerIcon}
            helper="Submitted → reviewed"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Completed inspections trend</CardTitle>
            <CardDescription>Completed jobs by month (same window as monthly trends).</CardDescription>
          </CardHeader>
          <CardContent>
            <InspectionVolumeChart data={jobs.monthly} />
          </CardContent>
        </Card>
      </section>
    </>
  )
}
