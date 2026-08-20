import { cn } from "@/lib/utils"

type Tone = "success" | "danger" | "warning" | "info" | "neutral"

export type StatusVariant =
  | "active"
  | "suspended"
  | "trial"
  | "draft"
  | "submitted"
  | "approved"
  | "verified"
  | "mismatch"
  | "pending"
  | "failed"
  | "synced"
  | "critical"
  | "paid"
  | "past_due"
  | "canceled"
  | "open"
  | "resolved"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"

const toneMap: Record<StatusVariant, { tone: Tone; label: string }> = {
  active: { tone: "success", label: "Active" },
  approved: { tone: "success", label: "Approved" },
  verified: { tone: "success", label: "Verified" },
  synced: { tone: "success", label: "Synced" },
  paid: { tone: "success", label: "Paid" },
  resolved: { tone: "success", label: "Resolved" },
  suspended: { tone: "danger", label: "Suspended" },
  failed: { tone: "danger", label: "Failed" },
  critical: { tone: "danger", label: "Critical" },
  past_due: { tone: "danger", label: "Past due" },
  mismatch: { tone: "warning", label: "Mismatch" },
  pending: { tone: "warning", label: "Pending" },
  scheduled: { tone: "warning", label: "Scheduled" },
  in_progress: { tone: "info", label: "In progress" },
  completed: { tone: "success", label: "Completed" },
  cancelled: { tone: "neutral", label: "Cancelled" },
  trial: { tone: "info", label: "Trial" },
  submitted: { tone: "info", label: "Submitted" },
  open: { tone: "info", label: "Open" },
  draft: { tone: "neutral", label: "Draft" },
  canceled: { tone: "neutral", label: "Canceled" },
}

const toneClasses: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/20",
  danger: "bg-danger/12 text-danger border-danger/20",
  warning: "bg-warning/14 text-warning border-warning/25",
  info: "bg-brand/12 text-brand border-brand/20 dark:text-primary",
  neutral: "bg-muted text-muted-foreground border-border",
}

const dotClasses: Record<Tone, string> = {
  success: "bg-success",
  danger: "bg-danger",
  warning: "bg-warning",
  info: "bg-brand dark:bg-primary",
  neutral: "bg-muted-foreground",
}

export function StatusBadge({
  status,
  label,
  className,
  withDot = true,
}: {
  status: StatusVariant
  label?: string
  className?: string
  withDot?: boolean
}) {
  const config = toneMap[status]
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClasses[config.tone],
        className,
      )}
    >
      {withDot && (
        <span className={cn("size-1.5 shrink-0 rounded-full", dotClasses[config.tone])} />
      )}
      {label ?? config.label}
    </span>
  )
}
