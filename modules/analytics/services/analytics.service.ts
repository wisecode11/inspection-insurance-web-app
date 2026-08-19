import { endpoints } from "@/lib/api/endpoints"
import { apiGet } from "@/lib/api/request"
import { getCompanyAnalyticsMock } from "@/modules/analytics/mocks/analytics.mock"

export const analyticsService = {
  company: () => apiGet(endpoints.analytics.company, getCompanyAnalyticsMock),
}
