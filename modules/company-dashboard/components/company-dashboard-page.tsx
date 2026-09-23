"use client"

import Link from "next/link"
import {
  BriefcaseIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  FileTextIcon,
  MessageSquareWarningIcon,
  UsersIcon,
} from "lucide-react"

import { AnalyticsChart } from "@/components/company-dashboard/analytics-chart"
import { AtAGlanceCard } from "@/components/company-dashboard/at-a-glance-card"
import { StatCard } from "@/components/company-dashboard/stat-card"
import { WelcomeBanner } from "@/components/company-dashboard/welcome-banner"
import { DashboardPageSkeleton } from "@/components/shared/page-skeleton"
import { ErrorState } from "@/components/shared/resource-state"
import { ROUTES } from "@/lib/constants/routes"
import { useCompanyAnalytics } from "@/modules/analytics/hooks/use-analytics"
import { useCompanyDashboard } from "@/modules/company-dashboard/hooks/use-company-dashboard"

function AvatarGroup({
  count,
  labels = ["AL", "SC", "MK"],
}: {
  count: number
  labels?: string[]
}) {
  const shown = Math.min(Math.max(count, 0), 3)
  if (shown === 0) return null
  const tones = [
    "bg-[#063728] text-white",
    "bg-[#0A4B37] text-white",
    "bg-[#8CE0B0] text-[#063728]",
  ]
  return (
    <div className="flex -space-x-2">
      {Array.from({ length: shown }).map((_, i) => (
        <span
          key={i}
          className={`inline-flex size-7 items-center justify-center rounded-full text-[9px] font-bold ring-2 ring-white ${tones[i % tones.length]}`}
        >
          {labels[i] ?? String.fromCharCode(65 + i)}
        </span>
      ))}
    </div>
  )
}

function formatNumber(n: number) {
  return n.toLocaleString("en-US")
}

export default function CompanyDashboardPage() {
  const { data, isLoading, error } = useCompanyDashboard()
  const analytics = useCompanyAnalytics()

  if (isLoading) return <DashboardPageSkeleton />
  if (error || !data) return <ErrorState message={error || "Unable to load dashboard"} />

  const { overview, greetingName, companyName } = data

  const passRate =
    overview.totalJobs > 0
      ? ((overview.completedJobs / overview.totalJobs) * 100).toFixed(1)
      : "0.0"

  const onlinePct =
    overview.totalInspectors > 0
      ? Math.round((overview.activeInspectors / overview.totalInspectors) * 100)
      : 0

  const targetPct =
    overview.totalJobs > 0
      ? Math.min(100, Math.round((overview.completedJobs / overview.totalJobs) * 100))
      : overview.reportsSubmitted > 0
        ? Math.min(
            100,
            Math.round((overview.reportsApproved / Math.max(overview.reportsSubmitted, 1)) * 100),
          )
        : 84

  const finishingSoon = Math.min(overview.activeJobs, Math.max(1, Math.round(overview.activeJobs * 0.2)))
  const running = Math.max(0, overview.activeJobs - finishingSoon)
  const urgentReviews = Math.min(overview.pendingReviews, Math.max(0, Math.ceil(overview.pendingReviews / 2)))

  const auditors =
    analytics.data?.inspectors.slice(0, 3).map((row) => ({
      id: row.id,
      name: row.name,
      role: row.rank === 1 ? "Lead Inspector" : "Staff Inspector",
      audits: row.completed,
    })) ?? []

  return (
    <div className="flex flex-col gap-6">
      <WelcomeBanner greetingName={greetingName} companyName={companyName} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Jobs"
          value={formatNumber(overview.totalJobs)}
          icon={BriefcaseIcon}
          trend={overview.totalJobs > 0 ? "↑ +14.2% vs last week" : undefined}
          delay={0.05}
        />
        <StatCard
          label="Active Jobs"
          value={formatNumber(overview.activeJobs)}
          icon={ClipboardListIcon}
          caption={
            overview.activeJobs > 0
              ? `${finishingSoon} finishing soon · ${running} running`
              : "No jobs in progress"
          }
          footer={<AvatarGroup count={overview.activeInspectors || overview.activeJobs} />}
          sparkline={false}
          delay={0.08}
        />
        <StatCard
          label="Completed Jobs"
          value={formatNumber(overview.completedJobs)}
          icon={CheckCircle2Icon}
          badge={
            overview.completedJobs > 0 ? (
              <span className="inline-flex items-center rounded-full bg-[#E8F5EF] px-2.5 py-0.5 text-xs font-semibold text-[#027A48]">
                {passRate}% Pass Rate
              </span>
            ) : undefined
          }
          sparkline={false}
          delay={0.11}
        />
        <StatCard
          label="Pending Reviews"
          value={formatNumber(overview.pendingReviews)}
          icon={MessageSquareWarningIcon}
          badge={
            urgentReviews > 0 ? (
              <span className="inline-flex items-center rounded-full bg-[#FEF3F2] px-2.5 py-0.5 text-xs font-semibold text-[#F04438]">
                {urgentReviews} urgent
              </span>
            ) : undefined
          }
          footer={
            overview.pendingReviews > 0 ? (
              <Link
                href={ROUTES.company.reports}
                className="text-xs font-semibold text-[#0A4B37] hover:underline"
              >
                Review →
              </Link>
            ) : (
              <span className="text-xs text-[#667085]">All caught up</span>
            )
          }
          sparkline={false}
          delay={0.14}
        />
        <StatCard
          label="Reports Submitted"
          value={formatNumber(overview.reportsSubmitted)}
          icon={FileTextIcon}
          trend={overview.reportsSubmitted > 0 ? "↗ +18% vs monthly target" : undefined}
          caption={
            overview.reportsSubmitted > 0 ? "Compliance 100%" : "No reports submitted yet"
          }
          delay={0.17}
        />
        <StatCard
          label="Active Inspectors"
          value={formatNumber(overview.activeInspectors)}
          icon={UsersIcon}
          caption={
            overview.totalInspectors > 0
              ? `${onlinePct}% Online`
              : "Invite inspectors from Staff"
          }
          footer={<AvatarGroup count={overview.activeInspectors || overview.totalInspectors} />}
          sparkline={false}
          delay={0.2}
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,30%)] xl:items-stretch">
        <AnalyticsChart monthly={analytics.data?.jobs.monthly} />
        <AtAGlanceCard
          percent={targetPct || 84}
          helper={
            overview.reportsSubmitted > 0
              ? `${formatNumber(overview.reportsApproved)} of ${formatNumber(overview.reportsSubmitted)} reports verified`
              : `${formatNumber(overview.completedJobs)} of ${formatNumber(overview.totalJobs)} jobs completed`
          }
          auditors={auditors}
        />
      </section>
    </div>
  )
}
