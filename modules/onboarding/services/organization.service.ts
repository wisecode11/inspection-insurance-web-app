import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import type { CompanySessionPayload, OrganizationInput } from "@/modules/onboarding/types/onboarding.types"

export const organizationService = {
  async create(input: OrganizationInput) {
    const response = await apiClient.post(endpoints.companies.create, input)
    return unwrap<CompanySessionPayload>(response.data)
  },
}
