"use client"

import * as React from "react"
import Link from "next/link"
import {
  ActivityIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckCircle2Icon,
  FileTextIcon,
  HardHatIcon,
  LayersIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

import { AnalyticsChart } from "@/components/company-dashboard/analytics-chart"
import { AtAGlanceCard } from "@/components/company-dashboard/at-a-glance-card"
import { Pill, StatCard } from "@/components/company-dashboard/stat-card"
import {
  DASHBOARD_RANGES,
  DashboardRangeSelect,
  WelcomeBanner,
  type DashboardRange,
} from "@/components/company-dashboard/welcome-banner"
import { DashboardPageSkeleton } from "@/components/shared/page-skeleton"
import { ErrorState } from "@/components/shared/resource-state"
import { getErrorMessage } from "@/lib/api/errors"
import { ROUTES } from "@/lib/constants/routes"
import { useCompanyAnalytics } from "@/modules/analytics/hooks/use-analytics"
import { useCompanyDashboard } from "@/modules/company-dashboard/hooks/use-company-dashboard"

const AVATAR_TONES = [
  "bg-[#C7C4F5] text-[#2B2670]",
  "bg-[#063728] text-white",
  "bg-[#8CE0B0] text-[#063728]",
]

function AvatarGroup({
  count,
  labels = ["AL", "SC", "MK"],
  label,
}: {
  count: number
  labels?: string[]
  label: string
}) {
  const shown = Math.min(Math.max(count, 0), 3)
  if (shown === 0) return null
  const names = Array.from({ length: shown }, (_, i) => labels[i] ?? String.fromCharCode(65 + i))
  return (
    <div className="flex" aria-label={`${label}: ${names.join(", ")}`}>
      {names.map((name, i) => (
        <span
          key={i}
          className={`grid size-8 place-items-center rounded-full text-[11px] font-bold tracking-[0.02em] ring-2 ring-white ${i > 0 ? "-ml-2" : ""} ${AVATAR_TONES[i % AVATAR_TONES.length]}`}
        >
          {name}
        </span>
      ))}
    </div>
  )
}

function formatNumber(n: number) {
  return n.toLocaleString("en-US")
}

export default function CompanyDashboardPage() {
  const { data, isLoading, error, reload } = useCompanyDashboard()
  const analytics = useCompanyAnalytics()
  const [range, setRange] = React.useState<DashboardRange>("7d")

  if (isLoading) return <DashboardPageSkeleton />
  if (error || !data) return <ErrorState message={error || "Unable to load dashboard"} />

  const { overview, greetingName, companyName } = data
  const rangeLabel = DASHBOARD_RANGES.find((r) => r.value === range)?.label ?? ""

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

  const monthly = analytics.data?.jobs.monthly ?? []
  const jobsSpark = monthly.slice(-7).map((m) => m.total)
  const completedSpark = monthly.slice(-7).map((m) => m.completed)

  const auditors =
    analytics.data?.inspectors.slice(0, 3).map((row) => ({
      id: row.id,
      name: row.name,
      role: row.rank === 1 ? "Lead Inspector" : "Staff Inspector",
      audits: row.completed,
    })) ?? []

  const refresh = async () => {
    try {
      await Promise.all([reload(), analytics.reload()])
      toast.success("Dashboard refreshed")
    } catch (caught) {
      toast.error(getErrorMessage(caught))
    }
  }

  return (
    <div className="flex flex-col">
      <WelcomeBanner
        greetingName={greetingName}
        companyName={companyName}
        activeJobs={overview.activeJobs}
        reportsSubmitted={overview.reportsSubmitted}
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        className="mt-7 mb-3.5 flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h2 className="m-0 text-2xl font-bold tracking-[-0.025em] text-[#0E1B16]">Key metrics</h2>
          <p className="mt-0.5 text-sm text-[#6B7A73]">{rangeLabel}</p>
        </div>
        <DashboardRangeSelect value={range} onChange={setRange} />
      </motion.div>

      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Jobs"
          value={overview.totalJobs}
          icon={LayersIcon}
          tone="green"
          meta={
            overview.totalJobs > 0 ? (
              <Pill icon={ArrowUpRightIcon}>+14.2% vs last week</Pill>
            ) : (
              <span>No jobs yet</span>
            )
          }
          spark={jobsSpark}
        />
        <StatCard
          label="Active Jobs"
          value={overview.activeJobs}
          icon={ActivityIcon}
          tone="green"
          featured
          meta={
            <span>
              {overview.activeJobs > 0
                ? `${finishingSoon} finishing soon · ${running} running`
                : "No jobs in progress"}
            </span>
          }
          aside={
            <AvatarGroup
              label="Assigned inspectors"
              count={overview.activeInspectors || overview.activeJobs}
            />
          }
          delay={0.07}
        />
        <StatCard
          label="Completed Jobs"
          value={overview.completedJobs}
          icon={CheckCircle2Icon}
          tone="green"
          meta={
            overview.completedJobs > 0 ? (
              <Pill>{passRate}% Pass Rate</Pill>
            ) : (
              <span>None completed yet</span>
            )
          }
          delay={0.14}
        />
        <StatCard
          label="Pending Reviews"
          value={overview.pendingReviews}
          icon={TriangleAlertIcon}
          tone="amber"
          featured
          meta={
            urgentReviews > 0 ? <Pill tone="red">{urgentReviews} urgent</Pill> : <span>All caught up</span>
          }
          aside={
            overview.pendingReviews > 0 ? (
              <Link
                href={ROUTES.company.reports}
                className="group/link inline-flex items-center gap-1 text-[13.5px] font-semibold text-[#D97706]"
              >
                Review
                <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover/link:translate-x-[3px]" />
              </Link>
            ) : undefined
          }
        />
        <StatCard
          label="Reports Submitted"
          value={overview.reportsSubmitted}
          icon={FileTextIcon}
          tone="teal"
          meta={
            overview.reportsSubmitted > 0 ? (
              <>
                <span className="font-semibold text-[#0F9488]">↗ +18% vs monthly target</span>
                <span>Compliance 100%</span>
              </>
            ) : (
              <span>No reports submitted yet</span>
            )
          }
          spark={completedSpark}
          delay={0.07}
        />
        <StatCard
          label="Active Inspectors"
          value={overview.activeInspectors}
          icon={HardHatIcon}
          tone="slate"
          meta={
            overview.totalInspectors > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#2FBF6B]" />
                {onlinePct}% Online
              </span>
            ) : (
              <span>Invite inspectors from Staff</span>
            )
          }
          aside={
            <AvatarGroup
              label="Online inspectors"
              count={overview.activeInspectors || overview.totalInspectors}
            />
          }
          delay={0.14}
        />
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <AnalyticsChart monthly={analytics.data?.jobs.monthly} />
        <AtAGlanceCard
          percent={targetPct || 84}
          helper={
            overview.reportsSubmitted > 0
              ? `${formatNumber(overview.reportsApproved)} of ${formatNumber(overview.reportsSubmitted)} reports verified`
              : `${formatNumber(overview.completedJobs)} of ${formatNumber(overview.totalJobs)} jobs completed`
          }
          auditors={auditors}
          onRefresh={refresh}
        />
      </div>
    </div>
  )
}
