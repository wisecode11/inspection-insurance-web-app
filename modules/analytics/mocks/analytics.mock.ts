import { listStaffMock } from "@/modules/staff/mocks/staff.mock"
import type { CompanyAnalytics } from "@/modules/analytics/types/analytics.types"

export function getCompanyAnalyticsMock(): CompanyAnalytics {
  return {
    inspectionVolume: [
      { month: "Mar", inspections: 38 },
      { month: "Apr", inspections: 44 },
      { month: "May", inspections: 51 },
      { month: "Jun", inspections: 47 },
      { month: "Jul", inspections: 58 },
      { month: "Aug", inspections: 64 },
    ],
    claimBreakdown: [
      { name: "Approved", value: 142, key: "approved" },
      { name: "Pending", value: 63, key: "pending" },
      { name: "Submitted", value: 41, key: "submitted" },
      { name: "Draft", value: 22, key: "draft" },
      { name: "Failed", value: 9, key: "failed" },
    ],
    cycleTimeTrend: [
      { month: "Mar", days: 3.4 },
      { month: "Apr", days: 3.1 },
      { month: "May", days: 2.9 },
      { month: "Jun", days: 2.7 },
      { month: "Jul", days: 2.5 },
      { month: "Aug", days: 2.3 },
    ],
    staffProductivity: listStaffMock()
      .filter((s) => s.jobsTotal > 0)
      .map((s) => ({ name: s.name, jobs: s.jobsTotal, cycle: s.avgCycleDays }))
      .sort((a, b) => b.jobs - a.jobs),
  }
}
