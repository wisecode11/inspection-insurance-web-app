import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import type { CompanyAnalytics } from "@/modules/analytics/types/analytics.types"

export const analyticsService = {
  async company(): Promise<CompanyAnalytics> {
    const response = await apiClient.get(endpoints.analytics.company)
    return unwrap<CompanyAnalytics>(response.data)
  },
}
