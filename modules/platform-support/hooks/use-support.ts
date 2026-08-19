"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { supportService } from "@/modules/platform-support/services/support.service"
import { tenantService } from "@/modules/platform-tenants/services/tenant.service"

export function useSupport() {
  return useAsyncData(async () => {
    const [tickets, tenants] = await Promise.all([
      supportService.listTickets(),
      tenantService.list(),
    ])
    return { tickets, tenants }
  }, "support")
}
