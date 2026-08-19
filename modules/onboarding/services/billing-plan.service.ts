import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import type { CatalogPlan, CompanySessionPayload } from "@/modules/onboarding/types/onboarding.types"

export const billingPlanService = {
  async list() {
    const response = await apiClient.get(endpoints.subscriptions.plans)
    return unwrap<{ plans: CatalogPlan[] }>(response.data)
  },

  async start(planId: string) {
    const response = await apiClient.post(endpoints.subscriptions.start, {
      planId,
      interval: "monthly",
    })
    return unwrap<CompanySessionPayload>(response.data)
  },
}
