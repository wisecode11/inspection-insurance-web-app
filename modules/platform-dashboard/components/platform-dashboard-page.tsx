"use client"

import { Building2Icon, DollarSignIcon, ClipboardListIcon, HardDriveIcon, ArrowUpRightIcon } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { KpiCard } from "@/components/shared/kpi-card"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { TenantGrowthChart } from "@/components/shared/charts"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePlatformDashboard } from "@/modules/platform-dashboard/hooks/use-platform-dashboard"
import type { Tenant } from "@/modules/platform-tenants/types/tenant.types"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { ROUTES } from "@/lib/constants/routes"

const columns: Column<Tenant>[] = [
  {
    key: "name",
    header: "Company",
    cell: (t) => (
      <div className="flex flex-col">
        <span className="font-medium">{t.name}</span>
        <span className="text-xs text-muted-foreground">{t.region}</span>
      </div>
    ),
  },
  { key: "plan", header: "Plan", cell: (t) => <span className="text-sm">{t.plan}</span> },
  {
    key: "status",
    header: "Status",
    cell: (t) => <StatusBadge status={t.status} />,
  },
  {
    key: "created",
    header: "Onboarded",
    align: "right",
    cell: (t) => <span className="text-sm text-muted-foreground tabular-nums">{t.created}</span>,
  },
]

export default function PlatformDashboardPage() {
  const { data, isLoading, error } = usePlatformDashboard()
  const onboardedCompanies = data?.recentTenants ?? []

  if (isLoading) return <LoadingState label="Loading platform…" />
  if (error) return <ErrorState message={error} />
  return (
    <>
      <PageHeader
        eyebrow="Platform admin"
        title="Platform overview"
        description="Health of the RoofClaim platform across all roofing company tenants."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active companies" value="42" icon={Building2Icon} delta={11} deltaLabel="vs last month" />
        <KpiCard label="Monthly recurring revenue" value="$28,640" icon={DollarSignIcon} delta={8.2} deltaLabel="vs last month" />
        <KpiCard label="Inspections this month" value="4,912" icon={ClipboardListIcon} delta={14} deltaLabel="vs last month" />
        <KpiCard label="Storage used" value="1.24 TB" icon={HardDriveIcon} delta={6} deltaLabel="of 4 TB pooled" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tenant growth</CardTitle>
            <CardDescription>Active tenants over the last 7 months</CardDescription>
          </CardHeader>
          <CardContent>
            <TenantGrowthChart data={data?.tenantGrowth ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This month at a glance</CardTitle>
            <CardDescription>Key movements across the platform</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[
              { label: "New tenants", value: "+4", tone: "text-success" },
              { label: "Upgrades to Pro / Enterprise", value: "+3", tone: "text-success" },
              { label: "Trials started", value: "6", tone: "text-foreground" },
              { label: "Suspended accounts", value: "2", tone: "text-danger" },
              { label: "Failed payments", value: "2", tone: "text-danger" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={`font-semibold tabular-nums ${row.tone}`}>{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recently onboarded companies</CardTitle>
          <CardDescription>Newest roofing companies to join the platform</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" render={<a href={ROUTES.platform.tenants} />}>
              View all tenants
              <ArrowUpRightIcon data-icon="inline-end" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <DataTable
            data={onboardedCompanies}
            columns={columns}
            rowKey={(t) => t.id}
            searchable={false}
            pageSize={6}
          />
        </CardContent>
      </Card>
    </>
  )
}
