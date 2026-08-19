import { endpoints } from "@/lib/api/endpoints"
import { apiGet, apiPost } from "@/lib/api/request"
import { getTenantMock, listTenantsMock, suspendTenantMock } from "@/modules/platform-tenants/mocks/tenant.mock"
import type { Tenant } from "@/modules/platform-tenants/types/tenant.types"

export const tenantService = {
  list: () => apiGet(endpoints.tenants.list, listTenantsMock),
  getById: (id: string) => apiGet(endpoints.tenants.byId(id), () => getTenantMock(id)),
  suspend: (id: string) => apiPost(endpoints.tenants.suspend(id), undefined, () => suspendTenantMock(id)),
  recent: async () => {
    const rows = await tenantService.list()
    return rows
      .slice()
      .sort((a, b) => (a.created < b.created ? 1 : -1))
      .slice(0, 6)
  },
}

export type { Tenant }
