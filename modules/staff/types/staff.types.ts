export type StaffMember = {
  id: string
  name: string
  email: string
  role: "Lead inspector" | "Inspector" | "Reviewer"
  status: "active" | "pending" | "suspended"
  jobsCompleted: number
  avgCycleDays: number
}

export type StaffInput = {
  name: string
  email: string
  role: StaffMember["role"]
}
