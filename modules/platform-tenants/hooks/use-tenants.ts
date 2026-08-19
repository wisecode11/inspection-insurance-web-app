"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { tenantService } from "@/modules/platform-tenants/services/tenant.service"

export function useTenants() {
  return useAsyncData(() => tenantService.list(), "tenants")
}
