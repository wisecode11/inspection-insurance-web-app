import { endpoints } from "@/lib/api/endpoints"
import { apiGet } from "@/lib/api/request"
import {
  listApiVolumeMock,
  listTenantGrowthMock,
  listUsageByTenantMock,
} from "@/modules/platform-usage/mocks/usage.mock"

export const usageService = {
  byTenant: () => apiGet(endpoints.usage.summary, listUsageByTenantMock),
  apiVolume: () => apiGet(endpoints.usage.apiVolume, listApiVolumeMock),
  tenantGrowth: () => apiGet("/usage/tenant-growth", listTenantGrowthMock),
}
