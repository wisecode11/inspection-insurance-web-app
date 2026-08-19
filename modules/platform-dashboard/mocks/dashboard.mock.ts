import { listTenantGrowthMock } from "@/modules/platform-usage/mocks/usage.mock"
import { listTenantsMock } from "@/modules/platform-tenants/mocks/tenant.mock"
import type { Tenant } from "@/modules/platform-tenants/types/tenant.types"
import type { TenantGrowthPoint } from "@/modules/platform-usage/types/usage.types"

export type PlatformDashboard = {
  recentTenants: Tenant[]
  tenantGrowth: TenantGrowthPoint[]
}

export function getPlatformDashboardMock(): PlatformDashboard {
  return {
    recentTenants: listTenantsMock()
      .slice()
      .sort((a, b) => (a.created < b.created ? 1 : -1))
      .slice(0, 6),
    tenantGrowth: listTenantGrowthMock(),
  }
}
