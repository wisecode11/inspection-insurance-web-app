"use client"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { ClaimDonutChart, CycleTimeChart, InspectionVolumeChart } from "@/components/shared/charts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCompanyAnalytics } from "@/modules/analytics/hooks/use-analytics"
import type { ProductivityRow } from "@/modules/analytics/types/analytics.types"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"

const columns: Column<ProductivityRow>[] = [
  {
    key: "rank",
    header: "#",
    className: "w-10",
    cell: (row) => (
      <span className="text-muted-foreground tabular-nums">
        {row.jobs}
      </span>
    ),
  },
  {
    key: "name",
    header: "Inspector",
    sortable: true,
    accessor: (r) => r.name,
    cell: (r) => <span className="font-medium">{r.name}</span>,
  },
  {
    key: "jobs",
    header: "Jobs completed",
    sortable: true,
    accessor: (r) => r.jobs,
    align: "right",
    cell: (r) => <span className="tabular-nums">{r.jobs}</span>,
  },
  {
    key: "cycle",
    header: "Avg cycle (days)",
    sortable: true,
    accessor: (r) => r.cycle,
    align: "right",
    cell: (r) => <span className="tabular-nums">{r.cycle.toFixed(1)}</span>,
  },
]

export default function AnalyticsPage() {
  const { data, isLoading, error } = useCompanyAnalytics()
  const staffProductivity = data?.staffProductivity ?? []

  if (isLoading) return <LoadingState label="Loading analytics…" />
  if (error) return <ErrorState message={error} />
  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Analytics"
        description="Inspection volume, staff productivity, claim mix, and cycle-time trend."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inspection volume</CardTitle>
            <CardDescription>Completed inspections over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <InspectionVolumeChart data={data?.inspectionVolume ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Claim status breakdown</CardTitle>
            <CardDescription>Share of claims by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <ClaimDonutChart data={data?.claimBreakdown ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average cycle time</CardTitle>
            <CardDescription>Days from inspection start to approval</CardDescription>
          </CardHeader>
          <CardContent>
            <CycleTimeChart data={data?.cycleTimeTrend ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff productivity</CardTitle>
            <CardDescription>Inspectors ranked by completed jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={staffProductivity}
              columns={columns}
              rowKey={(r) => r.name}
              searchable={false}
              pageSize={8}
              emptyTitle="No productivity data"
              emptyDescription="Completed jobs will appear here once inspectors submit reports."
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
