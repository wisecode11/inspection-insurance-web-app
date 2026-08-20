export type CompanyDashboardOverview = {
  totalJobs: number
  activeJobs: number
  completedJobs: number
  pendingReviews: number
  totalInspectors: number
  activeInspectors: number
  reportsSubmitted: number
  reportsApproved: number
  avgJobCompletionTime: string
  avgJobCompletionHours: number
}

export type CompanyActivityItem = {
  id: string
  actor: string
  action: string
  target: string
  time: string
  tone: "success" | "warning" | "neutral" | string
  status?: string
}

export type CompanyDashboardData = {
  greetingName: string
  companyName: string
  overview: CompanyDashboardOverview
  recentActivity: CompanyActivityItem[]
}
