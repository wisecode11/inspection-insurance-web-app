import type { StatusVariant } from "@/components/shared/status-badge"

export type JobStatus =
  | "draft"
  | "scheduled"
  | "in_progress"
  | "pending_sync"
  | "completed"
  | "submitted"
  | "cancelled"

export type JobRow = {
  id: string
  jobNumber: string
  status: JobStatus
  inspector: string
  assignedTo: string | null
  customerName: string
  addressLine: string
  city: string
  notes: string
  createdAt: string
}

export type JobInput = {
  customer: {
    name: string
    email?: string
    phone?: string
  }
  address: {
    line1: string
    city: string
    state?: string
    postalCode?: string
    country?: string
  }
  notes?: string
  inspectorId?: string
}

export function jobStatusVariant(status: JobStatus): StatusVariant {
  if (status === "pending_sync") return "pending"
  if (status === "submitted") return "submitted"
  if (status === "draft") return "draft"
  if (status === "scheduled") return "scheduled"
  if (status === "in_progress") return "in_progress"
  if (status === "completed") return "completed"
  if (status === "cancelled") return "cancelled"
  return "pending"
}
