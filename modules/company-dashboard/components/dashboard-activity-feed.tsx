import Link from "next/link"
import { ArrowUpRightIcon, ClipboardListIcon, MoreHorizontalIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge, type StatusVariant } from "@/components/shared/status-badge"
import { ROUTES } from "@/lib/constants/routes"
import type { CompanyActivityItem } from "@/modules/company-dashboard/types/dashboard.types"
import { cn } from "@/lib/utils"

function activityMeta(item: CompanyActivityItem) {
  const status = (item.status ?? item.tone) as string

  if (status === "completed" || item.tone === "completed" || item.tone === "success") {
    return {
      title: item.target || "Inspection completed",
      status: "completed" as StatusVariant,
      type: "completed" as const,
      description: `${item.actor} completed the inspection.`,
      iconClass: "bg-[#e6f7ee] text-[#2f9e6a]",
    }
  }
  if (status === "review_required" || item.tone === "pending" || item.tone === "warning") {
    return {
      title: item.target || "Pending review",
      status: "pending" as StatusVariant,
      type: "pending" as const,
      description: `${item.actor} submitted this job for review.`,
      iconClass: "bg-amber-50 text-amber-700",
    }
  }
  if (item.tone === "cancelled") {
    return {
      title: item.target || "Job cancelled",
      status: "cancelled" as StatusVariant,
      type: "cancelled" as const,
      description: `${item.actor} cancelled this job.`,
      iconClass: "bg-red-50 text-red-600",
    }
  }
  if (item.tone === "draft") {
    return {
      title: item.target || "Draft created",
      status: "draft" as StatusVariant,
      type: "draft" as const,
      description: `${item.actor} created a new draft.`,
      iconClass: "bg-primary-tint text-primary",
    }
  }

  return {
    title: item.target || "Job updated",
    status: "in_progress" as StatusVariant,
    type: "updated" as const,
    description: `${item.actor} ${item.action}.`,
    iconClass: "bg-primary-tint-strong/40 text-primary-dark",
  }
}

export function DashboardActivityFeed({
  items,
}: {
  items: CompanyActivityItem[]
}) {
  return (
    <Card className="gap-0 rounded-xl border border-[#e4e9eb] bg-white py-0 shadow-[0_1px_2px_rgba(15,40,46,0.04)]">
      <div className="flex flex-col gap-3 border-b border-[#eef1f2] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-primary-dark">
            Recent live activity
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Latest job and report updates across your company
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg border-[#d7e0e3]"
          nativeButton={false}
          render={<Link href={ROUTES.company.jobs} />}
        >
          View all
          <ArrowUpRightIcon data-icon="inline-end" className="size-3.5" />
        </Button>
      </div>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ClipboardListIcon}
              icon3d="clipboard"
              title="No activity yet"
              description="When your team updates jobs or submits reports, updates will appear here."
              action={
                <Button
                  size="sm"
                  className="rounded-lg"
                  nativeButton={false}
                  render={<Link href={ROUTES.company.jobs} />}
                >
                  Go to jobs
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-[#eef1f2]">
            {items.slice(0, 6).map((item) => {
              const meta = activityMeta(item)
              return (
                <li
                  key={item.id}
                  className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-[#fafbfb] sm:px-6"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                      meta.iconClass,
                    )}
                  >
                    <ClipboardListIcon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={ROUTES.company.job(item.id)}
                        className="truncate text-sm font-semibold text-primary-dark hover:underline"
                      >
                        {meta.title}
                      </Link>
                      <StatusBadge status={meta.status} withDot={false} />
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {meta.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-[11px] whitespace-nowrap text-muted-foreground">
                      {item.time}
                    </span>
                    <MoreHorizontalIcon className="size-4 text-muted-foreground/50" aria-hidden />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
