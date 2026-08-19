"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { StormBadge } from "@/components/shared/storm-badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { ROUTES } from "@/lib/constants/routes"
import { useInspections } from "@/modules/inspections/hooks/use-inspections"
import type { Inspection } from "@/modules/inspections/types/inspection.types"

type StatusFilter = "all" | Inspection["status"]
type RangeFilter = "all" | "7d" | "30d"

function inRange(date: string, range: RangeFilter) {
  if (range === "all") return true
  const days = range === "7d" ? 7 : 30
  const start = new Date("2026-08-18")
  start.setDate(start.getDate() - days)
  return new Date(date) >= start
}

const columns: Column<Inspection>[] = [
  {
    key: "id",
    header: "Report",
    sortable: true,
    accessor: (r) => r.id,
    cell: (r) => <span className="font-medium tabular-nums">{r.id}</span>,
  },
  {
    key: "address",
    header: "Property address",
    sortable: true,
    accessor: (r) => r.address,
    cell: (r) => (
      <div className="flex flex-col">
        <span className="font-medium">{r.address}</span>
        <span className="text-xs text-muted-foreground">{r.city}</span>
      </div>
    ),
  },
  {
    key: "inspector",
    header: "Inspector",
    sortable: true,
    accessor: (r) => r.inspector,
  },
  {
    key: "date",
    header: "Date",
    sortable: true,
    accessor: (r) => r.date,
    cell: (r) => <span className="tabular-nums text-muted-foreground">{r.date}</span>,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    accessor: (r) => r.status,
    cell: (r) => <StatusBadge status={r.status} />,
  },
  {
    key: "claimStatus",
    header: "Claim",
    cell: (r) => <StatusBadge status={r.claimStatus} />,
  },
  {
    key: "weather",
    header: "Weather",
    cell: (r) => <StormBadge state={r.weather} size="sm" />,
  },
]

export default function JobsPage() {
  const router = useRouter()
  const { data: inspections = [], isLoading, error } = useInspections()
  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [range, setRange] = React.useState<RangeFilter>("all")

  const rows = React.useMemo(
    () =>
      inspections.filter((row) => (status === "all" || row.status === status) && inRange(row.date, range)),
    [inspections, status, range],
  )

  if (isLoading) return <LoadingState label="Loading inspections…" />
  if (error) return <ErrorState message={error} />

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Jobs & reports"
        description="Search inspections, filter by date and status, then open a report for review."
      />

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(r) => r.id}
        searchPlaceholder="Search address, inspector, or report id…"
        searchKeys={["id", "address", "city", "inspector"]}
        onRowClick={(row) => router.push(ROUTES.company.job(row.id))}
        emptyTitle="No inspections found"
        emptyDescription="Adjust the date range or status filter to see more jobs."
        toolbar={
          <>
            <Select value={range} onValueChange={(value) => setRange(value as RangeFilter)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />
    </>
  )
}
