"use client"

import * as React from "react"
import {
  ArrowUpIcon,
  CalendarIcon,
  ChevronRightIcon,
  FlameIcon,
  MapPinIcon,
  PaperclipIcon,
} from "lucide-react"

import {
  AvatarInitials,
  GridCard,
  GridCardActions,
  GridCardFact,
  GridCardFacts,
} from "@/components/shared/grid-card"
import { StatusBadge, type StatusVariant } from "@/components/shared/status-badge"
import { cn } from "@/lib/utils"
import {
  jobStatusLabel,
  jobStatusVariant,
  type JobRow,
} from "@/modules/inspections/types/job.types"

/** Top accent bar colour, matching the status badge tone. */
const accentClasses: Partial<Record<StatusVariant, string>> = {
  draft: "bg-muted-foreground/40",
  scheduled: "bg-warning",
  pending: "bg-warning",
  in_progress: "bg-primary",
  submitted: "bg-primary",
  completed: "bg-success",
  cancelled: "bg-muted-foreground/40",
}

const TERMINAL_STATUSES = ["completed", "report_generated", "archived", "cancelled", "rejected"]

const DAY_MS = 24 * 60 * 60 * 1000

type DueTone = "none" | "muted" | "soon" | "overdue"

function dueInfo(row: JobRow): { label: string; title?: string; tone: DueTone } {
  if (!row.dueDate) return { label: "No due date", tone: "none" }
  const date = new Date(row.dueDate)
  if (Number.isNaN(date.getTime())) return { label: row.dueDate, tone: "muted" }

  const full = date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  if (TERMINAL_STATUSES.includes(row.status)) return { label: full, tone: "muted" }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(date)
  due.setHours(0, 0, 0, 0)
  const days = Math.round((due.getTime() - today.getTime()) / DAY_MS)

  if (days < 0) {
    return { label: `Overdue ${-days}d`, title: `Was due ${full}`, tone: "overdue" }
  }
  if (days === 0) return { label: "Due today", title: full, tone: "soon" }
  if (days === 1) return { label: "Due tomorrow", title: full, tone: "soon" }
  if (days <= 14) return { label: `Due in ${days} days`, title: full, tone: days <= 3 ? "soon" : "muted" }
  return { label: full, tone: "muted" }
}

const dueClasses: Record<DueTone, string> = {
  none: "bg-transparent text-muted-foreground/70",
  muted: "bg-primary-tint/70 text-muted-foreground",
  soon: "bg-warning/14 text-warning",
  overdue: "bg-danger/12 text-danger",
}

function PriorityFlag({ priority }: { priority: string }) {
  if (priority === "urgent") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-danger/12 px-2 py-0.5 text-xs font-semibold text-danger">
        <FlameIcon className="size-3" aria-hidden />
        Urgent
      </span>
    )
  }
  if (priority === "high") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning/14 px-2 py-0.5 text-xs font-semibold text-warning">
        <ArrowUpIcon className="size-3" aria-hidden />
        High
      </span>
    )
  }
  return null
}

export function JobCard({
  row,
  selected,
  onToggleSelect,
  onOpen,
  actions,
}: {
  row: JobRow
  selected: boolean
  onToggleSelect: () => void
  onOpen: () => void
  actions: React.ReactNode
}) {
  const variant = jobStatusVariant(row.status)
  // Rejected shares the neutral "cancelled" badge variant but gets a red accent.
  const accent = row.status === "rejected" ? "bg-danger" : accentClasses[variant] ?? "bg-primary"
  const priority = String(row.priority || "normal")
  const due = dueInfo(row)
  // addressLine already carries city/state; fall back to city only when it is empty.
  const address = row.addressLine || row.city
  const assigned = Boolean(row.assignedTo) && Boolean(row.inspector)
  const attachmentCount = row.attachments?.length ?? 0

  return (
    <GridCard
      accent={accent}
      onOpen={onOpen}
      selected={selected}
      label={`${row.jobNumber} ${row.title || "Untitled"}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-foreground/[0.05] px-1.5 py-0.5 font-mono text-[0.7rem] font-semibold tracking-wide text-muted-foreground">
            {row.jobNumber}
          </span>
          <StatusBadge status={variant} label={jobStatusLabel(row.status)} className="rounded-full" />
          <PriorityFlag priority={priority} />
        </div>
        <GridCardActions>
          <label
            className={cn(
              "flex size-7 cursor-pointer items-center justify-center rounded-md transition-opacity hover:bg-primary-tint",
              selected
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100",
            )}
          >
            <input
              type="checkbox"
              aria-label={`Select job ${row.jobNumber}`}
              checked={selected}
              onChange={onToggleSelect}
              className="size-4 cursor-pointer accent-[var(--color-primary)]"
            />
          </label>
          {actions}
        </GridCardActions>
      </header>

      <div className="flex flex-col gap-1.5">
        <h3 className="line-clamp-1 text-base font-semibold tracking-tight text-foreground" title={row.title}>
          {row.title || "Untitled job"}
        </h3>
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
          <span className="line-clamp-2 min-w-0 break-words" title={address}>
            {address || "No address"}
          </span>
        </p>
      </div>

      <GridCardFacts>
        <GridCardFact label="Homeowner" value={row.customerName || "—"} />
        <GridCardFact
          label="Claim"
          value={row.claim?.claimNumber || "—"}
          sub={row.claim?.insuranceCompany || undefined}
        />
      </GridCardFacts>

      <footer className="mt-auto flex items-center justify-between gap-3">
        {assigned ? (
          <div className="flex min-w-0 items-center gap-2.5">
            <AvatarInitials name={row.inspector} />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-medium capitalize">{row.inspector}</span>
              <span className="text-xs text-muted-foreground">Inspector</span>
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-warning/60 text-xs font-semibold text-warning">
              ?
            </span>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="text-sm font-medium text-warning">Unassigned</span>
              <span className="text-xs text-muted-foreground">Needs inspector</span>
            </div>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2">
          {attachmentCount ? (
            <span
              className="inline-flex items-center gap-0.5 text-xs text-muted-foreground"
              title={`${attachmentCount} attachment${attachmentCount === 1 ? "" : "s"}`}
            >
              <PaperclipIcon className="size-3.5" aria-hidden />
              {attachmentCount}
            </span>
          ) : null}
          <span
            title={due.title}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums",
              dueClasses[due.tone],
            )}
          >
            <CalendarIcon className="size-3.5" aria-hidden />
            {due.label}
          </span>
          <ChevronRightIcon
            className="size-4 -translate-x-1 text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
            aria-hidden
          />
        </div>
      </footer>
    </GridCard>
  )
}
