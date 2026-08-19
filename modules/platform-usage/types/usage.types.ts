export type UsageRow = {
  name: string
  storage: number
  inspections: number
  api: number
}

export type TenantGrowthPoint = {
  month: string
  tenants: number
  mrr: number
}

export type ApiVolumePoint = {
  day: string
  calls: number
}
