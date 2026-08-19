"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { companyDashboardService } from "@/modules/company-dashboard/services/dashboard.service"

export function useCompanyActivity() {
  return useAsyncData(() => companyDashboardService.activity(), "company-activity")
}
