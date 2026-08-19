import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import type { CompanySessionPayload, OrganizationInput } from "@/modules/onboarding/types/onboarding.types"
import type { CompanySummary } from "@/types/company"

export const organizationService = {
  async list() {
    const response = await apiClient.get(endpoints.companies.list)
    return unwrap<{ companies: CompanySummary[] }>(response.data)
  },

  async create(input: OrganizationInput) {
    const response = await apiClient.post(endpoints.companies.create, input)
    return unwrap<CompanySessionPayload>(response.data)
  },
}
