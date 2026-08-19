"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { analyticsService } from "@/modules/analytics/services/analytics.service"

export function useCompanyAnalytics() {
  return useAsyncData(() => analyticsService.company(), "company-analytics")
}
