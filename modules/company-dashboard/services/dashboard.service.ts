import { endpoints } from "@/lib/api/endpoints"
import { apiGet } from "@/lib/api/request"
import { listCompanyActivityMock } from "@/modules/company-dashboard/mocks/activity.mock"

export const companyDashboardService = {
  activity: () => apiGet(endpoints.dashboard.company, listCompanyActivityMock),
}
