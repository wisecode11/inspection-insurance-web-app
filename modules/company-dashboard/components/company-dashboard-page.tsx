"use client"

import Link from "next/link"
import {
  BriefcaseIcon,
  ClipboardListIcon,
  CheckCircle2Icon,
  MessageSquareWarningIcon,
  FileTextIcon,
  UsersIcon,
  PlusIcon,
  DownloadIcon,
} from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { DashboardPageSkeleton } from "@/components/shared/page-skeleton"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants/routes"
import { useCompanyDashboard } from "@/modules/company-dashboard/hooks/use-company-dashboard"
import { ErrorState } from "@/components/shared/resource-state"
import { DashboardMetricCard } from "@/modules/company-dashboard/components/dashboard-metric-card"
import { DashboardOperationalOverview } from "@/modules/company-dashboard/components/dashboard-operational-overview"
import { DashboardActivityFeed } from "@/modules/company-dashboard/components/dashboard-activity-feed"

export default function CompanyDashboardPage() {
  const { data, isLoading, error } = useCompanyDashboard()

  if (isLoading) return <DashboardPageSkeleton />
  if (error || !data) return <ErrorState message={error || "Unable to load dashboard"} />

  const { overview, recentActivity, greetingName, companyName } = data

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome, ${greetingName}`}
        description={`Overview for ${companyName} — jobs, team activity, and recent updates.`}
        actions={
          <>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={ROUTES.company.analytics} />}
            >
              <DownloadIcon data-icon="inline-start" />
              Export report
            </Button>
            <Button variant="default" nativeButton={false} render={<Link href={ROUTES.company.jobs} />}>
              <PlusIcon data-icon="inline-start" />
              New job
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:col-span-2">
          <DashboardMetricCard
            label="Total jobs"
            value={String(overview.totalJobs)}
            icon={BriefcaseIcon}
            highlight
            emptyHint="Create your first job to get started"
          />
          <DashboardMetricCard
            label="Active jobs"
            value={String(overview.activeJobs)}
            icon={ClipboardListIcon}
            emptyHint="No jobs in progress right now"
          />
          <DashboardMetricCard
            label="Completed jobs"
            value={String(overview.completedJobs)}
            icon={CheckCircle2Icon}
          />
          <DashboardMetricCard
            label="Pending reviews"
            value={String(overview.pendingReviews)}
            icon={MessageSquareWarningIcon}
            emptyHint="All caught up — nothing pending"
          />
          <DashboardMetricCard
            label="Reports submitted"
            value={String(overview.reportsSubmitted)}
            icon={FileTextIcon}
          />
          <DashboardMetricCard
            label="Total inspectors"
            value={String(overview.totalInspectors)}
            icon={UsersIcon}
            emptyHint="Invite inspectors from Staff"
          />
        </div>

        <DashboardOperationalOverview overview={overview} />
      </div>

      <DashboardActivityFeed items={recentActivity} />
    </div>
  )
}
