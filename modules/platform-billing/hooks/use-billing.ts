"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { billingService } from "@/modules/platform-billing/services/billing.service"

export function useBilling() {
  return useAsyncData(async () => {
    const [rows, plans] = await Promise.all([billingService.list(), billingService.plans()])
    return { rows, plans }
  }, "billing")
}
