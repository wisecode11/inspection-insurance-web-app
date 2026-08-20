import type { StaffMember } from "@/modules/staff/types/staff.types"

let staff: StaffMember[] = [
  { id: "s-1", name: "Marta Flynn", email: "marta@summitridge.co", role: "inspector", status: "active", jobsTotal: 128 },
  { id: "s-2", name: "Devon Ross", email: "devon@summitridge.co", role: "inspector", status: "active", jobsTotal: 94 },
  { id: "s-3", name: "Priya Shah", email: "priya@summitridge.co", role: "inspector", status: "active", jobsTotal: 87 },
  { id: "s-4", name: "Leo Martin", email: "leo@summitridge.co", role: "inspector", status: "active", jobsTotal: 61 },
]

const cycleDays: Record<string, number> = {
  "s-1": 2.1,
  "s-2": 2.6,
  "s-3": 2.3,
  "s-4": 3.0,
}

export function listStaffMock(): Array<StaffMember & { avgCycleDays: number }> {
  return staff.map((row) => ({ ...row, avgCycleDays: cycleDays[row.id] ?? 0 }))
}
