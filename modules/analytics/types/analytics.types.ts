export type JobStatusSlice = {
  status: string
  label: string
  count: number
}

export type MonthlyTrendPoint = {
  month: string
  monthKey?: string
  total: number
  completed: number
  /** Alias used by bar chart (completed jobs). */
  inspections: number
}

export type InspectorAnalyticsRow = {
  id: string
  name: string
  assigned: number
  completed: number
  reportsSubmitted: number
  completionRate: number
  rank: number
}

export type CompanyAnalytics = {
  jobs: {
    total: number
    byStatus: JobStatusSlice[]
    avgCompletionHours: number
    avgCompletionLabel: string
    monthly: MonthlyTrendPoint[]
  }
  inspectors: InspectorAnalyticsRow[]
  reports: {
    approved: number
    rejected: number
    avgReviewHours: number
    avgReviewLabel: string
  }
}

/** @deprecated chart helpers still accept these shapes */
export type MonthVolume = { month: string; inspections: number }
export type ClaimSlice = { name: string; value: number; key: string }
export type CyclePoint = { month: string; days: number }
export type ProductivityRow = {
  name: string
  jobs: number
  cycle: number
  assigned?: number
  reportsSubmitted?: number
  completionRate?: number
  rank?: number
}
