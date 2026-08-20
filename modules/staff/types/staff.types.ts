import type { UserStatus } from "@/types/role"

export type StaffMember = {
  id: string
  name: string
  email: string
  role: "inspector" | "office_staff" | "company_admin"
  status: UserStatus
  jobsAssigned: number
  jobsCompleted: number
  reportsSubmitted: number
  jobsTotal: number
  productivity?: {
    completionRate: number
    avgJobsPerWeek: number
  }
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
  }
}

export type StaffInput = {
  name: string
  email: string
  password: string
  phone?: string
}

export type InspectorHistoryItem = {
  id: string
  jobNumber: string
  title?: string
  status: string
  customerName: string
  addressLine: string
  claimNumber?: string
  completedAt?: string | null
  createdAt: string
}
