import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import type { CatalogPlan } from "@/modules/onboarding/types/onboarding.types"
import type { BillingInvoice, BillingOverview } from "@/modules/billing/types/billing.types"

export const billingService = {
  async overview() {
    const response = await apiClient.get(endpoints.subscriptions.me)
    return unwrap<BillingOverview>(response.data)
  },

  async plans() {
    const response = await apiClient.get(endpoints.subscriptions.plans)
    return unwrap<{ plans: CatalogPlan[] }>(response.data)
  },

  async invoices() {
    const response = await apiClient.get(endpoints.subscriptions.invoices)
    return unwrap<{ invoices: BillingInvoice[] }>(response.data)
  },

  async changePlan(planId: string, interval: "monthly" | "yearly") {
    const response = await apiClient.patch(endpoints.subscriptions.changePlan, {
      planId,
      interval,
    })
    return unwrap<BillingOverview>(response.data)
  },

  async cancel(immediate = false) {
    const response = await apiClient.post(endpoints.subscriptions.cancel, { immediate })
    return unwrap<BillingOverview>(response.data)
  },

  async updatePaymentMethod(input: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }) {
    const response = await apiClient.put(endpoints.subscriptions.paymentMethod, input)
    return unwrap<BillingOverview>(response.data)
  },
}
