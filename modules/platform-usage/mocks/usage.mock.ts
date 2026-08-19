import { listTenantsMock } from "@/modules/platform-tenants/mocks/tenant.mock"
import type { ApiVolumePoint, TenantGrowthPoint, UsageRow } from "@/modules/platform-usage/types/usage.types"

export function listTenantGrowthMock(): TenantGrowthPoint[] {
  return [
    { month: "Feb", tenants: 22, mrr: 14200 },
    { month: "Mar", tenants: 25, mrr: 15800 },
    { month: "Apr", tenants: 28, mrr: 17600 },
    { month: "May", tenants: 31, mrr: 19900 },
    { month: "Jun", tenants: 34, mrr: 22400 },
    { month: "Jul", tenants: 38, mrr: 25100 },
    { month: "Aug", tenants: 42, mrr: 28640 },
  ]
}

export function listApiVolumeMock(): ApiVolumePoint[] {
  return [
    { day: "Mon", calls: 42000 },
    { day: "Tue", calls: 51000 },
    { day: "Wed", calls: 48500 },
    { day: "Thu", calls: 60200 },
    { day: "Fri", calls: 58800 },
    { day: "Sat", calls: 21400 },
    { day: "Sun", calls: 18900 },
  ]
}

export function listUsageByTenantMock(): UsageRow[] {
  return listTenantsMock()
    .filter((t) => t.status !== "trial")
    .map((t) => ({
      name: t.name,
      storage: t.storageGb,
      inspections: t.inspections,
      api: Math.round(t.inspections * 3.4),
    }))
    .sort((a, b) => b.inspections - a.inspections)
    .slice(0, 8)
}
