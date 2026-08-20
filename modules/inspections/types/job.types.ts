import type { StatusVariant } from "@/components/shared/status-badge"

export type JobStatus =
  | "draft"
  | "assigned"
  | "in_progress"
  | "submitted"
  | "reviewed"
  | "completed"
  | "rejected"
  | "reopened"
  | "on_hold"
  // legacy API values (normalized by backend)
  | "accepted"
  | "review_required"
  | "report_generated"
  | "archived"
  | "cancelled"
  | "scheduled"
  | "pending_sync"

export type JobPriority = "low" | "normal" | "high" | "urgent"

export type JobClaim = {
  insuranceCompany?: string
  policyNumber?: string
  claimNumber?: string
  dateOfLoss?: string | null
  status?: string
}

export type JobAttachment = {
  name: string
  url: string
  mimeType?: string
  size?: number
  uploadedAt?: string | null
}

export type JobRow = {
  id: string
  jobNumber: string
  title: string
  priority: JobPriority | string
  status: JobStatus
  inspector: string
  assignedTo: string | null
  customerName: string
  addressLine: string
  city: string
  notes: string
  dueDate?: string | null
  createdAt: string
  submittedAt?: string | null
  reviewedAt?: string | null
  completedAt?: string | null
  startedAt?: string | null
  claim?: JobClaim
  attachments?: JobAttachment[]
  customer?: {
    id?: string
    name?: string
    email?: string
    phone?: string
  } | null
  address?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
}

export type JobDetail = JobRow & {
  inspection?: {
    id: string
    status: string
    summary?: {
      overallNotes?: string
      recommendedAction?: string
      estimatedDamageSeverity?: string
    }
    startedAt?: string | null
    completedAt?: string | null
    submittedAt?: string | null
  } | null
  photos?: Array<{
    id: string
    subjectType?: string
    status?: string
    caption?: string
    url?: string
    createdAt?: string
  }>
  reports?: Array<{
    id: string
    status: string
    version: number
    title: string
    narrative: string
    warnings: string[]
    generatedAt?: string | null
    pdfUrl?: string
  }>
  progress?: {
    notStarted: boolean
    inProgress: boolean
    review: boolean
    completed: boolean
  }
}

export type JobInput = {
  title: string
  priority?: JobPriority
  dueDate?: string | null
  customer: {
    name: string
    email: string
    phone: string
  }
  address: {
    line1: string
    city: string
    state: string
    postalCode: string
    country?: string
  }
  claim: {
    insuranceCompany: string
    policyNumber: string
    claimNumber: string
    dateOfLoss: string
  }
  notes?: string
  attachments?: JobAttachment[]
  inspectorId?: string
}

export const JOB_STATUS_OPTIONS: Array<{ value: JobStatus; label: string }> = [
  { value: "draft", label: "Unassigned" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In progress" },
  { value: "submitted", label: "Submitted" },
  { value: "reviewed", label: "Reviewed" },
  { value: "completed", label: "Complete" },
  { value: "rejected", label: "Rejected" },
  { value: "reopened", label: "Reopened" },
  { value: "on_hold", label: "On hold" },
]

export const JOB_PRIORITY_OPTIONS: Array<{ value: JobPriority; label: string }> = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

export function jobStatusLabel(status: JobStatus) {
  return JOB_STATUS_OPTIONS.find((item) => item.value === status)?.label
    || status.replaceAll("_", " ")
}

export function jobStatusVariant(status: JobStatus): StatusVariant {
  if (status === "draft") return "draft"
  if (status === "assigned" || status === "scheduled" || status === "accepted") return "scheduled"
  if (status === "in_progress" || status === "pending_sync" || status === "reopened") return "in_progress"
  if (status === "submitted" || status === "review_required") return "submitted"
  if (status === "reviewed") return "pending"
  if (status === "completed" || status === "report_generated" || status === "archived") return "completed"
  if (status === "on_hold") return "pending"
  if (status === "rejected" || status === "cancelled") return "cancelled"
  return "pending"
}

/** Admin forward / optional transitions. */
export function nextJobStatuses(status: JobStatus): JobStatus[] {
  switch (status) {
    case "draft":
      return ["assigned", "on_hold"]
    case "assigned":
    case "scheduled":
    case "accepted":
      return ["in_progress", "on_hold", "rejected"]
    case "in_progress":
    case "pending_sync":
      return ["submitted", "on_hold", "rejected"]
    case "submitted":
    case "review_required":
      return ["reviewed", "in_progress", "rejected"]
    case "reviewed":
      return ["completed", "rejected", "in_progress"]
    case "completed":
    case "report_generated":
    case "archived":
      return ["reopened"]
    case "rejected":
    case "cancelled":
      return ["reopened"]
    case "reopened":
      return ["assigned", "in_progress", "on_hold"]
    case "on_hold":
      return ["assigned", "in_progress", "rejected"]
    default:
      return []
  }
}
