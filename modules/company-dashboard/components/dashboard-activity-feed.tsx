import Link from "next/link"
import { ArrowUpRightIcon, ClipboardListIcon, FileTextIcon } from "lucide-react"

import { ActivityTimeline } from "@/components/shared/activity-timeline"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge, type StatusVariant } from "@/components/shared/status-badge"
import { ROUTES } from "@/lib/constants/routes"
import type { CompanyActivityItem } from "@/modules/company-dashboard/types/dashboard.types"

function activityMeta(item: CompanyActivityItem) {
  const status = (item.status ?? item.tone) as string

  if (status === "completed" || item.tone === "completed") {
    return {
      title: "Inspection completed",
      status: "completed" as StatusVariant,
      type: "completed" as const,
      description: `${item.actor} completed the inspection.`,
    }
  }
  if (status === "review_required" || item.tone === "pending") {
    return {
      title: "Pending review",
      status: "pending" as StatusVariant,
      type: "pending" as const,
      description: `${item.actor} submitted this job for review.`,
    }
  }
  if (item.tone === "cancelled") {
    return {
      title: "Job cancelled",
      status: "cancelled" as StatusVariant,
      type: "cancelled" as const,
      description: `${item.actor} cancelled this job.`,
    }
  }
  if (item.tone === "draft") {
    return {
      title: "Draft created",
      status: "draft" as StatusVariant,
      type: "draft" as const,
      description: `${item.actor} created a new draft.`,
    }
  }

  return {
    title: "Job updated",
    status: "in_progress" as StatusVariant,
    type: "updated" as const,
    description: `${item.actor} ${item.action}.`,
  }
}

export function DashboardActivityFeed({
  items,
}: {
  items: CompanyActivityItem[]
}) {
  return (
    <Card className="gap-0 rounded-lg border-0 bg-card py-0 shadow-[0_16px_40px_-20px_rgba(26,46,40,0.22)] ring-1 ring-black/5">
      <div className="flex flex-col gap-3 border-b border-border/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">Recent activity</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Latest job updates across your company
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-md"
          nativeButton={false}
          render={<Link href={ROUTES.company.jobs} />}
        >
          View all jobs
          <ArrowUpRightIcon data-icon="inline-end" className="size-3.5" />
        </Button>
      </div>
      <CardContent className="p-4 sm:p-6">
        {items.length === 0 ? (
          <EmptyState
            icon={ClipboardListIcon}
            title="No activity yet"
            description="When your team updates jobs or submits reports, updates will appear here."
            action={
              <Button
                size="sm"
                className="rounded-md"
                nativeButton={false}
                render={<Link href={ROUTES.company.jobs} />}
              >
                Go to jobs
              </Button>
            }
          />
        ) : (
          <ActivityTimeline
            items={items.map((item) => {
              const meta = activityMeta(item)
              const showReportAction =
                item.tone === "completed" || item.status === "completed"

              return {
                id: item.id,
                title: meta.title,
                description: meta.description,
                time: item.time,
                type: meta.type,
                meta: (
                  <>
                    <Link
                      href={ROUTES.company.job(item.id)}
                      className="rounded-md bg-primary-tint px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary-tint-strong"
                    >
                      {item.target}
                    </Link>
                    <StatusBadge status={meta.status} withDot={false} />
                  </>
                ),
                action: showReportAction ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 h-8 w-fit rounded-md"
                    nativeButton={false}
                    render={<Link href={ROUTES.company.job(item.id)} />}
                  >
                    <FileTextIcon data-icon="inline-start" className="size-3.5" />
                    View report
                  </Button>
                ) : undefined,
              }
            })}
          />
        )}
      </CardContent>
    </Card>
  )
}
