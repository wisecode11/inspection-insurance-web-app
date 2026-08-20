import type { CompanyAnalytics } from "@/modules/analytics/types/analytics.types"

/** Offline fallback only — live data comes from GET /analytics/company. */
export function getCompanyAnalyticsMock(): CompanyAnalytics {
  return {
    jobs: {
      total: 0,
      byStatus: [],
      avgCompletionHours: 0,
      avgCompletionLabel: "—",
      monthly: [],
    },
    inspectors: [],
    reports: {
      approved: 0,
      rejected: 0,
      avgReviewHours: 0,
      avgReviewLabel: "—",
    },
  }
}
