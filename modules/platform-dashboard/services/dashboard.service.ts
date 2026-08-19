import { endpoints } from "@/lib/api/endpoints"
import { apiGet } from "@/lib/api/request"
import { getPlatformDashboardMock } from "@/modules/platform-dashboard/mocks/dashboard.mock"

export const platformDashboardService = {
  get: () => apiGet(endpoints.dashboard.platform, getPlatformDashboardMock),
}
