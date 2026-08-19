import { endpoints } from "@/lib/api/endpoints"
import { apiGet, apiPost } from "@/lib/api/request"
import { listBillingMock, listPlansMock } from "@/modules/platform-billing/mocks/billing.mock"
import type { BillingRow } from "@/modules/platform-billing/types/billing.types"

export const billingService = {
  list: () => apiGet(endpoints.billing.list, listBillingMock),
  plans: () => apiGet(endpoints.billing.plans, listPlansMock),
  retry: (id: string) => apiPost(endpoints.billing.retry(id), undefined, () => ({ id }) as BillingRow | { id: string }),
}
