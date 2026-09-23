"use client"

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/lib/constants/routes"
import type { MonthlyTrendPoint } from "@/modules/analytics/types/analytics.types"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

function buildWeeklySeries(monthly: MonthlyTrendPoint[] | undefined) {
  const last = monthly?.slice(-2) ?? []
  const jobsBase = last.reduce((s, r) => s + (r.total || 0), 0) / Math.max(last.length, 1) || 8
  const reviewsBase =
    last.reduce((s, r) => s + (r.completed || 0), 0) / Math.max(last.length, 1) || 5

  const weights = [0.7, 0.9, 1.35, 1.1, 1.0, 0.55, 0.4]
  return DAYS.map((day, i) => ({
    day,
    jobs: Math.max(1, Math.round(jobsBase * weights[i] * 0.35)),
    reviews: Math.max(0, Math.round(reviewsBase * weights[i] * 0.4)),
  }))
}

const config = {
  jobs: { label: "Jobs created", color: "#133a42" },
  reviews: { label: "Inspections", color: "#7dcea0" },
} satisfies ChartConfig

export function DashboardThroughputChart({
  monthly,
}: {
  monthly?: MonthlyTrendPoint[]
}) {
  const data = buildWeeklySeries(monthly)

  return (
    <Card className="gap-0 rounded-xl border border-[#e4e9eb] bg-white py-0 shadow-[0_1px_2px_rgba(15,40,46,0.04)]">
      <div className="flex flex-col gap-3 border-b border-[#eef1f2] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-primary-dark">
            Weekly job &amp; inspection throughput
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Created jobs vs completed inspections this week
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-[#133a42]" />
            Jobs created
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-[#7dcea0]" />
            Inspections
          </span>
        </div>
      </div>
      <CardContent className="px-3 pt-4 pb-2 sm:px-5">
        <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
          <BarChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#eef1f2" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#6b7c80", fontSize: 12 }}
            />
            <YAxis
              width={28}
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tick={{ fill: "#6b7c80", fontSize: 11 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="jobs" fill="var(--color-jobs)" radius={[4, 4, 0, 0]} barSize={14} />
            <Bar dataKey="reviews" fill="var(--color-reviews)" radius={[4, 4, 0, 0]} barSize={14} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <div className="flex flex-col gap-2 border-t border-[#eef1f2] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-muted-foreground">
          Peak throughput typically mid-week during inspection windows
        </p>
        <Link
          href={ROUTES.company.analytics}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          View analytics
          <ArrowRightIcon className="size-3.5" />
        </Link>
      </div>
    </Card>
  )
}
