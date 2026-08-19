"use client"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { ApiVolumeChart, StorageUsageChart, TenantApiChart, TenantInspectionChart } from "@/components/shared/charts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUsage } from "@/modules/platform-usage/hooks/use-usage"
import type { UsageRow } from "@/modules/platform-usage/types/usage.types"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"

const columns: Column<UsageRow>[] = [
  {
    key: "rank",
    header: "#",
    className: "w-10",
    cell: (row) => (
      <span className="text-muted-foreground tabular-nums">
        {row.inspections}
      </span>
    ),
  },
  {
    key: "name",
    header: "Tenant",
    sortable: true,
    accessor: (r) => r.name,
    cell: (r) => <span className="font-medium">{r.name}</span>,
  },
  {
    key: "inspections",
    header: "Inspections",
    sortable: true,
    accessor: (r) => r.inspections,
    align: "right",
    cell: (r) => <span className="tabular-nums">{r.inspections.toLocaleString()}</span>,
  },
  {
    key: "storage",
    header: "Storage (GB)",
    sortable: true,
    accessor: (r) => r.storage,
    align: "right",
    cell: (r) => <span className="tabular-nums">{r.storage}</span>,
  },
  {
    key: "api",
    header: "API calls",
    sortable: true,
    accessor: (r) => r.api,
    align: "right",
    cell: (r) => <span className="tabular-nums">{r.api.toLocaleString()}</span>,
  },
]

export default function UsagePage() {
  const { data, isLoading, error } = useUsage()
  const usageByTenant = data?.byTenant ?? []

  if (isLoading) return <LoadingState label="Loading usage…" />
  if (error) return <ErrorState message={error} />
  return (
    <>
      <PageHeader
        eyebrow="Platform admin"
        title="Usage monitoring"
        description="Storage, inspection volume, and API usage across tenants."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Storage usage</CardTitle>
            <CardDescription>Gigabytes stored per tenant</CardDescription>
          </CardHeader>
          <CardContent>
            <StorageUsageChart data={usageByTenant} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inspection volume</CardTitle>
            <CardDescription>Completed inspections per tenant</CardDescription>
          </CardHeader>
          <CardContent>
            <TenantInspectionChart data={usageByTenant} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>API usage</CardTitle>
            <CardDescription>Calls attributed per tenant this month</CardDescription>
          </CardHeader>
          <CardContent>
            <TenantApiChart data={usageByTenant} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform API volume</CardTitle>
          <CardDescription>Total calls over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ApiVolumeChart data={data?.apiVolume ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top tenants by usage</CardTitle>
          <CardDescription>Leaderboard ranked by inspection volume</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={usageByTenant}
            columns={columns}
            rowKey={(r) => r.name}
            searchable={false}
            pageSize={8}
            emptyTitle="No usage data"
            emptyDescription="Usage will appear once tenants start running inspections."
          />
        </CardContent>
      </Card>
    </>
  )
}
