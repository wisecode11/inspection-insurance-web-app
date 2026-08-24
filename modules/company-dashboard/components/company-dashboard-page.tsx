"use client"

import Link from "next/link"
import {
  ClipboardListIcon,
  HardHatIcon,
  ClockIcon,
  CircleAlertIcon,
  PlusIcon,
  UsersIcon,
  UserCheckIcon,
  FileTextIcon,
  FileCheckIcon,
  CheckCircle2Icon,
} from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { KpiCard } from "@/components/shared/kpi-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ROUTES } from "@/lib/constants/routes"
import { useCompanyDashboard } from "@/modules/company-dashboard/hooks/use-company-dashboard"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"

export default function CompanyDashboardPage() {
  const { data, isLoading, error } = useCompanyDashboard()

  if (isLoading) return <LoadingState label="Loading dashboard…" />
  if (error || !data) return <ErrorState message={error || "Unable to load dashboard"} />

  const { overview, recentActivity, greetingName, companyName } = data

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title={`Welcome, ${greetingName}`}
        description={`Company overview for ${companyName}.`}
        actions={
          <Button
            className="bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
            nativeButton={false}
            render={<Link href={ROUTES.company.jobs} />}
          >
            <PlusIcon data-icon="inline-start" />
            New job
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Total jobs" value={String(overview.totalJobs)} icon={ClipboardListIcon} />
        <KpiCard label="Active jobs" value={String(overview.activeJobs)} icon={HardHatIcon} />
        <KpiCard
          label="Completed jobs"
          value={String(overview.completedJobs)}
          icon={CheckCircle2Icon}
        />
        <KpiCard
          label="Pending reviews"
          value={String(overview.pendingReviews)}
          icon={CircleAlertIcon}
        />
        <KpiCard
          label="Avg completion time"
          value={overview.avgJobCompletionTime}
          icon={ClockIcon}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total inspectors"
          value={String(overview.totalInspectors)}
          icon={UsersIcon}
        />
        <KpiCard
          label="Active inspectors"
          value={String(overview.activeInspectors)}
          icon={UserCheckIcon}
        />
        <KpiCard
          label="Reports submitted"
          value={String(overview.reportsSubmitted)}
          icon={FileTextIcon}
        />
        <KpiCard
          label="Reports approved"
          value={String(overview.reportsApproved)}
          icon={FileCheckIcon}
        />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Latest job updates across your company</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity yet.</p>
          ) : (
            <ol className="flex flex-col">
              {recentActivity.map((item, i) => (
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
                  <StatusBadge status={item.tone as "pending" | "completed" | "cancelled" | "draft" | "in_progress"} />
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </>
  )
}
