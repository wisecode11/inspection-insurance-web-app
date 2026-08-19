"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { usageService } from "@/modules/platform-usage/services/usage.service"

export function useUsage() {
  return useAsyncData(async () => {
    const [byTenant, apiVolume] = await Promise.all([
      usageService.byTenant(),
      usageService.apiVolume(),
    ])
    return { byTenant, apiVolume }
  }, "usage")
}
