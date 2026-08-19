"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { platformDashboardService } from "@/modules/platform-dashboard/services/dashboard.service"

export function usePlatformDashboard() {
  return useAsyncData(() => platformDashboardService.get(), "platform-dashboard")
}
