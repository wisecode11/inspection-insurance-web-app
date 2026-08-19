import type { StaffInput, StaffMember } from "@/modules/staff/types/staff.types"

let staff: StaffMember[] = [
  { id: "s-1", name: "Marta Flynn", email: "marta@summitridge.co", role: "Lead inspector", status: "active", jobsCompleted: 128, avgCycleDays: 2.1 },
  { id: "s-2", name: "Devon Ross", email: "devon@summitridge.co", role: "Inspector", status: "active", jobsCompleted: 94, avgCycleDays: 2.6 },
  { id: "s-3", name: "Priya Shah", email: "priya@summitridge.co", role: "Inspector", status: "active", jobsCompleted: 87, avgCycleDays: 2.3 },
  { id: "s-4", name: "Leo Martin", email: "leo@summitridge.co", role: "Inspector", status: "active", jobsCompleted: 61, avgCycleDays: 3.0 },
  { id: "s-5", name: "Nina Whit", email: "nina@summitridge.co", role: "Reviewer", status: "active", jobsCompleted: 0, avgCycleDays: 0 },
  { id: "s-6", name: "Omar Reyes", email: "omar@summitridge.co", role: "Inspector", status: "pending", jobsCompleted: 0, avgCycleDays: 0 },
  { id: "s-7", name: "Bea Carlton", email: "bea@summitridge.co", role: "Inspector", status: "suspended", jobsCompleted: 39, avgCycleDays: 3.4 },
]

export function listStaffMock(): StaffMember[] {
  return staff.map((row) => ({ ...row }))
}

export function createStaffMock(input: StaffInput): StaffMember {
  const member: StaffMember = {
    id: `s-${Date.now()}`,
    name: input.name,
    email: input.email,
    role: input.role,
    status: "pending",
    jobsCompleted: 0,
    avgCycleDays: 0,
  }
  staff = [member, ...staff]
  return { ...member }
}

export function updateStaffMock(id: string, input: StaffInput): StaffMember | undefined {
  staff = staff.map((row) => (row.id === id ? { ...row, ...input } : row))
  return staff.find((row) => row.id === id)
}

export function disableStaffMock(id: string): StaffMember | undefined {
  staff = staff.map((row) => (row.id === id ? { ...row, status: "suspended" } : row))
  return staff.find((row) => row.id === id)
}
