import type { UserStatus } from "@/types/role"

export type StaffMember = {
  id: string
  name: string
  email: string
  role: "inspector"
  status: UserStatus
  jobsTotal: number
}

export type StaffInput = {
  name: string
  email: string
  password: string
}
