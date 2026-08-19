"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { billingService } from "@/modules/platform-billing/services/billing.service"
import { tenantService } from "@/modules/platform-tenants/services/tenant.service"

export function useBilling() {
  return useAsyncData(async () => {
    const [rows, plans, tenants] = await Promise.all([
      billingService.list(),
      billingService.plans(),
      tenantService.list(),
    ])
    return { rows, plans, tenants }
  }, "billing")
}
