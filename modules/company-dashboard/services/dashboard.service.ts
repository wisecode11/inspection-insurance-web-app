import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import type { CompanyDashboardData } from "@/modules/company-dashboard/types/dashboard.types"

export const companyDashboardService = {
  async overview() {
    const response = await apiClient.get(endpoints.dashboard.company)
    return unwrap<CompanyDashboardData>(response.data)
  },
}
