export type MonthVolume = {
  month: string
  inspections: number
}

export type ClaimSlice = {
  name: string
  value: number
  key: string
}

export type CyclePoint = {
  month: string
  days: number
}

export type ProductivityRow = {
  name: string
  jobs: number
  cycle: number
}

export type CompanyAnalytics = {
  inspectionVolume: MonthVolume[]
  claimBreakdown: ClaimSlice[]
  cycleTimeTrend: CyclePoint[]
  staffProductivity: ProductivityRow[]
}
