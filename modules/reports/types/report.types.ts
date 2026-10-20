import type { StatusVariant } from "@/components/shared/status-badge"

export type ReportStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"

export type ReportPdfStatus = "queued" | "generating" | "ready" | "failed" | string

export type CompanyReport = {
  id: string
  jobId: string
  status: ReportStatus | string
  pdfStatus?: ReportPdfStatus
  version: number
  title: string
  narrative: string
  warnings: string[]
  reviewNotes?: string
  rejectionReason?: string
  changesRequested?: string
  reviewedAt?: string | null
  submittedAt?: string | null
  pdfUrl?: string
  /** "inspector_mobile" (evidence package) or "server_summary". */
  pdfSource?: string
  /** Earlier PDFs kept for this report; see the PDF history page. */
  pdfHistoryCount?: number
  generatedAt?: string | null
  jobNumber?: string
  jobTitle?: string
  claimNumber?: string
  propertyAddress?: string
  inspectorName?: string
  inspectorId?: string | null
  customerName?: string
  createdAt?: string
  updatedAt?: string
  job?: {
    id: string
    jobNumber: string
    title?: string
    status?: string
  } | null
}

export const REPORT_STATUS_OPTIONS: Array<{ value: ReportStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

/** Statuses visible on the company admin Reports tab (inspector must submit first). */
export const ADMIN_REPORT_STATUS_OPTIONS: Array<{ value: ReportStatus; label: string }> = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

export function reportStatusLabel(status: string) {
  return REPORT_STATUS_OPTIONS.find((item) => item.value === status)?.label
    || status.replaceAll("_", " ")
}

export function reportStatusVariant(status: string): StatusVariant {
  if (status === "draft") return "draft"
  if (status === "submitted") return "submitted"
  if (status === "under_review") return "pending"
  if (status === "approved") return "approved"
  if (status === "rejected") return "cancelled"
  return "pending"
}

/** One stored PDF of a report. Versions are 1-based and never overwritten. */
export type ReportPdfVersion = {
  version: number
  isCurrent: boolean
  source: "inspector_mobile" | "server_summary" | string
  fileName: string
  sizeBytes: number
  checksum: string
  storedAt?: string | null
  replacedAt?: string | null
}
