"use client"

import * as React from "react"
import { ArrowUpIcon, CalendarIcon, FlameIcon, MapPinIcon, PaperclipIcon } from "lucide-react"

import { GridCardActions, initialsOf } from "@/components/shared/grid-card"
import {
  CodeChip,
  FactBox,
  LIST_TONES,
  ListCard,
  ListCardFooter,
  SquareAvatar,
  StatusPill,
  type ListTone,
} from "@/components/shared/list-card"
import { cn } from "@/lib/utils"
import { jobStatusLabel, type JobRow, type JobStatus } from "@/modules/inspections/types/job.types"

/* ---------- Status tone: accent bar, pill and progress segments ---------- */

/** Lifecycle: unassigned → assigned → in progress → submitted (4 steps). */
function toneFor(status: JobStatus): ListTone & { steps: number } {
  switch (status) {
    case "draft":
      return { ...LIST_TONES.gray, steps: 1 }
    case "assigned":
    case "scheduled":
    case "accepted":
      return { ...LIST_TONES.amber, steps: 2 }
    case "on_hold":
      return { ...LIST_TONES.gray, steps: 2 }
    case "in_progress":
    case "pending_sync":
    case "reopened":
      return { ...LIST_TONES.blue, steps: 3 }
    case "submitted":
    case "review_required":
      return { ...LIST_TONES.green, steps: 4 }
    case "reviewed":
      return { ...LIST_TONES.teal, steps: 4 }
    case "completed":
    case "report_generated":
    case "archived":
      return { ...LIST_TONES.forest, steps: 4 }
    case "rejected":
    case "cancelled":
      return { ...LIST_TONES.red, steps: 1 }
    default:
      return { ...LIST_TONES.gray, steps: 1 }
  }
}

/* ---------- Due date ---------- */

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

  if (days < 0) return { label: `Overdue ${-days}d`, title: `Was due ${full}`, tone: "overdue" }
  if (days === 0) return { label: "Due today", title: full, tone: "soon" }
  if (days === 1) return { label: "Due tomorrow", title: full, tone: "soon" }
  if (days <= 14) return { label: `Due in ${days} days`, title: full, tone: days <= 3 ? "soon" : "muted" }
  return { label: full, tone: "muted" }
}

const dueClasses: Record<DueTone, string> = {
  none: "text-muted-foreground",
  muted: "text-muted-foreground",
  soon: "rounded-lg border border-[#F5D9A8] bg-[#FFF4E2] px-2.5 py-1 text-[#C2700A] dark:border-[#D9820F]/40 dark:bg-[#D9820F]/18 dark:text-[#FBBF24]",
  overdue: "rounded-lg border border-[#F6C9C9] bg-[#FDECEC] px-2.5 py-1 font-semibold text-[#DC2626] dark:border-[#DC2626]/40 dark:bg-[#DC2626]/20 dark:text-[#FCA5A5]",
}

function PriorityFlag({ priority }: { priority: string }) {
  if (priority === "urgent") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#DC2626] px-2.5 py-[3px] text-xs font-semibold text-white shadow-[0_4px_10px_-4px_rgba(220,38,38,0.6)]">
        <FlameIcon className="size-3" aria-hidden />
        Urgent
      </span>
    )
  }
  if (priority === "high") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF4E2] px-2.5 py-[3px] text-xs font-semibold text-[#C2700A] dark:bg-[#D9820F]/18 dark:text-[#FBBF24]">
        <ArrowUpIcon className="size-3" aria-hidden />
        High
      </span>
    )
  }
  return null
}

/** "Hail inspection - Harper Scott" → muted separator between the two halves. */
function JobTitle({ title }: { title: string }) {
  const [lead, ...rest] = title.split(" - ")
  if (!rest.length) return <>{title}</>
  return (
    <>
      {lead}
      <span className="mx-1 font-normal text-muted-foreground">-</span>
      {rest.join(" - ")}
    </>
  )
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
  const tone = toneFor(row.status)
  const priority = String(row.priority || "normal")
  const due = dueInfo(row)
  // addressLine already carries city/state; fall back to city only when it is empty.
  const address = row.addressLine || row.city
  const assigned = Boolean(row.assignedTo) && Boolean(row.inspector)
  const attachmentCount = row.attachments?.length ?? 0
  const title = row.title || "Untitled job"

  return (
    <ListCard accent={tone.bar} onOpen={onOpen} selected={selected} label={`${row.jobNumber} ${title}`}>
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <CodeChip>{row.jobNumber}</CodeChip>
          <StatusPill tone={tone}>{jobStatusLabel(row.status)}</StatusPill>
          <PriorityFlag priority={priority} />
          <span className="ml-1 inline-flex items-center gap-1" role="img" aria-label={`Progress ${tone.steps} of 4`}>
            {Array.from({ length: 4 }, (_, i) => (
              <i key={i} className={cn("h-[3px] w-4 rounded-full", i < tone.steps ? tone.bar : "bg-border")} />
            ))}
          </span>
        </div>
        <GridCardActions className="mt-0 -mr-1.5">
          <label
            className={cn(
              "flex size-7 cursor-pointer items-center justify-center rounded-md transition-opacity hover:bg-primary/10",
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
              className="size-4 cursor-pointer accent-[#1FB86A]"
            />
          </label>
          {actions}
        </GridCardActions>
      </header>

      <h3 className="mt-3 line-clamp-1 text-base font-bold tracking-[-0.02em] text-foreground" title={title}>
        <JobTitle title={title} />
      </h3>
      <p className="mt-1 flex min-h-[2.5rem] items-start gap-1.5 text-[13px] leading-[1.5] text-muted-foreground">
        <MapPinIcon className="mt-[3px] size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="line-clamp-2 min-w-0 break-words" title={address}>
          {address || "No address"}
        </span>
      </p>

      <dl className="mt-3 grid grid-cols-2 gap-2">
        <FactBox label="Homeowner" value={row.customerName || "—"} />
        <FactBox
          label="Claim"
          value={row.claim?.claimNumber || "—"}
          sub={row.claim?.insuranceCompany || undefined}
          mono
        />
      </dl>

      <ListCardFooter>
        {assigned ? (
          <div className="flex min-w-0 items-center gap-3">
            <SquareAvatar initials={initialsOf(row.inspector)} />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold text-foreground capitalize">{row.inspector}</span>
              <span className="text-xs text-muted-foreground">Inspector</span>
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-3">
            <SquareAvatar
              initials="?"
              className="border border-dashed border-[#E9B866] bg-[#FFF8EC] text-xs text-[#D9820F] dark:border-[#D9820F]/45 dark:bg-[#D9820F]/18 dark:text-[#FBBF24]"
            />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="text-sm font-semibold text-[#D9820F] dark:text-[#FBBF24]">Unassigned</span>
              <span className="text-xs text-muted-foreground">Needs inspector</span>
            </div>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2.5">
          {attachmentCount ? (
            <span
              className="inline-flex items-center gap-0.5 text-[13px] text-muted-foreground"
              title={`${attachmentCount} attachment${attachmentCount === 1 ? "" : "s"}`}
            >
              <PaperclipIcon className="size-3.5" aria-hidden />
              {attachmentCount}
            </span>
          ) : null}
          <span
            title={due.title}
            className={cn("inline-flex items-center gap-1.5 text-[13px] tabular-nums", dueClasses[due.tone])}
          >
            <CalendarIcon className="size-3.5" aria-hidden />
            {due.label}
          </span>
        </div>
      </ListCardFooter>
    </ListCard>
  )
}
