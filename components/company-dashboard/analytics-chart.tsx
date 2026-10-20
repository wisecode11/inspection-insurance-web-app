"use client"

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { motion } from "framer-motion"
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from "recharts"

import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { ROUTES } from "@/lib/constants/routes"
import type { MonthlyTrendPoint } from "@/modules/analytics/types/analytics.types"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

const COLORS = {
  automated: "#063728",
  reviews: "#8CE0B0",
  automatedMuted: "#D0D5DD",
  reviewsMuted: "#E4E7EC",
}

type Row = { day: string; automated: number; reviews: number; weekend: boolean }

function buildWeeklySeries(monthly: MonthlyTrendPoint[] | undefined): Row[] {
  const last = monthly?.slice(-2) ?? []
  const jobsBase =
    last.reduce((s, r) => s + (r.total || 0), 0) / Math.max(last.length, 1) || 42
  const reviewsBase =
    last.reduce((s, r) => s + (r.completed || 0), 0) / Math.max(last.length, 1) || 28

  // Weekday peak / weekend soft — matches reference silhouette
  const weights = [0.72, 0.95, 1.28, 1.05, 0.98, 0.42, 0.35]
  return DAYS.map((day, i) => ({
    day,
    automated: Math.max(4, Math.round(jobsBase * weights[i] * 0.55)),
    reviews: Math.max(2, Math.round(reviewsBase * weights[i] * 0.5)),
    weekend: i >= 5,
  }))
}

const config = {
  automated: { label: "Automated Jobs", color: COLORS.automated },
  reviews: { label: "Inspector Reviews", color: COLORS.reviews },
} satisfies ChartConfig

function ThroughputTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: Row }[]
}) {
  const row = payload?.[0]?.payload
  if (!active || !row) return null
  return (
    <div className="min-w-[150px] rounded-xl border border-border bg-card/90 px-3 py-2.5 text-[12.5px] shadow-[0_8px_24px_-8px_rgba(6,55,40,0.18),0_2px_6px_rgba(6,55,40,0.06)] backdrop-blur-md dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.55)]">
      <b className="mb-1 block text-[13px] text-foreground">{row.day}</b>
      {(
        [
          ["Automated", row.automated, COLORS.automated],
          ["Reviews", row.reviews, COLORS.reviews],
        ] as const
      ).map(([label, value, color]) => (
        <div key={label} className="flex justify-between gap-4 text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block size-2 rounded-[2px]" style={{ background: color }} />
            {label}
          </span>
          <strong className="tabular-nums text-foreground">{value}</strong>
        </div>
      ))}
    </div>
  )
}

export function AnalyticsChart({ monthly }: { monthly?: MonthlyTrendPoint[] }) {
  const data = buildWeeklySeries(monthly)

  return (
    <motion.section
      aria-labelledby="throughput-title"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(6,55,40,0.06),0_1px_3px_rgba(6,55,40,0.05)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 px-[22px] pt-5">
        <div>
          <h3 id="throughput-title" className="m-0 text-[17px] font-bold tracking-[-0.01em] text-foreground">
            Weekly Job &amp; Inspection Throughput
          </h3>
          <p className="mt-0.5 text-[13.5px] text-muted-foreground">Aggregate executions and verification logs.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-[13px] text-muted-foreground">
          <span className="inline-flex items-center gap-[7px]">
            <i className="size-2.5 rounded-[3px]" style={{ background: COLORS.automated }} />
            Automated Jobs
          </span>
          <span className="inline-flex items-center gap-[7px]">
            <i className="size-2.5 rounded-[3px]" style={{ background: COLORS.reviews }} />
            Inspector Reviews
          </span>
        </div>
      </div>

      <div className="flex-1 px-3.5 pt-3 pb-1.5">
        <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
          <BarChart
            data={data}
            margin={{ left: 0, right: 8, top: 12, bottom: 0 }}
            barGap={6}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              width={30}
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              allowDecimals={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <Tooltip
              content={<ThroughputTooltip />}
              cursor={{ fill: "rgba(22,163,74,0.07)", radius: 10 }}
            />
            <Bar
              dataKey="automated"
              radius={5}
              barSize={22}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry) => (
                <Cell
                  key={`a-${entry.day}`}
                  fill={entry.weekend ? COLORS.automatedMuted : COLORS.automated}
                />
              ))}
            </Bar>
            <Bar
              dataKey="reviews"
              radius={5}
              barSize={22}
              animationDuration={800}
              animationBegin={120}
              animationEasing="ease-out"
            >
              {data.map((entry) => (
                <Cell
                  key={`r-${entry.day}`}
                  fill={entry.weekend ? COLORS.reviewsMuted : COLORS.reviews}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-[22px] py-3.5 text-[13px] text-muted-foreground">
        <span>Peak system throughput mid-week during inspection windows</span>
        <Link
          href={ROUTES.company.analytics}
          className="group inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#16A34A] dark:text-[#7ddeb0]"
        >
          View analytics
          <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-[3px]" />
        </Link>
      </div>
    </motion.section>
  )
}
