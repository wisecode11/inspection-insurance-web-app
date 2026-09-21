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

import { DashboardPageSkeleton } from "@/components/shared/page-skeleton"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants/routes"
import { useCompanyDashboard } from "@/modules/company-dashboard/hooks/use-company-dashboard"
import { ErrorState } from "@/components/shared/resource-state"
import { GlassMetricCard } from "@/modules/company-dashboard/components/glass-metric-card"
import { DashboardOperationalOverview } from "@/modules/company-dashboard/components/dashboard-operational-overview"
import { DashboardActivityFeed } from "@/modules/company-dashboard/components/dashboard-activity-feed"

export default function CompanyDashboardPage() {
  const { data, isLoading, error } = useCompanyDashboard()

  if (isLoading) return <DashboardPageSkeleton />
  if (error || !data) return <ErrorState message={error || "Unable to load dashboard"} />

  const { overview, recentActivity, greetingName, companyName } = data

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      {/* Hero on green zone */}
      <section className="flex flex-col gap-6 pt-2 sm:gap-8 sm:pt-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-serif text-3xl font-normal tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              Welcome back, {greetingName}!
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
              A simplified overview for {companyName} organization
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="rounded-md border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white"
              nativeButton={false}
              render={<Link href={ROUTES.company.analytics} />}
            >
              <DownloadIcon data-icon="inline-start" />
              Export report
            </Button>
            <Button
              className="rounded-md bg-primary-tint-strong text-primary-dark hover:bg-primary-tint"
              nativeButton={false}
              render={<Link href={ROUTES.company.jobs} />}
            >
              <PlusIcon data-icon="inline-start" />
              New job
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:col-span-2">
            <GlassMetricCard
              label="Total jobs"
              value={String(overview.totalJobs)}
              icon={BriefcaseIcon}
              emptyHint="Create your first job to get started"
            />
            <GlassMetricCard
              label="Active jobs"
              value={String(overview.activeJobs)}
              icon={ClipboardListIcon}
              emptyHint="No jobs in progress right now"
            />
            <GlassMetricCard
              label="Completed jobs"
              value={String(overview.completedJobs)}
              icon={CheckCircle2Icon}
            />
            <GlassMetricCard
              label="Pending reviews"
              value={String(overview.pendingReviews)}
              icon={MessageSquareWarningIcon}
              emptyHint="All caught up — nothing pending"
            />
            <GlassMetricCard
              label="Reports submitted"
              value={String(overview.reportsSubmitted)}
              icon={FileTextIcon}
            />
            <GlassMetricCard
              label="Total inspectors"
              value={String(overview.totalInspectors)}
              icon={UsersIcon}
              emptyHint="Invite inspectors from Staff"
            />
          </div>

          <DashboardOperationalOverview overview={overview} />
        </div>
      </section>

      {/* Activity on light zone */}
      <section className="pt-2 sm:pt-4">
        <DashboardActivityFeed items={recentActivity} />
      </section>
    </div>
  )
}
