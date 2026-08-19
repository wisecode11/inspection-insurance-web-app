"use client"

import Link from "next/link"
import {
  ClipboardListIcon,
  HardHatIcon,
  ClockIcon,
  CircleAlertIcon,
  PlusIcon,
  CameraIcon,
  FileTextIcon,
  UsersIcon,
} from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { KpiCard } from "@/components/shared/kpi-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { InspectionVolumeChart } from "@/components/shared/charts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ROUTES } from "@/lib/constants/routes"
import { useCompanyActivity } from "@/modules/company-dashboard/hooks/use-company-activity"
import { useCompanyAnalytics } from "@/modules/analytics/hooks/use-analytics"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"

const quickActions = [
  { label: "New inspection", icon: PlusIcon, href: ROUTES.company.jobs },
  { label: "Upload photos", icon: CameraIcon, href: ROUTES.company.jobs },
  { label: "Export report", icon: FileTextIcon, href: ROUTES.company.jobs },
  { label: "Invite inspector", icon: UsersIcon, href: ROUTES.company.staff },
]

export default function CompanyDashboardPage() {
  const { data: companyActivity = [], isLoading, error } = useCompanyActivity()
  const { data: analytics } = useCompanyAnalytics()

  if (isLoading) return <LoadingState label="Loading dashboard…" />
  if (error) return <ErrorState message={error} />
  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Good afternoon, Sam"
        description="Here's what's happening at Summit Ridge Roofing today."
        actions={
          <Button
            className="bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
            render={<Link href={ROUTES.company.jobs} />}
          >
            <PlusIcon data-icon="inline-start" />
            New inspection
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Inspections this month" value="64" icon={ClipboardListIcon} delta={10} deltaLabel="vs last month" />
        <KpiCard label="Active jobs" value="18" icon={HardHatIcon} delta={4} deltaLabel="in progress" />
        <KpiCard label="Pending review" value="7" icon={CircleAlertIcon} delta={-12} deltaLabel="awaiting approval" />
        <KpiCard label="Avg cycle time" value="2.3 days" icon={ClockIcon} delta={-8} deltaLabel="faster than last mo" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inspection volume</CardTitle>
            <CardDescription>Completed inspections over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <InspectionVolumeChart data={analytics?.inspectionVolume ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump straight into common tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="flex flex-col items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/50"
              >
                <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <a.icon className="size-4.5" />
                </span>
                <span className="text-sm font-medium">{a.label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Latest updates across your team and inspections</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col">
            {companyActivity.map((item, i) => (
              <li
                key={item.id}
                className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                style={{ borderTop: i === 0 ? undefined : "1px solid var(--border)" }}
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                    {item.actor
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-sm text-pretty">
                    <span className="font-medium">{item.actor}</span>{" "}
                    <span className="text-muted-foreground">{item.action}</span>{" "}
                    <span className="font-medium">{item.target}</span>
                  </p>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
                <StatusBadge status={item.tone} />
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </>
  )
}
