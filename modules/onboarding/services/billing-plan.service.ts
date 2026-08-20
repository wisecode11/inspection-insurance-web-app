import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import type { CatalogPlan, CompanySessionPayload } from "@/modules/onboarding/types/onboarding.types"

export type BillingMode = "trial" | "monthly" | "yearly"

export const billingPlanService = {
  async list() {
    const response = await apiClient.get(endpoints.subscriptions.plans)
    return unwrap<{ plans: CatalogPlan[] }>(response.data)
  },

  async start(planId: string, mode: BillingMode = "trial") {
    const response = await apiClient.post(endpoints.subscriptions.start, {
      planId,
      mode,
      interval: mode === "yearly" ? "yearly" : "monthly",
    })
    return unwrap<CompanySessionPayload>(response.data)
  },
}
