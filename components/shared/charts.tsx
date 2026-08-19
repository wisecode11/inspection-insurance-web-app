"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { ClaimSlice, CyclePoint, MonthVolume } from "@/modules/analytics/types/analytics.types"
import type { ApiVolumePoint, TenantGrowthPoint, UsageRow } from "@/modules/platform-usage/types/usage.types"

const axis = {
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
} as const

export function TenantGrowthChart({ data }: { data: TenantGrowthPoint[] }) {
  const config = {
    tenants: { label: "Active tenants", color: "var(--chart-1)" },
  } satisfies ChartConfig
  return (
    <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
      <AreaChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <defs>
          <linearGradient id="fillTenants" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-tenants)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--color-tenants)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} width={28} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="tenants"
          type="monotone"
          stroke="var(--color-tenants)"
          strokeWidth={2}
          fill="url(#fillTenants)"
        />
      </AreaChart>
    </ChartContainer>
  )
}

export function ApiVolumeChart({ data }: { data: ApiVolumePoint[] }) {
  const config = {
    calls: { label: "API calls", color: "var(--chart-1)" },
  } satisfies ChartConfig
  return (
    <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
      <BarChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" {...axis} />
        <YAxis {...axis} width={40} tickFormatter={(v) => `${v / 1000}k`} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="calls" fill="var(--color-calls)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

export function TenantInspectionChart({ data }: { data: UsageRow[] }) {
  const config = {
    inspections: { label: "Inspections", color: "var(--chart-2)" },
  } satisfies ChartConfig
  return (
    <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" {...axis} />
        <YAxis
          type="category"
          dataKey="name"
          {...axis}
          width={140}
          tickFormatter={(v: string) => (v.length > 18 ? v.slice(0, 17) + "…" : v)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="inspections" fill="var(--color-inspections)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

export function TenantApiChart({ data }: { data: UsageRow[] }) {
  const config = {
    api: { label: "API calls", color: "var(--chart-1)" },
  } satisfies ChartConfig
  return (
    <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" {...axis} />
        <YAxis
          type="category"
          dataKey="name"
          {...axis}
          width={140}
          tickFormatter={(v: string) => (v.length > 18 ? v.slice(0, 17) + "…" : v)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="api" fill="var(--color-api)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

export function StorageUsageChart({ data }: { data: UsageRow[] }) {
  const config = {
    storage: { label: "Storage (GB)", color: "var(--chart-3)" },
  } satisfies ChartConfig
  return (
    <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 4, right: 16 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis type="number" {...axis} />
        <YAxis
          type="category"
          dataKey="name"
          {...axis}
          width={140}
          tickFormatter={(v: string) => (v.length > 18 ? v.slice(0, 17) + "…" : v)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="storage" fill="var(--color-storage)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

export function InspectionVolumeChart({ data, height = 260 }: { data: MonthVolume[]; height?: number }) {
  const config = {
    inspections: { label: "Inspections", color: "var(--chart-2)" },
  } satisfies ChartConfig
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
      <BarChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} width={28} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="inspections" fill="var(--color-inspections)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

const claimColors: Record<string, string> = {
  approved: "var(--chart-3)",
  pending: "var(--chart-4)",
  submitted: "var(--chart-1)",
  draft: "var(--chart-5)",
  failed: "var(--destructive)",
}

export function ClaimDonutChart({ data }: { data: ClaimSlice[] }) {
  const config = {
    value: { label: "Claims" },
    approved: { label: "Approved", color: "var(--chart-3)" },
    pending: { label: "Pending", color: "var(--chart-4)" },
    submitted: { label: "Submitted", color: "var(--chart-1)" },
    draft: { label: "Draft", color: "var(--chart-5)" },
    failed: { label: "Failed", color: "var(--destructive)" },
  } satisfies ChartConfig
  const total = data.reduce((a, b) => a + b.value, 0)
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ChartContainer config={config} className="aspect-square h-[220px]">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
          <Pie data={data} dataKey="value" nameKey="key" innerRadius={62} outerRadius={92} strokeWidth={2}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={claimColors[entry.key]} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="flex w-full flex-col gap-2">
        {data.map((entry) => (
          <div key={entry.key} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: claimColors[entry.key] }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-medium tabular-nums">{entry.value}</span>
            <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
              {Math.round((entry.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CycleTimeChart({ data }: { data: CyclePoint[] }) {
  const config = {
    days: { label: "Avg cycle (days)", color: "var(--chart-1)" },
  } satisfies ChartConfig
  return (
    <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
      <LineChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} width={28} domain={[0, "dataMax + 1"]} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          dataKey="days"
          type="monotone"
          stroke="var(--color-days)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--color-days)" }}
        />
      </LineChart>
    </ChartContainer>
  )
}
