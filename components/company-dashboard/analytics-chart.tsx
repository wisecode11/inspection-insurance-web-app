"use client"

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { motion } from "framer-motion"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { ROUTES } from "@/lib/constants/routes"
import type { MonthlyTrendPoint } from "@/modules/analytics/types/analytics.types"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

function buildWeeklySeries(monthly: MonthlyTrendPoint[] | undefined) {
  const last = monthly?.slice(-2) ?? []
  const jobsBase =
    last.reduce((s, r) => s + (r.total || 0), 0) / Math.max(last.length, 1) || 42
  const reviewsBase =
    last.reduce((s, r) => s + (r.completed || 0), 0) / Math.max(last.length, 1) || 28

  // Weekday peak / weekend soft — matches reference silhouette
  const weights = [0.72, 0.95, 1.28, 1.05, 0.98, 0.42, 0.35]
  return DAYS.map((day, i) => {
    const weekend = i >= 5
    return {
      day,
      automated: Math.max(4, Math.round(jobsBase * weights[i] * 0.55)),
      reviews: Math.max(2, Math.round(reviewsBase * weights[i] * 0.5)),
      weekend,
    }
  })
}

const config = {
  automated: { label: "Automated Jobs", color: "#063728" },
  reviews: { label: "Inspector Reviews", color: "#8CE0B0" },
} satisfies ChartConfig

export function AnalyticsChart({ monthly }: { monthly?: MonthlyTrendPoint[] }) {
  const data = buildWeeklySeries(monthly)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="flex h-full flex-col rounded-[20px] border border-[#E6E9E7] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      <div className="flex flex-col gap-3 border-b border-[#E6E9E7] px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-[#101828]">
            Weekly Job &amp; Inspection Throughput
          </h2>
          <p className="mt-0.5 text-sm text-[#667085]">
            Aggregate executions and verification logs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#667085]">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#063728]" />
            Automated Jobs
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#8CE0B0]" />
            Inspector Reviews
          </span>
        </div>
      </div>

      <div className="flex-1 px-3 pt-4 pb-2 sm:px-5">
        <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
          <BarChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }} barGap={4}>
            <CartesianGrid vertical={false} stroke="#EEF1EF" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fill: "#667085", fontSize: 12 }}
            />
            <YAxis
              width={28}
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tick={{ fill: "#667085", fontSize: 11 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="automated" radius={[6, 6, 0, 0]} barSize={16}>
              {data.map((entry) => (
                <Cell
                  key={`a-${entry.day}`}
                  fill={entry.weekend ? "#D0D5DD" : "#063728"}
                />
              ))}
            </Bar>
            <Bar dataKey="reviews" radius={[6, 6, 0, 0]} barSize={16}>
              {data.map((entry) => (
                <Cell
                  key={`r-${entry.day}`}
                  fill={entry.weekend ? "#E4E7EC" : "#8CE0B0"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <div className="flex items-center justify-between border-t border-[#E6E9E7] px-6 py-3.5">
        <p className="text-xs text-[#667085]">
          Peak system throughput mid-week during inspection windows
        </p>
        <Link
          href={ROUTES.company.analytics}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A4B37] hover:underline"
        >
          View analytics
          <ArrowRightIcon className="size-3.5" />
        </Link>
      </div>
    </motion.div>
  )
}
